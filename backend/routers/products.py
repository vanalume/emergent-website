"""GET /products — catalogue served from MongoDB, not static data."""
from fastapi import APIRouter

from database import db
from models import Category, Product

router = APIRouter(tags=["products"])


@router.get("/products")
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return {
        "products": [Product(**p).model_dump() for p in products],
        "categories": [Category(**c).model_dump() for c in categories],
    }