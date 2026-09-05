"""/api/admin/offers — offer CRUD (admin-only)."""
from fastapi import APIRouter, Depends, HTTPException

from database import db
from dependencies import require_admin
from models import Offer

router = APIRouter(tags=["admin-offers"], dependencies=[Depends(require_admin)])


async def _validate_categories(category_ids: list) -> None:
    for cid in category_ids or []:
        if not await db.categories.find_one({"id": cid}, {"_id": 0}):
            raise HTTPException(status_code=400, detail=f"Category '{cid}' does not exist.")


@router.get("/admin/offers")
async def list_offers():
    return await db.offers.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@router.post("/admin/offers", status_code=201)
async def create_offer(payload: Offer):
    await _validate_categories(payload.category_ids)
    doc = payload.model_dump()
    await db.offers.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.put("/admin/offers/{offer_id}")
async def update_offer(offer_id: str, payload: Offer):
    existing = await db.offers.find_one({"id": offer_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Offer not found.")
    await _validate_categories(payload.category_ids)
    doc = payload.model_dump()
    doc["id"] = offer_id
    doc["created_at"] = existing.get("created_at", doc.get("created_at"))
    await db.offers.replace_one({"id": offer_id}, doc)
    doc.pop("_id", None)
    return doc


@router.delete("/admin/offers/{offer_id}")
async def delete_offer(offer_id: str):
    result = await db.offers.delete_one({"id": offer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offer not found.")
    return {"ok": True}
