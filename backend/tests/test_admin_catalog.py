"""HTTP tests for admin category CRUD (requires a running backend)."""
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


@pytest.fixture(scope="module")
def client():
    return requests.Session()


def _hdr():
    return {"X-Admin-Key": ADMIN_KEY}


def _new_id():
    return f"zzz-test-{uuid.uuid4().hex[:8]}"


def _create(client, **overrides):
    payload = {"id": _new_id(), "title": "Z Test Category", "tagline": "Test tagline"}
    payload.update(overrides)
    r = client.post(f"{API}/admin/categories", json=payload, headers=_hdr())
    return payload["id"], r


def _delete(client, cid):
    client.delete(f"{API}/admin/categories/{cid}", headers=_hdr())


class TestAuth:
    def test_list_requires_auth(self, client):
        assert client.get(f"{API}/admin/categories").status_code == 401

    def test_create_requires_auth(self, client):
        r = client.post(f"{API}/admin/categories", json={"id": "x", "title": "X", "tagline": "x"})
        assert r.status_code == 401

    def test_update_requires_auth(self, client):
        r = client.put(f"{API}/admin/categories/x", json={"title": "X"})
        assert r.status_code == 401

    def test_delete_requires_auth(self, client):
        r = client.delete(f"{API}/admin/categories/x")
        assert r.status_code == 401


class TestList:
    def test_list_returns_seeded_categories(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.get(f"{API}/admin/categories", headers=_hdr())
        assert r.status_code == 200
        ids = {c["id"] for c in r.json()}
        assert "jar-candles" in ids
        jar = next(c for c in r.json() if c["id"] == "jar-candles")
        assert jar["product_count"] > 0


class TestCreate:
    def test_create_appears_in_public_products(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        cid, r = _create(client, title="Z Test Category")
        try:
            assert r.status_code == 201, r.text
            assert r.json()["product_count"] == 0
            pub = client.get(f"{API}/products").json()
            assert any(c["id"] == cid for c in pub["categories"])
        finally:
            _delete(client, cid)

    def test_duplicate_id_conflict(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.post(f"{API}/admin/categories", json={"id": "jar-candles", "title": "Dup", "tagline": "x"}, headers=_hdr())
        assert r.status_code == 409

    def test_invalid_slug_rejected(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.post(f"{API}/admin/categories", json={"id": "Bad Slug!", "title": "Bad", "tagline": "x"}, headers=_hdr())
        assert r.status_code == 422

    def test_missing_title_rejected(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.post(f"{API}/admin/categories", json={"id": _new_id(), "tagline": "x"}, headers=_hdr())
        assert r.status_code == 422


class TestUpdate:
    def test_update_tagline_reflected(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        cid, _ = _create(client)
        try:
            r = client.put(f"{API}/admin/categories/{cid}", json={"tagline": "New tagline"}, headers=_hdr())
            assert r.status_code == 200, r.text
            assert r.json()["tagline"] == "New tagline"
            pub = client.get(f"{API}/products").json()
            cat = next(c for c in pub["categories"] if c["id"] == cid)
            assert cat["tagline"] == "New tagline"
        finally:
            _delete(client, cid)

    def test_update_missing_404(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.put(f"{API}/admin/categories/zzz-nonexistent", json={"title": "X"}, headers=_hdr())
        assert r.status_code == 404

    def test_subcategory_roundtrip(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        cid, _ = _create(client, subcategories=[
            {"id": "sub-a", "title": "Sub A", "tagline": "First"},
            {"id": "sub-b", "title": "Sub B", "tagline": "Second"},
        ])
        try:
            r = client.put(f"{API}/admin/categories/{cid}", json={
                "subcategories": [{"id": "sub-c", "title": "Sub C", "tagline": "Replaced"}],
            }, headers=_hdr())
            assert r.status_code == 200
            ids = [s["id"] for s in r.json()["subcategories"]]
            assert ids == ["sub-c"]
        finally:
            _delete(client, cid)


class TestDelete:
    def test_delete_in_use_conflict(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.delete(f"{API}/admin/categories/jar-candles", headers=_hdr())
        assert r.status_code == 409

    def test_delete_empty_then_404(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        cid, _ = _create(client)
        r = client.delete(f"{API}/admin/categories/{cid}", headers=_hdr())
        assert r.status_code == 200
        r2 = client.delete(f"{API}/admin/categories/{cid}", headers=_hdr())
        assert r2.status_code == 404

    def test_delete_clears_offers(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        cid, _ = _create(client)
        r = client.post(f"{API}/admin/offers", json={
            "name": "Z Offer", "category_ids": ["jar-candles", cid], "discount_percent": 10, "active": True,
        }, headers=_hdr())
        offer_id = r.json().get("id") if r.status_code == 201 else None
        try:
            assert client.delete(f"{API}/admin/categories/{cid}", headers=_hdr()).status_code == 200
            offers = client.get(f"{API}/admin/offers", headers=_hdr()).json()
            offer = next((o for o in offers if o["id"] == offer_id), None)
            assert offer is not None
            assert cid not in offer["category_ids"]
            assert "jar-candles" in offer["category_ids"]
        finally:
            if offer_id:
                client.delete(f"{API}/admin/offers/{offer_id}", headers=_hdr())


class TestReorder:
    def test_reorder_persists(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        id_a, _ = _create(client, title="Z Reorder A")
        id_b, _ = _create(client, title="Z Reorder B")
        try:
            r = client.put(f"{API}/admin/categories/reorder", json={"ids": [id_b, id_a]}, headers=_hdr())
            assert r.status_code == 200, r.text
            listed = client.get(f"{API}/admin/categories", headers=_hdr()).json()
            test_ids = [c["id"] for c in listed if c["id"] in (id_a, id_b)]
            assert test_ids == [id_b, id_a]
        finally:
            _delete(client, id_a)
            _delete(client, id_b)
