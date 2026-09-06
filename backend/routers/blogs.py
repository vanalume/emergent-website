"""Public blog endpoints — served from the `blogs` collection (published only)."""
from fastapi import APIRouter, HTTPException

from database import db

router = APIRouter(tags=["blogs"])


@router.get("/blogs")
async def list_blogs():
    return await db.blogs.find({"published": True}, {"_id": 0}).sort("_id", -1).to_list(500)


@router.get("/blogs/{slug}")
async def get_blog(slug: str):
    blog = await db.blogs.find_one({"id": slug, "published": True}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found.")
    return blog
