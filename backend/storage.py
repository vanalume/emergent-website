"""Supabase object storage via its S3-compatible API.

Configuration is read from the environment and a single ``put_object`` helper
uploads bytes and returns the public CDN URL. Nothing here is Supabase-specific —
the same code works unchanged against AWS S3 or Cloudflare R2.
"""
import os
from functools import lru_cache

_REQUIRED = (
    "SUPABASE_KEY_ID",
    "SUPABASE_SECRET_ACCESS_KEY",
    "SUPABASE_ENDPOINT_URL",
    "SUPABASE_BUCKET_NAME",
    "SUPABASE_REGION",
)


class StorageNotConfigured(Exception):
    """Raised when the object-storage environment is incomplete."""


def _env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise StorageNotConfigured(f"Missing required env var: {name}")
    return value


def is_configured() -> bool:
    return all(os.environ.get(k, "").strip() for k in _REQUIRED)


@lru_cache(maxsize=1)
def _client():
    # Lazy imports keep `import storage` safe even if boto3 isn't installed.
    import boto3
    from botocore.config import Config

    return boto3.client(
        "s3",
        endpoint_url=_env("SUPABASE_ENDPOINT_URL"),
        region_name=_env("SUPABASE_REGION"),
        aws_access_key_id=_env("SUPABASE_KEY_ID"),
        aws_secret_access_key=_env("SUPABASE_SECRET_ACCESS_KEY"),
        config=Config(signature_version="s3v4"),
    )


def init_storage() -> None:
    """Validate configuration by constructing the S3 client."""
    _client()


def public_base_url() -> str:
    # S3 endpoint:      https://<ref>.supabase.co/storage/v1/s3
    # Public object URL: https://<ref>.supabase.co/storage/v1/object/public/<bucket>
    endpoint = _env("SUPABASE_ENDPOINT_URL").rstrip("/")
    base = endpoint.rsplit("/s3", 1)[0]
    return f"{base}/object/public/{_env('SUPABASE_BUCKET_NAME')}"


def put_object(path: str, content: bytes, content_type: str) -> str:
    """Upload ``content`` to ``path`` and return its public URL."""
    client = _client()
    bucket = _env("SUPABASE_BUCKET_NAME")
    client.put_object(Bucket=bucket, Key=path, Body=content, ContentType=content_type)
    return f"{public_base_url()}/{path}"
