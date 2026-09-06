"""HTTP tests for the content CMS (requires a running backend)."""
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
    def test_get_home_returns_seeded_sections(self, client):
        r = client.get(f"{API}/content/pages/home")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["slug"] == "home"
        keys = {s["key"] for s in data["sections"]}
        assert "belief_body" in keys
        assert "hero_slides" in keys

    def test_get_unknown_slug_404(self, client):
        assert client.get(f"{API}/content/pages/zzz-unknown").status_code == 404


class TestAdmin:
    def test_requires_auth(self, client):
        assert client.get(f"{API}/admin/content/pages").status_code == 401
        assert client.get(f"{API}/admin/content/pages/home").status_code == 401

    def test_list_returns_all_pages(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.get(f"{API}/admin/content/pages", headers=_hdr())
        assert r.status_code == 200, r.text
        slugs = {p["slug"] for p in r.json()}
        assert {"home", "about", "contact", "footer", "navbar", "shop"} <= slugs

    def test_get_single_page(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.get(f"{API}/admin/content/pages/about", headers=_hdr())
        assert r.status_code == 200, r.text
        keys = {s["key"] for s in r.json()["sections"]}
        assert "founders" in keys and "senses" in keys
