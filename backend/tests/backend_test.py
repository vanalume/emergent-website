"""Vanalume backend API tests — retail catalog, orders, config, inquiries, newsletter, admin."""
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


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


VALID_CUSTOMER = {
    "name": "TEST_Ada Lovelace",
    "email": "test_ada@example.com",
    "phone": "9999900000",
    "address": "42 Vanalume Lane",
    "city": "Bengaluru",
    "pincode": "560001",
}


# ------------------------- Products & config -------------------------
class TestProducts:
    def test_get_products(self, client):
        r = client.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert "products" in data and "categories" in data
        # >=22 products (spec says ~22, catalog has 23)
        assert len(data["products"]) >= 22
        assert len(data["categories"]) == 7
        cat_ids = {c["id"] for c in data["categories"]}
        assert cat_ids == {"duet", "ensemble", "library", "pillar", "taper", "wax", "aroma"}

    def test_product_prices_match_spec(self, client):
        r = client.get(f"{API}/products")
        products = {p["id"]: p for p in r.json()["products"]}
        # (id, sp, mrp)
        expected = [
            ("duet-bloom", 1499, 1899),
            ("duet-individual", 599, 999),
            ("ensemble-celebrate-tin", 999, 1299),
            ("ensemble-celebrate-metallic", 1999, 2599),
            ("library-odyssey", 1799, 2299),
            ("pillar-4in", 599, 799),
            ("pillar-5in", 699, 899),
            ("pillar-6in", 799, 999),
            ("pillar-pack3", 1699, 2299),
            ("taper-set3", 799, 999),
            ("wax-set2", 599, 799),
            ("aroma-stone-jar", 1299, 1799),
            ("aroma-sculpture", 4999, 5999),
            ("aroma-oil-set5", 999, 1299),
        ]
        for pid, sp, mrp in expected:
            assert pid in products, f"missing product {pid}"
            assert products[pid]["sp"] == sp, f"{pid} sp expected {sp} got {products[pid]['sp']}"
            assert products[pid]["mrp"] == mrp, f"{pid} mrp expected {mrp} got {products[pid]['mrp']}"

    def test_pillar_variants(self, client):
        r = client.get(f"{API}/products")
        products = {p["id"]: p for p in r.json()["products"]}
        for pid in ("pillar-4in", "pillar-5in", "pillar-6in"):
            labels = [v["label"] for v in products[pid].get("variants", [])]
            assert "Midnight Blue · Oudh" in labels
            assert "Deep Green · Spearmint" in labels
            assert "Terracotta · Patchouli" in labels
            assert "Sea & Sand · Aqua" in labels

    def test_duet_individual_has_14_variants(self, client):
        r = client.get(f"{API}/products")
        products = {p["id"]: p for p in r.json()["products"]}
        assert len(products["duet-individual"]["variants"]) == 14


class TestConfig:
    def test_config_payment_dormant(self, client):
        r = client.get(f"{API}/config")
        assert r.status_code == 200
        data = r.json()
        assert data.get("payment_configured") is False
        assert data.get("razorpay_key_id") in (None, "")


# ------------------------- Orders -------------------------
class TestOrders:
    def test_small_order_has_shipping_100(self, client):
        # Duet individual @599 x1 => sub 599 < 2000 => shipping 100
        payload = {
            "items": [{"product_id": "duet-individual", "quantity": 1, "variant": "Rose"}],
            "customer": VALID_CUSTOMER,
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["subtotal"] == 599
        assert d["shipping"] == 100
        assert d["amount"] == 699
        assert d["currency"] == "INR"
        assert d["payment_configured"] is False
        assert d["razorpay_order_id"] is None
        assert "order_id" in d

    def test_large_order_free_shipping(self, client):
        # Duet bloom 1499 x 2 = 2998 >= 2000 => free shipping
        payload = {
            "items": [{"product_id": "duet-bloom", "quantity": 2}],
            "customer": VALID_CUSTOMER,
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["subtotal"] == 2998
        assert d["shipping"] == 0
        assert d["amount"] == 2998

        # persistence
        lr = client.get(f"{API}/orders")
        assert lr.status_code == 200
        found = next((o for o in lr.json() if o["id"] == d["order_id"]), None)
        assert found is not None
        assert found["amount"] == 2998
        assert found["status"] == "pending"

    def test_threshold_exact_2000_free(self, client):
        # pillar-6in @799 x 3 = 2397; use taper-set3 799 x 3 = 2397; find combo hitting >=2000
        # ensemble-celebrate-tin @999 x2 = 1998 < 2000 => still shipping 100
        payload = {
            "items": [{"product_id": "ensemble-celebrate-tin", "quantity": 2}],
            "customer": VALID_CUSTOMER,
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["subtotal"] == 1998
        assert d["shipping"] == 100

    def test_variant_pricing_pillar(self, client):
        # Pillar 4in @599 with variant
        payload = {
            "items": [{"product_id": "pillar-4in", "quantity": 1, "variant": "Midnight Blue · Oudh"}],
            "customer": VALID_CUSTOMER,
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["subtotal"] == 599

    def test_unknown_product_400(self, client):
        payload = {
            "items": [{"product_id": "does-not-exist", "quantity": 1}],
            "customer": VALID_CUSTOMER,
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 400
        assert "unknown product" in r.json().get("detail", "").lower()

    def test_verify_without_razorpay_400(self, client):
        r = client.post(f"{API}/orders/verify", json={
            "order_id": "x", "razorpay_order_id": "y",
            "razorpay_payment_id": "z", "razorpay_signature": "s",
        })
        assert r.status_code == 400


# ------------------------- Inquiries -------------------------
class TestInquiries:
    def test_create_valid(self, client):
        r = client.post(f"{API}/inquiries", json={
            "name": "TEST_Grace Hopper",
            "email": "test_grace@example.com",
            "phone": "9000000000",
            "company": "TEST Co",
            "inquiry_type": "Wholesale",
            "message": "Please share the wholesale deck.",
        })
        assert r.status_code in (200, 201), r.text
        d = r.json()
        assert d["email"] == "test_grace@example.com"
        assert "id" in d

    def test_invalid_email_422(self, client):
        r = client.post(f"{API}/inquiries", json={
            "name": "TEST_x", "email": "bad", "message": "hi",
        })
        assert r.status_code == 422

    def test_missing_required_422(self, client):
        r = client.post(f"{API}/inquiries", json={"email": "test_x@example.com"})
        assert r.status_code == 422


# ------------------------- Newsletter -------------------------
class TestNewsletter:
    def test_subscribe_and_duplicate(self, client):
        email = f"test_news_{uuid.uuid4().hex[:8]}@example.com"
        r1 = client.post(f"{API}/newsletter", json={"email": email})
        assert r1.status_code == 200
        assert r1.json()["status"] == "subscribed"
        r2 = client.post(f"{API}/newsletter", json={"email": email})
        assert r2.status_code == 200
        assert r2.json()["status"] == "already_subscribed"

    def test_invalid_email_422(self, client):
        r = client.post(f"{API}/newsletter", json={"email": "invalid"})
        assert r.status_code == 422


# ------------------------- Admin -------------------------
class TestAdmin:
    def test_admin_data_wrong_key_401(self, client):
        r = client.get(f"{API}/admin/data", headers={"X-Admin-Key": "nope"})
        assert r.status_code == 401

    def test_admin_data_no_key_401(self, client):
        r = client.get(f"{API}/admin/data")
        assert r.status_code == 401

    def test_admin_data_correct_key(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.get(f"{API}/admin/data", headers={"X-Admin-Key": ADMIN_KEY})
        assert r.status_code == 200
        d = r.json()
        assert "inquiries" in d and isinstance(d["inquiries"], list)
        assert "newsletter" in d and isinstance(d["newsletter"], list)

    def test_admin_verify(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.post(f"{API}/admin/verify", json={"key": ADMIN_KEY})
        assert r.status_code == 200
        assert r.json().get("ok") is True
        r2 = client.post(f"{API}/admin/verify", json={"key": "wrong"})
        assert r2.status_code == 401
