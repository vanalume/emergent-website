"""HTTP tests for the blogs feature (requires a running backend)."""
import base64
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

PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
)


@pytest.fixture(scope="module")
def client():
    return requests.Session()


def _hdr():
    return {"X-Admin-Key": ADMIN_KEY}


def _slug():
    return f"test-blog-{uuid.uuid4().hex[:8]}"


class TestPublic:
    def test_list_blogs(self, client):
        r = client.get(f"{API}/blogs")
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), list)

    def test_get_unknown_blog_404(self, client):
        assert client.get(f"{API}/blogs/zzz-unknown-{uuid.uuid4().hex[:6]}").status_code == 404


class TestAdmin:
    def test_requires_auth(self, client):
        assert client.get(f"{API}/admin/blogs").status_code == 401
        assert client.post(f"{API}/admin/blogs", json={}).status_code == 401

    def test_crud_and_visibility(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        slug = _slug()
        payload = {
            "id": slug,
            "title": "Test Blog",
            "excerpt": "A short excerpt",
            "cover_image": "",
            "content": "<h2>Hello</h2><p>World</p>",
            "author": "Tester",
            "published": False,
        }
        r = client.post(f"{API}/admin/blogs", json=payload, headers=_hdr())
        assert r.status_code == 201, r.text

        # A draft is not visible publicly.
        assert client.get(f"{API}/blogs/{slug}").status_code == 404

        # Publish it.
        payload["published"] = True
        r = client.put(f"{API}/admin/blogs/{slug}", json=payload, headers=_hdr())
        assert r.status_code == 200, r.text

        g = client.get(f"{API}/blogs/{slug}")
        assert g.status_code == 200, g.text
        assert g.json()["content"] == payload["content"]

        ids = {b["id"] for b in client.get(f"{API}/blogs").json()}
        assert slug in ids

        d = client.delete(f"{API}/admin/blogs/{slug}", headers=_hdr())
        assert d.status_code == 200, d.text
        assert client.get(f"{API}/blogs/{slug}").status_code == 404

    def test_duplicate_id_409(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        slug = _slug()
        payload = {"id": slug, "title": "Dup", "published": False}
        assert client.post(f"{API}/admin/blogs", json=payload, headers=_hdr()).status_code == 201
        assert client.post(f"{API}/admin/blogs", json=payload, headers=_hdr()).status_code == 409
        client.delete(f"{API}/admin/blogs/{slug}", headers=_hdr())


class TestBlogImageUpload:
    def test_upload_to_blog_folder(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.post(
            f"{API}/admin/upload?folder=blog/test-blog",
            files={"file": ("x.png", PNG_BYTES, "image/png")},
            headers=_hdr(),
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["path"].startswith("blog/test-blog/")
        assert data["url"].startswith("https://")

    def test_rejects_unsafe_folder(self, client):
        if not ADMIN_KEY:
            pytest.skip("ADMIN_KEY not available")
        r = client.post(
            f"{API}/admin/upload?folder=../../etc",
            files={"file": ("x.png", PNG_BYTES, "image/png")},
            headers=_hdr(),
        )
        assert r.status_code == 422
