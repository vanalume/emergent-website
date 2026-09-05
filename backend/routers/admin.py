"""/admin — admin key verification, exported data, and image uploads."""
import uuid

from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

import storage
from config import ADMIN_KEY
from database import db
from models import now_iso

router = APIRouter(tags=["admin"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
_IMAGE_EXT = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
}


def _check_admin(key: str | None):
    if not ADMIN_KEY or key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/admin/verify")
async def admin_verify(payload: dict):
    _check_admin((payload or {}).get("key"))
    return {"ok": True}


@router.get("/admin/data")
async def admin_data(x_admin_key: str | None = Header(default=None)):
    _check_admin(x_admin_key)
    inquiries = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    newsletter = await db.newsletter.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    return {"inquiries": inquiries, "newsletter": newsletter}


@router.post("/admin/upload")
async def admin_upload(file: UploadFile = File(...), x_admin_key: str | None = Header(default=None)):
    _check_admin(x_admin_key)
    content = await file.read()
    content_type = (file.content_type or "").lower()
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed.")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB).")
    ext = _IMAGE_EXT.get(content_type, "img")
    path = f"uploads/{uuid.uuid4().hex}.{ext}"
    try:
        url = await run_in_threadpool(storage.put_object, path, content, content_type)
    except storage.StorageNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    await db.files.insert_one({
        "path": path,
        "url": url,
        "content_type": content_type,
        "size": len(content),
        "created_at": now_iso(),
    })
    return {"path": path, "url": url}