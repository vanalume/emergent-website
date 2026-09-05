"""/orders — create, verify payment, list."""
import uuid

import razorpay
from fastapi import APIRouter, HTTPException

import delivery_provider
from config import RZP_KEY_ID, rzp_client
from database import db
from models import Order, OrderItem, VerifyPayment, now_iso
from pricing import compute_amount

router = APIRouter(tags=["orders"])


@router.post("/orders")
async def create_order(payload: Order):
    subtotal, shipping, amount, lines = await compute_amount(payload.items)

    # Resolve the delivery provider BEFORE any payment is initiated. A destination
    # with no provider coverage must not reach Razorpay.
    provider = delivery_provider.select_delivery_provider(
        payload.customer.pincode, payload.customer.state
    )
    if provider is None:
        raise HTTPException(status_code=400, detail="Delivery is not available for this pincode.")

    order = Order(
        id=str(uuid.uuid4()),
        items=[OrderItem(**line) for line in lines],
        customer=payload.customer,
        subtotal=subtotal,
        shipping=shipping,
        amount=amount,
        delivery_provider=provider.id,
    )
    razorpay_order_id = None
    if rzp_client is not None:
        rzp_order = rzp_client.order.create({
            "amount": amount * 100, "currency": "INR",
            "receipt": order.id[:40], "payment_capture": 1,
        })
        razorpay_order_id = rzp_order["id"]
        order.razorpay_order_id = razorpay_order_id
    await db.orders.insert_one(order.model_dump())

    return {
        "order_id": order.id, "subtotal": subtotal, "shipping": shipping,
        "amount": amount, "currency": "INR",
        "delivery_provider": provider.id,
        "payment_configured": rzp_client is not None,
        "razorpay_order_id": razorpay_order_id, "razorpay_key_id": RZP_KEY_ID or None,
    }


@router.post("/orders/verify")
async def verify_payment(payload: VerifyPayment):
    if rzp_client is None:
        raise HTTPException(status_code=400, detail="Payments are not configured.")
    try:
        rzp_client.utility.verify_payment_signature({
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature,
        })
    except razorpay.errors.SignatureVerificationError:
        await db.orders.update_one({"id": payload.order_id}, {"$set": {"status": "failed"}})
        raise HTTPException(status_code=400, detail="Payment verification failed.")

    order_doc = await db.orders.find_one_and_update(
        {"id": payload.order_id},
        {"$set": {"status": "paid", "razorpay_payment_id": payload.razorpay_payment_id, "paid_at": now_iso()}},
        return_document=True,
    )

    shipment: dict | None = None
    provider_id: str | None = None
    shipment_id: str | None = None
    if order_doc:
        # Prefer the stored provider; legacy orders predating the provider layer
        # are routed to the default ShipRocket provider.
        provider_id = order_doc.get("delivery_provider")
        if not provider_id:
            provider_id = "shiprocket" if order_doc.get("shiprocket") else None
        provider = delivery_provider.provider_by_id(provider_id) if provider_id else None

        if provider is not None and provider.is_configured():
            shipment = order_doc.get("shipment") or order_doc.get("shiprocket")
            if not shipment:
                # Idempotent: only create a shipment once per Vanalume order.
                response = await provider.create_adhoc_order(order_doc)
                if response:
                    shipment = response
                    shipment_id = provider.shipment_id_from(response)
                    await db.orders.update_one(
                        {"id": payload.order_id},
                        {"$set": {
                            "delivery_provider": provider.id,
                            "shipment": response,
                            "shipment_id": shipment_id,
                            "shipment_created_at": now_iso(),
                        }},
                    )
            else:
                shipment_id = order_doc.get("shipment_id") or provider.shipment_id_from(shipment)
                if shipment_id is not None:
                    shipment_id = str(shipment_id)

    return {
        "status": "paid", "order_id": payload.order_id,
        "delivery_provider": provider_id, "shipment_id": shipment_id,
        "shipment": shipment,
    }


@router.get("/orders")
async def list_orders():
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs