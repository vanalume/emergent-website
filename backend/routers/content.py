"""Public content (CMS) endpoints + seeding.

Content is stored in the `content` collection. Pages are seeded from
`content_defaults.json`: a missing page is inserted whole, and an existing page
is back-filled with any default sections it does not yet have (existing values
are never overwritten), so this is safe to run on every startup.
"""
import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException

from content_migrate import missing_sections
from database import db
from models import now_iso

router = APIRouter(tags=["content"])
logger = logging.getLogger(__name__)

DEFAULTS_PATH = Path(__file__).resolve().parent.parent / "content_defaults.json"


def load_defaults() -> dict:
    return json.loads(DEFAULTS_PATH.read_text())


async def seed_content() -> None:
    """Ensure every default page/section exists, without clobbering edits.

    - Missing page -> insert the full default page.
    - Existing page -> append default sections whose key is absent, leaving
      existing values untouched. This is the non-destructive back-fill that
      lets new CMS fields reach already-seeded databases; it is idempotent.
    """
    defaults = load_defaults()
    for slug, sections in defaults.items():
        doc = await db.content.find_one({"slug": slug}, {"sections": 1})
        if not doc:
            await db.content.insert_one({
                "slug": slug,
                "sections": sections,
                "updated_at": now_iso(),
            })
            continue

        added = missing_sections(sections, doc.get("sections"))
        if not added:
            continue

        # $push is a single atomic op that only appends: it can't overwrite an
        # existing/edited value or clobber a concurrent admin save.
        await db.content.update_one(
            {"slug": slug},
            {"$push": {"sections": {"$each": added}}, "$set": {"updated_at": now_iso()}},
        )
        logger.info("content: back-filled %s on page '%s'", [s["key"] for s in added], slug)


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
