"""HTTP tests for the typography settings (requires a running backend)."""
import os

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


class TestPublic:
    def test_get_returns_breakpoints_and_tokens(self, client):
        r = client.get(f"{API}/typography")
        assert r.status_code == 200, r.text
        data = r.json()
        assert {b["key"] for b in data["breakpoints"]} == {"mobile", "desktop"}
        keys = {t["key"] for t in data["tokens"]}
        assert "category_title" in keys and "nav_link" in keys


class TestAdmin:
    def test_requires_auth(self, client):
        assert client.get(f"{API}/admin/typography").status_code == 401
        assert client.put(f"{API}/admin/typography", json={"tokens": []}).status_code == 401

    def test_put_roundtrip(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        tokens = [
            {"key": "category_title", "label": "Category title", "group": "Shop",
             "sizes": {"mobile": "3rem", "desktop": "4.5rem"}},
            {"key": "nav_link", "label": "Nav link", "group": "Global",
             "sizes": {"mobile": "0.875rem", "desktop": "0.875rem"}},
        ]
        r = client.put(f"{API}/admin/typography", json={"tokens": tokens}, headers=_hdr())
        assert r.status_code == 200, r.text
        saved = {t["key"]: t for t in r.json()["tokens"]}
        assert saved["category_title"]["sizes"]["desktop"] == "4.5rem"

    def test_put_rejects_invalid_size(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        tokens = [{"key": "x", "label": "x", "group": "x", "sizes": {"mobile": "abc"}}]
        r = client.put(f"{API}/admin/typography", json={"tokens": tokens}, headers=_hdr())
        assert r.status_code == 422
