"""Unit tests for backend.storage — mocked S3 client, no network or credentials needed."""
import pytest

import storage


class _FakeS3:
    def __init__(self):
        self.calls = []

    def put_object(self, **kwargs):
        self.calls.append(kwargs)


_ENV = {
    "SUPABASE_KEY_ID": "key-id",
    "SUPABASE_SECRET_ACCESS_KEY": "secret",
    "SUPABASE_ENDPOINT_URL": "https://abc.supabase.co/storage/v1/s3",
    "SUPABASE_BUCKET_NAME": "vanalume",
    "SUPABASE_REGION": "ap-south-1",
}


def _setenv(monkeypatch, **overrides):
    for k, v in {**_ENV, **overrides}.items():
        monkeypatch.setenv(k, v)


class TestPublicUrl:
    def test_derived_from_endpoint(self, monkeypatch):
        _setenv(monkeypatch)
        assert storage.public_base_url() == "https://abc.supabase.co/storage/v1/object/public/vanalume"

    def test_trailing_slash_endpoint(self, monkeypatch):
        _setenv(monkeypatch, SUPABASE_ENDPOINT_URL="https://abc.supabase.co/storage/v1/s3/")
        assert storage.public_base_url() == "https://abc.supabase.co/storage/v1/object/public/vanalume"


class TestPutObject:
    def test_uploads_and_returns_url(self, monkeypatch):
        _setenv(monkeypatch)
        fake = _FakeS3()
        monkeypatch.setattr(storage, "_client", lambda: fake)

        url = storage.put_object("uploads/x.png", b"\x89PNG", "image/png")

        assert url == "https://abc.supabase.co/storage/v1/object/public/vanalume/uploads/x.png"
        assert fake.calls == [{
            "Bucket": "vanalume",
            "Key": "uploads/x.png",
            "Body": b"\x89PNG",
            "ContentType": "image/png",
        }]


class TestConfiguration:
    def test_is_configured_false_when_missing(self, monkeypatch):
        for k in _ENV:
            monkeypatch.delenv(k, raising=False)
        assert storage.is_configured() is False

    def test_public_url_raises_when_unconfigured(self, monkeypatch):
        for k in _ENV:
            monkeypatch.delenv(k, raising=False)
        with pytest.raises(storage.StorageNotConfigured):
            storage.public_base_url()
