"""Admin content (CMS) endpoints."""
from fastapi import APIRouter, Depends, HTTPException

from database import db
from dependencies import require_admin
from models import Page, now_iso
from routers.content import load_defaults, seed_content

router = APIRouter(tags=["admin-content"], dependencies=[Depends(require_admin)])


@router.get("/admin/content/pages")
async def list_pages():
    await seed_content()
    return await db.content.find({}, {"_id": 0}).sort("slug", 1).to_list(100)


@router.get("/admin/content/pages/{slug}")
async def get_page(slug: str):
    doc = await db.content.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        sections = load_defaults().get(slug)
        if sections is None:
            raise HTTPException(status_code=404, detail="Page not found.")
        doc = {"slug": slug, "sections": sections, "updated_at": now_iso()}
        await db.content.insert_one(doc)
    return doc


@router.put("/admin/content/pages/{slug}")
async def update_page(slug: str, payload: Page):
    if payload.slug != slug:
        raise HTTPException(status_code=400, detail="Body slug must match the URL slug.")
    doc = payload.model_dump()
    doc["updated_at"] = now_iso()
    await db.content.replace_one({"slug": slug}, doc)
    doc.pop("_id", None)
    return doc
