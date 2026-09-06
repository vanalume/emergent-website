"""/api/admin/categories — category CRUD and ordering (admin-only)."""
import re

from fastapi import APIRouter, Depends, HTTPException

from database import db
from dependencies import require_admin
from models import Category, CategoryUpdate, Product

router = APIRouter(tags=["admin-catalog"], dependencies=[Depends(require_admin)])

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def _check_slug(cid: str) -> None:
    if not SLUG_RE.match(cid or ""):
        raise HTTPException(status_code=422, detail="id must be a lowercase slug (letters, digits, hyphens).")


async def _product_counts() -> dict:
    pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}]
    docs = await db.products.aggregate(pipeline).to_list(1000)
    return {d["_id"]: d["count"] for d in docs}


def _serialize(cat: dict, counts: dict) -> dict:
    cat = dict(cat)
    cat.pop("_id", None)
    cat["product_count"] = counts.get(cat.get("id"), 0)
    return cat


async def _sorted_categories() -> list:
    cats = await db.categories.find({}, {"_id": 0}).to_list(1000)
    cats.sort(key=lambda c: (c.get("order") is None, c.get("order") or 0))
    return cats


@router.get("/admin/categories")
async def list_categories():
    cats = await _sorted_categories()
    counts = await _product_counts()
    return [_serialize(c, counts) for c in cats]


@router.post("/admin/categories", status_code=201)
async def create_category(payload: Category):
    _check_slug(payload.id)
    if await db.categories.find_one({"id": payload.id}, {"_id": 0}):
        raise HTTPException(status_code=409, detail=f"Category id '{payload.id}' already exists.")
    doc = payload.model_dump()
    if doc.get("order") is None:
        doc["order"] = await db.categories.count_documents({})
    await db.categories.insert_one(doc)
    return _serialize(doc, await _product_counts())


@router.put("/admin/categories/reorder")
async def reorder_categories(payload: dict):
    ids = payload.get("ids") or []
    for i, cid in enumerate(ids):
        await db.categories.update_one({"id": cid}, {"$set": {"order": i}})
    return {"ok": True}


@router.put("/admin/categories/{category_id}")
async def update_category(category_id: str, payload: CategoryUpdate):
    _check_slug(category_id)
    existing = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found.")
    updates = payload.model_dump(exclude_unset=True)
    if updates:
        await db.categories.update_one({"id": category_id}, {"$set": updates})
    updated = await db.categories.find_one({"id": category_id}, {"_id": 0})
    return _serialize(updated, await _product_counts())


@router.delete("/admin/categories/{category_id}")
async def delete_category(category_id: str):
    existing = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found.")
    used = await db.products.count_documents({"category": category_id})
    if used:
        raise HTTPException(
            status_code=409,
            detail=f"Category '{existing['title']}' has {used} product(s). Move or delete them first.",
        )
    # Remove this category from any offer's category_ids before deleting it.
    await db.offers.update_many(
        {"category_ids": category_id},
        {"$pull": {"category_ids": category_id}},
    )
    await db.categories.delete_one({"id": category_id})
    return {"ok": True}


# ----------------------------- Products -----------------------------
async def _validate_category_ref(category: str, subcategory: str | None) -> None:
    cat = await db.categories.find_one({"id": category}, {"_id": 0, "subcategories": 1})
    if not cat:
        raise HTTPException(status_code=400, detail=f"Category '{category}' does not exist.")
    if subcategory:
        sub_ids = {s["id"] for s in (cat.get("subcategories") or [])}
        if subcategory not in sub_ids:
            raise HTTPException(status_code=400, detail=f"Sub-category '{subcategory}' does not belong to '{category}'.")


@router.get("/admin/products")
async def list_products():
    products = await db.products.find({}, {"_id": 0}).to_list(5000)
    products.sort(key=lambda p: (p.get("name") or "").lower())
    return products


@router.post("/admin/products", status_code=201)
async def create_product(payload: Product):
    _check_slug(payload.id)
    if await db.products.find_one({"id": payload.id}, {"_id": 0}):
        raise HTTPException(status_code=409, detail=f"Product id '{payload.id}' already exists.")
    await _validate_category_ref(payload.category, payload.subcategory)
    doc = payload.model_dump()
    await db.products.insert_one(doc)
    doc.pop("_id", None)  # insert_one mutates the dict with an ObjectId
    return doc


@router.put("/admin/products/{product_id}")
async def update_product(product_id: str, payload: Product):
    _check_slug(product_id)
    if payload.id != product_id:
        raise HTTPException(status_code=400, detail="Body id must match the URL id.")
    if not await db.products.find_one({"id": product_id}, {"_id": 0}):
        raise HTTPException(status_code=404, detail="Product not found.")
    await _validate_category_ref(payload.category, payload.subcategory)
    doc = payload.model_dump()
    await db.products.replace_one({"id": product_id}, doc)
    doc.pop("_id", None)
    return doc


@router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found.")
    return {"ok": True}
