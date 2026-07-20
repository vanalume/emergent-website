"""Vanalume backend API tests — products, config, orders, inquiries, newsletter."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback: try to read the frontend .env directly if the var wasn't exported
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


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ------------------------- Products & config -------------------------
class TestProducts:
    def test_get_products_returns_23_and_7_categories(self, client):
        r = client.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert "products" in data and "categories" in data
        assert len(data["products"]) == 23, f"expected 23 products, got {len(data['products'])}"
        assert len(data["categories"]) == 7, f"expected 7 categories, got {len(data['categories'])}"
        cat_ids = {c["id"] for c in data["categories"]}
        assert cat_ids == {"duet", "ensemble", "library", "pillar", "taper", "wax", "stone"}

    def test_duet_fragrance_pairs(self, client):
        r = client.get(f"{API}/products")
        products = {p["id"]: p for p in r.json()["products"]}
        assert products["duet-awaken"]["fragrances"] == ["Lemongrass", "Cedarwood"]
        assert products["duet-bloom"]["fragrances"] == ["Rose", "Jasmine"]
        assert products["duet-clarity"]["fragrances"] == ["White Sage", "Aqua"]
        assert products["duet-equilibrium"]["fragrances"] == ["Tea Tree", "Sandalwood"]
        assert products["duet-intimacy"]["fragrances"] == ["Lavender", "Mogra"]
        # Prices
        assert products["duet-bloom"]["price"] == 1500
        assert products["ensemble-celebrate"]["price"] == 1200
        assert products["library-odyssey"]["price"] == 1800
        assert products["pillar-midnight-blue"]["price"] == 600
        assert products["taper-plain-trio"]["price"] == 1200
        assert products["taper-beaded"]["price"] == 450
        assert products["wax-clove-cinnamon"]["price"] == 600
        # Aroma stones priced by weight
        assert products["stone-ceramic-pot"]["price"] is None
        assert products["stone-ceramic-pot"].get("enquire") is True


class TestConfig:
    def test_config_payment_not_configured(self, client):
        r = client.get(f"{API}/config")
        assert r.status_code == 200
        data = r.json()
        assert data.get("payment_configured") is False
        assert data.get("razorpay_key_id") in (None, "")


# ------------------------- Orders -------------------------
VALID_CUSTOMER = {
    "name": "TEST_Ada Lovelace",
    "email": "test_ada@example.com",
    "phone": "9999900000",
    "address": "42 Vanalume Lane",
    "city": "Bengaluru",
    "pincode": "560001",
}


class TestOrders:
    def test_create_order_duet_bloom_qty2_amount_3000(self, client):
        payload = {
            "items": [{"product_id": "duet-bloom", "quantity": 2}],
            "customer": VALID_CUSTOMER,
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["amount"] == 3000
        assert data["currency"] == "INR"
        assert data["payment_configured"] is False
        assert data["razorpay_order_id"] is None
        assert "order_id" in data
        # Verify persistence via GET /orders (list)
        lr = client.get(f"{API}/orders")
        assert lr.status_code == 200
        orders = lr.json()
        found = next((o for o in orders if o["id"] == data["order_id"]), None)
        assert found is not None, "created order not present in list"
        assert found["amount"] == 3000
        assert found["status"] == "pending"
        assert found["items"][0]["product_id"] == "duet-bloom"
        assert found["items"][0]["quantity"] == 2

    def test_order_with_aroma_stone_rejected(self, client):
        payload = {
            "items": [{"product_id": "stone-ceramic-pot", "quantity": 1}],
            "customer": VALID_CUSTOMER,
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 400, r.text
        assert "weight" in r.json().get("detail", "").lower()

    def test_order_unknown_product_rejected(self, client):
        payload = {
            "items": [{"product_id": "does-not-exist", "quantity": 1}],
            "customer": VALID_CUSTOMER,
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 400, r.text
        assert "unknown product" in r.json().get("detail", "").lower()

    def test_order_with_variant_and_multi_line(self, client):
        payload = {
            "items": [
                {"product_id": "pillar-midnight-blue", "quantity": 1, "variant": "5 inch"},
                {"product_id": "duet-awaken", "quantity": 1},
            ],
            "customer": VALID_CUSTOMER,
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["amount"] == 600 + 1500


# ------------------------- Inquiries -------------------------
class TestInquiries:
    def test_create_valid_inquiry(self, client):
        payload = {
            "name": "TEST_Grace Hopper",
            "email": "test_grace@example.com",
            "phone": "9000000000",
            "company": "TEST Co",
            "inquiry_type": "Wholesale",
            "message": "Please share the wholesale deck.",
        }
        r = client.post(f"{API}/inquiries", json=payload)
        assert r.status_code in (200, 201), r.text
        data = r.json()
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["message"] == payload["message"]
        assert "id" in data and "created_at" in data
        return data["id"]

    def test_invalid_email_422(self, client):
        r = client.post(f"{API}/inquiries", json={
            "name": "TEST_Bad Email",
            "email": "not-an-email",
            "message": "hello",
        })
        assert r.status_code == 422

    def test_missing_required_422(self, client):
        r = client.post(f"{API}/inquiries", json={"email": "test_x@example.com"})
        assert r.status_code == 422

    def test_list_inquiries_newest_first(self, client):
        # Create two with unique markers so we can look for them
        m1 = f"TEST_MARK_{uuid.uuid4().hex[:8]}"
        m2 = f"TEST_MARK_{uuid.uuid4().hex[:8]}"
        client.post(f"{API}/inquiries", json={
            "name": "TEST_First", "email": "test_first@example.com", "message": m1
        })
        client.post(f"{API}/inquiries", json={
            "name": "TEST_Second", "email": "test_second@example.com", "message": m2
        })
        r = client.get(f"{API}/inquiries")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 2
        # Newest should come first — created_at descending
        created = [i["created_at"] for i in items]
        assert created == sorted(created, reverse=True), "inquiries not sorted newest-first"
        # Both markers should be present
        msgs = [i["message"] for i in items]
        assert m1 in msgs and m2 in msgs


# ------------------------- Newsletter -------------------------
class TestNewsletter:
    def test_subscribe_and_duplicate(self, client):
        email = f"test_news_{uuid.uuid4().hex[:8]}@example.com"
        r1 = client.post(f"{API}/newsletter", json={"email": email})
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["email"] == email
        assert d1["status"] == "subscribed"
        r2 = client.post(f"{API}/newsletter", json={"email": email})
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["status"] == "already_subscribed"

    def test_invalid_email_422(self, client):
        r = client.post(f"{API}/newsletter", json={"email": "invalid"})
        assert r.status_code == 422
