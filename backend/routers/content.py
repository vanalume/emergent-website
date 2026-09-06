"""Public content (CMS) endpoints + seeding.

Content is stored in the `content` collection. On first read of a slug that
isn't in the DB yet, it is seeded from `content_defaults.json` so the existing
hardcoded copy migrates into the CMS transparently.
"""
import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from database import db
from models import now_iso

router = APIRouter(tags=["content"])

DEFAULTS_PATH = Path(__file__).resolve().parent.parent / "content_defaults.json"


def load_defaults() -> dict:
    return json.loads(DEFAULTS_PATH.read_text())


async def seed_content() -> None:
    """Insert any pages from content_defaults.json that are missing from the DB."""
    defaults = load_defaults()
    existing = {d["slug"] for d in await db.content.find({}, {"slug": 1}).to_list(1000)}
    for slug, sections in defaults.items():
        if slug in existing:
            continue
        await db.content.insert_one({
            "slug": slug,
            "sections": sections,
            "updated_at": now_iso(),
        })


@router.get("/content/pages/{slug}")
async def get_page(slug: str):
    doc = await db.content.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        sections = load_defaults().get(slug)
        if sections is None:
            raise HTTPException(status_code=404, detail="Page not found.")
        doc = {"slug": slug, "sections": sections, "updated_at": now_iso()}
        await db.content.insert_one(doc)
    return doc
