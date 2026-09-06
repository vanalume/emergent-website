"""HTTP tests for the sales analytics dashboard (requires a running backend + Mongo access)."""
import os
import uuid

import pymongo
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


def _read_env(key):
    val = os.environ.get(key)
    if val:
        return val
    try:
        with open("/app/backend/.env") as f:
            for ln in f:
                if ln.startswith(key + "="):
                    return ln.split("=", 1)[1].strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return ""


ADMIN_KEY = _read_env("ADMIN_KEY")
MONGO_URL = _read_env("MONGO_URL")
DB_NAME = _read_env("DB_NAME")


@pytest.fixture(scope="module")
def client():
    return requests.Session()


def _hdr():
    return {"X-Admin-Key": ADMIN_KEY}


def _db():
    client = pymongo.MongoClient(MONGO_URL, serverSelectionTimeoutMS=10000)
    return client, client[DB_NAME]


def _insert_paid_order(amount, items, paid_at="2026-01-15T12:00:00+00:00"):
    oid = f"zzz-test-{uuid.uuid4().hex[:8]}"
    client, db = _db()
    db.orders.insert_one({
        "id": oid,
        "status": "paid",
        "currency": "INR",
        "subtotal": amount,
        "shipping": 0,
        "amount": amount,
        "paid_at": paid_at,
        "created_at": paid_at,
        "items": items,
        "customer": {"name": "Test", "email": "t@t.co", "phone": "9999900000", "address": "x", "city": "Bengaluru", "pincode": "560001"},
    })
    client.close()
    return oid


def _delete_order(oid):
    client, db = _db()
    db.orders.delete_one({"id": oid})
    client.close()


def _skip_if_no_key():
    if not ADMIN_KEY:
        pytest.skip("ADMIN_KEY not available")


class TestAuth:
    def test_endpoints_require_auth(self, client):
        for path in ("/admin/sales/summary", "/admin/sales/timeseries", "/admin/sales/timeseries/categories", "/admin/sales/by_category", "/admin/sales/by_product"):
            assert client.get(f"{API}{path}").status_code == 401


class TestSummary:
    def test_summary_reflects_paid_order(self, client):
        _skip_if_no_key()
        before = client.get(f"{API}/admin/sales/summary", headers=_hdr()).json()
        oid = _insert_paid_order(amount=5000, items=[{"product_id": "duet-bloom", "name": "Bloom", "quantity": 2, "line_total": 4900}])
        try:
            after = client.get(f"{API}/admin/sales/summary", headers=_hdr()).json()
            assert after["revenue"] == before["revenue"] + 5000
            assert after["orders"] == before["orders"] + 1
            assert after["units"] == before["units"] + 2
        finally:
            _delete_order(oid)


class TestBreakdown:
    def test_by_category_and_product(self, client):
        _skip_if_no_key()
        oid = _insert_paid_order(amount=5000, items=[{"product_id": "duet-bloom", "name": "Bloom", "quantity": 2, "line_total": 4900}])
        try:
            bc = client.get(f"{API}/admin/sales/by_category", headers=_hdr()).json()
            assert any(c["category"] == "jar-candles" for c in bc)

            bp = client.get(f"{API}/admin/sales/by_product", headers=_hdr(), params={"sort": "revenue"}).json()
            assert any(p["product_id"] == "duet-bloom" for p in bp)
        finally:
            _delete_order(oid)

    def test_by_product_limit(self, client):
        _skip_if_no_key()
        oid = _insert_paid_order(amount=5000, items=[{"product_id": "duet-bloom", "name": "Bloom", "quantity": 7, "line_total": 4900}])
        try:
            bp = client.get(f"{API}/admin/sales/by_product", headers=_hdr(), params={"limit": 5, "sort": "units"}).json()
            assert len(bp) <= 5
        finally:
            _delete_order(oid)


class TestTimeSeries:
    def test_range_excludes_older_orders(self, client):
        _skip_if_no_key()
        old = _insert_paid_order(amount=1000, items=[{"product_id": "duet-bloom", "name": "Bloom", "quantity": 1, "line_total": 900}], paid_at="2020-01-01T12:00:00+00:00")
        new = _insert_paid_order(amount=2000, items=[{"product_id": "duet-bloom", "name": "Bloom", "quantity": 1, "line_total": 1900}], paid_at="2026-01-15T12:00:00+00:00")
        try:
            all_ts = client.get(f"{API}/admin/sales/timeseries", headers=_hdr()).json()
            buckets = {r["bucket"] for r in all_ts}
            assert "2026-01-15" in buckets and "2020-01-01" in buckets

            ranged = client.get(f"{API}/admin/sales/timeseries", headers=_hdr(), params={"from": "2026-01-01"}).json()
            buckets = {r["bucket"] for r in ranged}
            assert "2026-01-15" in buckets and "2020-01-01" not in buckets
        finally:
            _delete_order(old)
            _delete_order(new)

    def test_to_is_inclusive(self, client):
        _skip_if_no_key()
        oid = _insert_paid_order(amount=3000, items=[{"product_id": "duet-bloom", "name": "Bloom", "quantity": 1, "line_total": 2900}], paid_at="2026-01-15T23:59:59+00:00")
        try:
            ranged = client.get(f"{API}/admin/sales/timeseries", headers=_hdr(), params={"to": "2026-01-15"}).json()
            assert "2026-01-15" in {r["bucket"] for r in ranged}
        finally:
            _delete_order(oid)

    def test_timeseries_categories(self, client):
        _skip_if_no_key()
        oid = _insert_paid_order(amount=5000, items=[{"product_id": "duet-bloom", "name": "Bloom", "quantity": 2, "line_total": 4900}], paid_at="2026-01-15T12:00:00+00:00")
        try:
            tsc = client.get(f"{API}/admin/sales/timeseries/categories", headers=_hdr()).json()
            assert any(r["bucket"] == "2026-01-15" and r["category"] == "jar-candles" for r in tsc)
        finally:
            _delete_order(oid)
