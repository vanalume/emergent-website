"""/api/admin/blogs — blog CRUD (admin-only)."""
import re

from fastapi import APIRouter, Depends, HTTPException

from database import db
from dependencies import require_admin
from models import Blog

router = APIRouter(tags=["admin-blogs"], dependencies=[Depends(require_admin)])

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def _check_slug(bid: str) -> None:
    if not SLUG_RE.match(bid or ""):
        raise HTTPException(status_code=422, detail="id must be a lowercase slug (letters, digits, hyphens).")


@router.get("/admin/blogs")
async def list_blogs():
    return await db.blogs.find({}, {"_id": 0}).sort("_id", -1).to_list(500)


@router.post("/admin/blogs", status_code=201)
async def create_blog(payload: Blog):
    _check_slug(payload.id)
    if await db.blogs.find_one({"id": payload.id}, {"_id": 0}):
        raise HTTPException(status_code=409, detail=f"Blog id '{payload.id}' already exists.")
    doc = payload.model_dump()
    await db.blogs.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.put("/admin/blogs/{blog_id}")
async def update_blog(blog_id: str, payload: Blog):
    _check_slug(blog_id)
    if payload.id != blog_id:
        raise HTTPException(status_code=400, detail="Body id must match the URL id.")
    if not await db.blogs.find_one({"id": blog_id}, {"_id": 0}):
        raise HTTPException(status_code=404, detail="Blog not found.")
    doc = payload.model_dump()
    await db.blogs.replace_one({"id": blog_id}, doc)
    doc.pop("_id", None)
    return doc


@router.delete("/admin/blogs/{blog_id}")
async def delete_blog(blog_id: str):
    result = await db.blogs.delete_one({"id": blog_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found.")
    return {"ok": True}
