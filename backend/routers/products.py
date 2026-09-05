"""GET /products — catalogue served from MongoDB, not static data."""
from fastapi import APIRouter

from database import db
from models import Category, Product
from pricing import apply_discount, get_active_offers, offer_for_product

router = APIRouter(tags=["products"])


@router.get("/products")
async def get_products():
    products = await db.products.find({"draft": {"$ne": True}}, {"_id": 0}).to_list(1000)
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    categories.sort(key=lambda c: (c.get("order") is None, c.get("order") or 0))

    offers = await get_active_offers()
    result = []
    for p in products:
        dump = Product(**p).model_dump()
        offer = offer_for_product(dump, offers)
        dump["offer"] = offer
        dump["offer_price"] = apply_discount(dump["sp"], offer) if offer else None
        result.append(dump)

    return {
        "products": result,
        "categories": [Category(**c).model_dump() for c in categories],
    }