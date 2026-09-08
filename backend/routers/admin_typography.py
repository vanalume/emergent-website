"""/api/admin/typography — read + update typography settings (admin-only)."""
from fastapi import APIRouter, Depends

from database import db
from dependencies import require_admin
from models import Typography, now_iso
from routers.typography import BREAKPOINTS, load_defaults, seed_typography

router = APIRouter(tags=["admin-typography"], dependencies=[Depends(require_admin)])


@router.get("/admin/typography")
async def get_typography():
    await seed_typography()
    doc = await db.typography.find_one({}, {"_id": 0})
    tokens = doc["tokens"] if doc else load_defaults()["tokens"]
    return {"breakpoints": BREAKPOINTS, "tokens": tokens}


@router.put("/admin/typography")
async def update_typography(payload: Typography):
    doc = {"tokens": [t.model_dump() for t in payload.tokens], "updated_at": now_iso()}
    await db.typography.replace_one({"_id": "default"}, doc, upsert=True)
    return {"breakpoints": BREAKPOINTS, "tokens": doc["tokens"]}
