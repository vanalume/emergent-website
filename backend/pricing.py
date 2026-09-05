"""Pricing logic for Vanalume orders.

Prices and shipping are computed against the catalogue stored in MongoDB, never
against static in-memory data.
"""
from typing import Sequence

from fastapi import HTTPException

from database import db
from models import CartItem

SHIPPING_FLAT = 100
SHIPPING_FREE_THRESHOLD = 2000


def resolve_line_price(product: dict, variant_label=None, size_label=None):
    """Return the SP for a given product/variant/size. Size overrides variant/product SP."""
    if size_label and product.get("sizes"):
        for s in product["sizes"]:
            if s["label"] == size_label and "sp" in s:
                return s["sp"]
    if variant_label and product.get("variants"):
        for v in product["variants"]:
            if v["label"] == variant_label and "sp" in v:
                return v["sp"]
    return product.get("sp")


def compute_shipping(subtotal: int) -> int:
    return 0 if subtotal >= SHIPPING_FREE_THRESHOLD else SHIPPING_FLAT


async def get_product(product_id: str) -> dict | None:
    return await db.products.find_one({"id": product_id}, {"_id": 0})


async def compute_amount(items: Sequence[CartItem]):
    """Compute (subtotal, shipping, total, line_items) in INR from the Mongo catalogue."""
    subtotal = 0
    lines = []
    for it in items:
        product = await get_product(it.product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Unknown product: {it.product_id}")
        if product.get("enquire"):
            raise HTTPException(status_code=400, detail=f"{product['name']} is enquiry-only.")
        unit = resolve_line_price(product, it.variant, it.size)
        if unit is None:
            raise HTTPException(status_code=400, detail=f"{product['name']} has no price set.")
        line_total = unit * it.quantity
        subtotal += line_total
        lines.append({
            "product_id": it.product_id, "name": product["name"],
            "collection": product.get("collection"), "variant": it.variant, "size": it.size,
            "unit_price": unit, "quantity": it.quantity, "line_total": line_total,
        })
    shipping = compute_shipping(subtotal)
    return subtotal, shipping, subtotal + shipping, lines