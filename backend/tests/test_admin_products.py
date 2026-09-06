"""HTTP tests for admin product CRUD (requires a running backend)."""
import os
import uuid

import pytest
import requests

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

VALID_CUSTOMER = {
    "name": "TEST_Product",
    "email": "test_product@example.com",
    "phone": "9999900000",
    "address": "42 Vanalume Lane",
    "city": "Bengaluru",
    "pincode": "560001",
}


@pytest.fixture(scope="module")
def client():
    return requests.Session()


def _hdr():
    return {"X-Admin-Key": ADMIN_KEY}


def _new_id():
    return f"zzz-test-{uuid.uuid4().hex[:8]}"


def _product(**overrides):
    payload = {
        "id": _new_id(),
        "name": "Z Test Product",
        "collection": "Z Collection",
        "category": "jar-candles",
        "subcategory": None,
        "mrp": 1000,
        "sp": 800,
        "images": ["https://example.com/x.png"],
        "desc": "test desc",
        "long_desc": "test long desc",
        "draft": False,
        "stock": 10,
    }
    payload.update(overrides)
    return payload


class TestAuth:
    def test_list_requires_auth(self, client):
        assert client.get(f"{API}/admin/products").status_code == 401

    def test_create_requires_auth(self, client):
        r = client.post(f"{API}/admin/products", json=_product())
        assert r.status_code == 401

    def test_update_requires_auth(self, client):
        r = client.put(f"{API}/admin/products/x", json=_product(id="x"))
        assert r.status_code == 401

    def test_delete_requires_auth(self, client):
        r = client.delete(f"{API}/admin/products/x")
        assert r.status_code == 401


class TestList:
    def test_list_returns_seeded_products(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.get(f"{API}/admin/products", headers=_hdr())
        assert r.status_code == 200
        ids = {p["id"] for p in r.json()}
        assert "duet-awaken" in ids


class TestCreate:
    def test_create_appears_in_public_products(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        payload = _product()
        r = client.post(f"{API}/admin/products", json=payload, headers=_hdr())
        try:
            assert r.status_code == 201, r.text
            assert r.json()["id"] == payload["id"]
            pub = client.get(f"{API}/products").json()
            assert any(p["id"] == payload["id"] for p in pub["products"])
        finally:
            client.delete(f"{API}/admin/products/{payload['id']}", headers=_hdr())

    def test_duplicate_id_conflict(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        payload = _product(id="duet-awaken")
        r = client.post(f"{API}/admin/products", json=payload, headers=_hdr())
        assert r.status_code == 409

    def test_invalid_slug_rejected(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.post(f"{API}/admin/products", json=_product(id="Bad Slug!"), headers=_hdr())
        assert r.status_code == 422

    def test_missing_name_rejected(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        p = _product()
        del p["name"]
        r = client.post(f"{API}/admin/products", json=p, headers=_hdr())
        assert r.status_code == 422

    def test_nonexistent_category_rejected(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.post(f"{API}/admin/products", json=_product(category="zzz-nonexistent"), headers=_hdr())
        assert r.status_code == 400


class TestUpdate:
    def test_update_sp_reflected(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        payload = _product()
        client.post(f"{API}/admin/products", json=payload, headers=_hdr())
        try:
            payload["sp"] = 1234
            r = client.put(f"{API}/admin/products/{payload['id']}", json=payload, headers=_hdr())
            assert r.status_code == 200, r.text
            assert r.json()["sp"] == 1234
            pub = client.get(f"{API}/products").json()
            prod = next(p for p in pub["products"] if p["id"] == payload["id"])
            assert prod["sp"] == 1234
        finally:
            client.delete(f"{API}/admin/products/{payload['id']}", headers=_hdr())

    def test_update_missing_404(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.put(f"{API}/admin/products/zzz-nonexistent", json=_product(id="zzz-nonexistent"), headers=_hdr())
        assert r.status_code == 404


class TestVariants:
    def test_variant_roundtrip(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        payload = _product(
            variants=[
                {"label": "V1", "sku": "sk1", "sp": 750, "mrp": 900, "images": ["https://example.com/v1.png"]},
                {"label": "Large", "sp": 1200, "mrp": 1500, "desc": "big", "images": ["https://example.com/l.png"]},
            ],
        )
        r = client.post(f"{API}/admin/products", json=payload, headers=_hdr())
        try:
            assert r.status_code == 201, r.text
            assert r.json()["variants"][0]["images"] == ["https://example.com/v1.png"]
            assert r.json()["variants"][1]["desc"] == "big"
        finally:
            client.delete(f"{API}/admin/products/{payload['id']}", headers=_hdr())


class TestDelete:
    def test_delete_then_404(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        payload = _product()
        client.post(f"{API}/admin/products", json=payload, headers=_hdr())
        r = client.delete(f"{API}/admin/products/{payload['id']}", headers=_hdr())
        assert r.status_code == 200
        r2 = client.delete(f"{API}/admin/products/{payload['id']}", headers=_hdr())
        assert r2.status_code == 404


class TestPricing:
    def test_order_uses_variant_sp(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        payload = _product(
            sp=800,
            variants=[{"label": "Large", "sp": 1200, "mrp": 1500, "images": [], "stock": 10}],
        )
        client.post(f"{API}/admin/products", json=payload, headers=_hdr())
        try:
            r = client.post(f"{API}/orders", json={
                "items": [{"product_id": payload["id"], "quantity": 1, "variant": "Large"}],
                "customer": VALID_CUSTOMER,
            })
            assert r.status_code == 200, r.text
            assert r.json()["subtotal"] == 1200
        finally:
            client.delete(f"{API}/admin/products/{payload['id']}", headers=_hdr())
