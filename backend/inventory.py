"""Inventory helpers — effective stock and atomic stock deduction.

A product's *effective* stock is the sum of its variant stocks when it has
variants, otherwise its own `stock` field. Decrementing happens atomically in
MongoDB with a `stock >= qty` guard so concurrent payments cannot oversell.
"""
from fastapi import HTTPException

from database import db


def effective_stock(product: dict) -> int:
    """Total sellable units for a product document."""
    variants = product.get("variants") or []
    if variants:
        return sum((v.get("stock") or 0) for v in variants)
    return product.get("stock") or 0


async def decrement_stock(lines: list) -> None:
    """Deduct paid order line quantities, then auto-draft anything that hits zero.

    Each deduction uses a conditional update (`stock >= quantity`); if no document
    matches, the line could not be fulfilled and a 409 is raised so the caller can
    fail the order instead of overselling.
    """
    affected: set = set()
    for line in lines:
        product_id = line.get("product_id")
        quantity = int(line.get("quantity") or 0)
        variant = line.get("variant")
        if not product_id or quantity <= 0:
            continue

        if variant:
            result = await db.products.update_one(
                {
                    "id": product_id,
                    "variants": {"$elemMatch": {"label": variant, "stock": {"$gte": quantity}}},
                },
                {"$inc": {"variants.$.stock": -quantity}},
            )
        else:
            result = await db.products.update_one(
                {"id": product_id, "stock": {"$gte": quantity}},
                {"$inc": {"stock": -quantity}},
            )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=409,
                detail=f"Not enough stock for {line.get('name') or product_id}.",
            )
        affected.add(product_id)

    for product_id in affected:
        product = await db.products.find_one({"id": product_id}, {"_id": 0})
        if product and effective_stock(product) == 0:
            await db.products.update_one({"id": product_id}, {"$set": {"draft": True}})
