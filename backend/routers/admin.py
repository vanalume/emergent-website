"""/admin — admin key verification and exported data."""
from fastapi import APIRouter, Header, HTTPException

from config import ADMIN_KEY
from database import db

router = APIRouter(tags=["admin"])


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