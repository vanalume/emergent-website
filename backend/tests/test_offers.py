"""HTTP tests for seasonal offers (requires a running backend)."""
import os
import uuid
from datetime import datetime, timezone

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
    "name": "TEST_Offer",
    "email": "test_offer@example.com",
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


def _new_offer(client, **overrides):
    payload = {
        "name": f"Z Offer {uuid.uuid4().hex[:6]}",
        "category_ids": ["jar-candles"],
        "discount_percent": 20,
        "active": True,
    }
    payload.update(overrides)
    return client.post(f"{API}/admin/offers", json=payload, headers=_hdr())


def _delete_offer(client, offer_id):
    if offer_id:
        client.delete(f"{API}/admin/offers/{offer_id}", headers=_hdr())


class TestAuth:
    def test_endpoints_require_auth(self, client):
        assert client.get(f"{API}/admin/offers").status_code == 401
        assert client.post(f"{API}/admin/offers", json={}).status_code == 401
        assert client.put(f"{API}/admin/offers/x", json={}).status_code == 401
        assert client.delete(f"{API}/admin/offers/x").status_code == 401


class TestCreateList:
    def test_create_appears_in_active(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = _new_offer(client)
        offer_id = r.json().get("id") if r.status_code == 201 else None
        try:
            assert r.status_code == 201, r.text
            active = client.get(f"{API}/offers/active").json()
            assert any(o["id"] == offer_id for o in active)
        finally:
            _delete_offer(client, offer_id)

    def test_invalid_discount_rejected(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        assert _new_offer(client, discount_percent=95).status_code == 422

    def test_nonexistent_category_rejected(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        assert _new_offer(client, category_ids=["zzz-nonexistent"]).status_code == 400


class TestPricing:
    def test_products_reflect_discount(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = _new_offer(client, discount_percent=20)
        offer_id = r.json().get("id") if r.status_code == 201 else None
        try:
            products = client.get(f"{API}/products").json()["products"]
            duet = next(p for p in products if p["id"] == "duet-bloom")
            assert duet["offer_price"] == 1199
            assert duet["offer"]["discount_percent"] == 20
        finally:
            _delete_offer(client, offer_id)

    def test_order_subtotal_discounted(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = _new_offer(client, discount_percent=20)
        offer_id = r.json().get("id") if r.status_code == 201 else None
        try:
            resp = client.post(f"{API}/orders", json={
                "items": [{"product_id": "duet-bloom", "quantity": 1}],
                "customer": VALID_CUSTOMER,
            })
            assert resp.status_code == 200, resp.text
            assert resp.json()["subtotal"] == 1199
        finally:
            _delete_offer(client, offer_id)

    def test_higher_discount_wins(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        a = _new_offer(client, discount_percent=10)
        b = _new_offer(client, discount_percent=30)
        id_a = a.json().get("id") if a.status_code == 201 else None
        id_b = b.json().get("id") if b.status_code == 201 else None
        try:
            products = client.get(f"{API}/products").json()["products"]
            duet = next(p for p in products if p["id"] == "duet-bloom")
            assert duet["offer_price"] == 1049
        finally:
            _delete_offer(client, id_a)
            _delete_offer(client, id_b)

    def test_inactive_offer_no_discount(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = _new_offer(client, discount_percent=20, active=False)
        offer_id = r.json().get("id") if r.status_code == 201 else None
        try:
            products = client.get(f"{API}/products").json()["products"]
            duet = next(p for p in products if p["id"] == "duet-bloom")
            assert duet["offer_price"] is None
            assert duet["offer"] is None
        finally:
            _delete_offer(client, offer_id)

    def test_expired_offer_no_discount(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = _new_offer(client, discount_percent=20, ends_at="2000-01-01")
        offer_id = r.json().get("id") if r.status_code == 201 else None
        try:
            products = client.get(f"{API}/products").json()["products"]
            duet = next(p for p in products if p["id"] == "duet-bloom")
            assert duet["offer_price"] is None
        finally:
            _delete_offer(client, offer_id)

    def test_end_date_inclusive(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        r = _new_offer(client, discount_percent=20, ends_at=today)
        offer_id = r.json().get("id") if r.status_code == 201 else None
        try:
            products = client.get(f"{API}/products").json()["products"]
            duet = next(p for p in products if p["id"] == "duet-bloom")
            assert duet["offer_price"] == 1199  # still active on the end date
        finally:
            _delete_offer(client, offer_id)

    def test_variant_pricing(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = _new_offer(client, category_ids=["pillar"], discount_percent=20)
        offer_id = r.json().get("id") if r.status_code == 201 else None
        try:
            resp = client.post(f"{API}/orders", json={
                "items": [{"product_id": "pillar-midnight-blue", "quantity": 1, "variant": "5-inch"}],
                "customer": VALID_CUSTOMER,
            })
            assert resp.status_code == 200, resp.text
            assert resp.json()["subtotal"] == 559
        finally:
            _delete_offer(client, offer_id)

    def test_multi_category_offer(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = _new_offer(client, category_ids=["jar-candles", "pillar"], discount_percent=20)
        offer_id = r.json().get("id") if r.status_code == 201 else None
        try:
            products = client.get(f"{API}/products").json()["products"]
            duet = next(p for p in products if p["id"] == "duet-bloom")
            pillar = next(p for p in products if p["id"] == "pillar-midnight-blue")
            assert duet["offer_price"] == 1199
            assert pillar["offer_price"] == 479
        finally:
            _delete_offer(client, offer_id)
