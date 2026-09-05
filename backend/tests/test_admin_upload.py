"""HTTP tests for the admin image-upload endpoint (requires a running backend + Supabase)."""
import base64
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

# 1x1 transparent PNG
PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
)


@pytest.fixture(scope="module")
def client():
    return requests.Session()


class TestAdminUpload:
    def test_upload_requires_auth(self, client):
        r = client.post(f"{API}/admin/upload", files={"file": ("x.png", PNG_BYTES, "image/png")})
        assert r.status_code == 401

    def test_upload_roundtrip(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.post(
            f"{API}/admin/upload",
            files={"file": ("x.png", PNG_BYTES, "image/png")},
            headers={"X-Admin-Key": ADMIN_KEY},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["path"].startswith("uploads/")
        assert data["url"].startswith("https://")

        g = requests.get(data["url"])
        assert g.status_code == 200, g.text[:200]
        assert g.headers.get("Content-Type", "").startswith("image/")
        assert g.content == PNG_BYTES

    def test_upload_rejects_non_image(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.post(
            f"{API}/admin/upload",
            files={"file": ("notes.txt", b"hello", "text/plain")},
            headers={"X-Admin-Key": ADMIN_KEY},
        )
        assert r.status_code == 400
