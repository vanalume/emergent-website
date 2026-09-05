"""Pricing logic for Vanalume orders.

Prices and shipping are computed against the catalogue stored in MongoDB, never
against static in-memory data.
"""
from typing import Sequence

from fastapi import HTTPException

from database import db
from models import CartItem, now_iso

SHIPPING_FLAT = 100
SHIPPING_FREE_THRESHOLD = 2000


def resolve_line_price(product: dict, variant_label=None):
    """Return the SP for a given product/variant. Variant overrides product SP."""
    if variant_label and product.get("variants"):
        for v in product["variants"]:
            if v["label"] == variant_label and "sp" in v:
                return v["sp"]
    return product.get("sp")


def compute_shipping(subtotal: int) -> int:
    return 0 if subtotal >= SHIPPING_FREE_THRESHOLD else SHIPPING_FLAT


async def get_product(product_id: str) -> dict | None:
    return await db.products.find_one({"id": product_id}, {"_id": 0})


async def get_active_offers() -> list:
    """Return all offers that are active now (active flag + start/end window)."""
    now = now_iso()
    active = []
    cursor = db.offers.find({"active": True}, {"_id": 0})
    async for o in cursor:
        if o.get("starts_at") and o["starts_at"] > now:
            continue
        if o.get("ends_at") and o["ends_at"] <= now:
            continue
        active.append(o)
    return active


def offer_for_product(product: dict, offers: list) -> dict | None:
    """Return the best active offer for a product's category (highest discount wins)."""
    matches = [o for o in offers if product.get("category") in (o.get("category_ids") or [])]
    if not matches:
        return None
    return max(matches, key=lambda o: o["discount_percent"])


def apply_discount(base_sp: int, offer: dict | None) -> int:
    """Apply a percentage offer to a base price.

    Uses `int(x + 0.5)` (round half up) to match the frontend's Math.round, so the
    displayed price and the charged price always agree.
    """
    if not offer:
        return base_sp
    return int(base_sp * (100 - offer["discount_percent"]) / 100 + 0.5)


async def compute_amount(items: Sequence[CartItem]):
    """Compute (subtotal, shipping, total, line_items) in INR from the Mongo catalogue."""
    subtotal = 0
    lines = []
    offers = await get_active_offers()
    for it in items:
        product = await get_product(it.product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Unknown product: {it.product_id}")
        if product.get("draft"):
            raise HTTPException(status_code=400, detail=f"{product['name']} is not available.")
        base = resolve_line_price(product, it.variant)
        if base is None:
            raise HTTPException(status_code=400, detail=f"{product['name']} has no price set.")
        offer = offer_for_product(product, offers)
        unit = apply_discount(base, offer)
        line_total = unit * it.quantity
        subtotal += line_total
        lines.append({
            "product_id": it.product_id, "name": product["name"],
            "collection": product.get("collection"), "variant": it.variant,
            "unit_price": unit, "quantity": it.quantity, "line_total": line_total,
            "offer": {"name": offer["name"], "discount_percent": offer["discount_percent"]} if offer else None,
        })
    shipping = compute_shipping(subtotal)
    return subtotal, shipping, subtotal + shipping, lines