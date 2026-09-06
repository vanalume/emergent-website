"""Tests for inventory: effective stock, admin zero-stock rules, order guard, and
atomic decrement (requires a running backend / MongoDB)."""
import asyncio
import os
import uuid

import pytest
import requests
from fastapi import HTTPException

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    try:
        with open("/app/frontend/.env") as f:
            for ln in f:
                if ln.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = ln.split("=", 1)[1].strip()
                    break
    except FileNotFoundError:
        pass
BASE_URL = (BASE_URL or "").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_KEY = ""
try:
    with open("/app/backend/.env") as f:
        for ln in f:
            if ln.startswith("ADMIN_KEY="):
                ADMIN_KEY = ln.split("=", 1)[1].strip().strip('"')
                break
except FileNotFoundError:
    pass


@pytest.fixture(scope="module")
def client():
    return requests.Session()


def _hdr():
    return {"X-Admin-Key": ADMIN_KEY}


def _slug(prefix="test-inv"):
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def _product(slug, stock=0, draft=True, variants=None):
    return {
        "id": slug,
        "category": "jar-candles",
        "collection": "Test",
        "name": f"Inventory Test {slug}",
        "mrp": 100,
        "sp": 90,
        "images": ["https://example.com/x.png"],
        "draft": draft,
        "stock": stock,
        "variants": variants or [],
    }


class TestEffectiveStock:
    def test_variant_sum(self):
        from inventory import effective_stock

        p = {"stock": 99, "variants": [{"label": "A", "stock": 2}, {"label": "B", "stock": 3}]}
        assert effective_stock(p) == 5

    def test_product_fallback(self):
        from inventory import effective_stock

        assert effective_stock({"stock": 7}) == 7
        assert effective_stock({"stock": 0, "variants": []}) == 0

    def test_missing_is_zero(self):
        from inventory import effective_stock

        assert effective_stock({}) == 0
        assert effective_stock({"variants": [{"label": "A"}]}) == 0


class TestAdminStockRules:
    def test_zero_stock_forces_draft_on_create(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        slug = _slug()
        r = client.post(f"{API}/admin/products", json=_product(slug, stock=0, draft=False), headers=_hdr())
        assert r.status_code == 201, r.text
        assert r.json()["draft"] is True
        client.delete(f"{API}/admin/products/{slug}", headers=_hdr())

    def test_in_stock_can_go_live(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        slug = _slug()
        r = client.post(f"{API}/admin/products", json=_product(slug, stock=5, draft=False), headers=_hdr())
        assert r.status_code == 201, r.text
        assert r.json()["draft"] is False
        client.delete(f"{API}/admin/products/{slug}", headers=_hdr())

    def test_update_to_zero_stock_autodrafts(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        slug = _slug()
        client.post(f"{API}/admin/products", json=_product(slug, stock=5, draft=False), headers=_hdr())
        r = client.put(
            f"{API}/admin/products/{slug}",
            json=_product(slug, stock=0, draft=False),
            headers=_hdr(),
        )
        assert r.status_code == 200, r.text
        assert r.json()["draft"] is True
        client.delete(f"{API}/admin/products/{slug}", headers=_hdr())


class TestOrderStockGuard:
    def test_order_rejected_when_insufficient_stock(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        slug = _slug()
        client.post(f"{API}/admin/products", json=_product(slug, stock=1, draft=False), headers=_hdr())
        try:
            payload = {
                "items": [{"product_id": slug, "quantity": 2}],
                "customer": {
                    "name": "Test", "email": "t@example.com", "phone": "9999999999",
                    "address": "1 Test Street", "state": "Karnataka", "pincode": "560001",
                },
            }
            r = client.post(f"{API}/orders", json=payload)
            assert r.status_code == 400, r.text
            assert "out of stock" in r.json()["detail"].lower()
        finally:
            client.delete(f"{API}/admin/products/{slug}", headers=_hdr())


class TestDecrementStock:
    def test_decrement_stock(self):
        # Single event loop: motor's client binds to the loop it first runs on,
        # so all async work lives inside one asyncio.run().
        async def run():
            from database import db
            from inventory import decrement_stock, effective_stock

            # Product-level: decrement to zero auto-drafts and blocks oversell.
            slug = _slug("test-dec")
            await db.products.insert_one(_product(slug, stock=1, draft=False))
            try:
                await decrement_stock([{"product_id": slug, "quantity": 1, "name": "X"}])
                p = await db.products.find_one({"id": slug})
                assert p["stock"] == 0
                assert p["draft"] is True

                with pytest.raises(HTTPException):
                    await decrement_stock([{"product_id": slug, "quantity": 1, "name": "X"}])
            finally:
                await db.products.delete_one({"id": slug})

            # Variant-level decrement hits the matching variant only.
            vslug = _slug("test-decvar")
            product = _product(vslug, stock=0, draft=False)
            product["variants"] = [
                {"label": "Small", "stock": 2},
                {"label": "Large", "stock": 1},
            ]
            await db.products.insert_one(product)
            try:
                await decrement_stock([{"product_id": vslug, "quantity": 1, "variant": "Large", "name": "X"}])
                p = await db.products.find_one({"id": vslug})
                assert effective_stock(p) == 2  # Small 2 + Large 0
                assert p["draft"] is False
            finally:
                await db.products.delete_one({"id": vslug})

        asyncio.run(run())


class TestPublicVisibility:
    def test_zero_stock_hidden_from_public(self):
        # Simulate legacy data: a live product whose stock was never set.
        slug = _slug("test-vis")

        async def run():
            from config import MONGO_URL, DB_NAME
            from motor.motor_asyncio import AsyncIOMotorClient

            client = AsyncIOMotorClient(MONGO_URL)
            db = client[DB_NAME]
            await db.products.insert_one(_product(slug, stock=0, draft=False))
            try:
                r = requests.get(f"{API}/products")
                assert r.status_code == 200
                assert all(p["id"] != slug for p in r.json()["products"])
            finally:
                await db.products.delete_one({"id": slug})

        asyncio.run(run())

    def test_in_stock_visible_in_public(self):
        # In-stock product appears in the public catalogue.
        slug = _slug("test-vis2")

        async def run():
            from config import MONGO_URL, DB_NAME
            from motor.motor_asyncio import AsyncIOMotorClient

            client = AsyncIOMotorClient(MONGO_URL)
            db = client[DB_NAME]
            await db.products.insert_one(_product(slug, stock=3, draft=False))
            try:
                r = requests.get(f"{API}/products")
                ids = {p["id"] for p in r.json()["products"]}
                assert slug in ids
            finally:
                await db.products.delete_one({"id": slug})

        asyncio.run(run())
