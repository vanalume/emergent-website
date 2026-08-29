"""/shipping — provider-driven tracking + webhook ingestion."""
import hmac
import uuid

import httpx
from fastapi import APIRouter, Header, HTTPException, Request

import delivery_provider
from config import SR_WEBHOOK_SECRET
from database import db
from models import now_iso

router = APIRouter(tags=["shipping"])


async def _order_for_attr(field: str, value) -> dict | None:
    """Find an order carrying `value` under `field` in its delivery payload.

    Checks the provider-agnostic ``shipment`` object and the legacy ``shiprocket``
    object so old and new orders both resolve to a provider.
    """
    return await db.orders.find_one(
        {
            "$or": [
                {f"shipment.{field}": value},
                {f"shiprocket.{field}": value},
            ]
        },
        {"_id": 0},
    )


async def _resolve_provider(order_doc: dict | None, provider_param: str | None):
    if order_doc:
        provider_id = order_doc.get("delivery_provider")
        if not provider_id and order_doc.get("shiprocket"):
            provider_id = "shiprocket"
        if provider_id:
            provider = delivery_provider.provider_by_id(provider_id)
            if provider is not None:
                return provider
    if provider_param:
        return delivery_provider.provider_by_id(provider_param)
    return None


def _require_provider(provider) -> delivery_provider.DeliveryProvider:
    if provider is None:
        raise HTTPException(status_code=400, detail="Shipping is not configured.")
    if not provider.is_configured():
        raise HTTPException(status_code=400, detail="Shipping is not configured.")
    return provider


@router.get("/shipping/track/order/{source_order_id}")
async def track_order(source_order_id: str, provider_id: str | None = None):
    order_doc = await _order_for_attr("order_id", source_order_id)
    provider = _require_provider(await _resolve_provider(order_doc, provider_id))
    try:
        return await provider.track_by_source_order(source_order_id)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Shiprocket: {e.response.text[:300]}")


@router.get("/shipping/track/shipment/{shipment_id}")
async def track_shipment(shipment_id: int, provider_id: str | None = None):
    order_doc = await _order_for_attr("shipment_id", shipment_id)
    provider = _require_provider(await _resolve_provider(order_doc, provider_id))
    try:
        return await provider.track_by_shipment(shipment_id)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Shiprocket: {e.response.text[:300]}")


@router.get("/shipping/track/awb/{awb_code}")
async def track_awb(awb_code: str, provider_id: str | None = None):
    order_doc = await db.orders.find_one(
        {
            "$or": [
                {"tracking_event.awb_code": awb_code},
                {"shipment.awb_code": awb_code},
                {"shiprocket.awb_code": awb_code},
            ]
        },
        {"_id": 0},
    )
    provider = _require_provider(await _resolve_provider(order_doc, provider_id))
    try:
        return await provider.track_by_awb(awb_code)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Shiprocket: {e.response.text[:300]}")


@router.post("/webhooks/logistics")
async def shiprocket_webhook(request: Request, x_api_key: str | None = Header(default=None)):
    """Receive Shiprocket status updates. Configure this URL in Shiprocket dashboard → Settings → API → Webhooks."""
    if not SR_WEBHOOK_SECRET or not x_api_key or not hmac.compare_digest(x_api_key, SR_WEBHOOK_SECRET):
        raise HTTPException(status_code=401, detail="Invalid webhook key")
    body = await request.json()
    event_key = body.get("awb") or str(body.get("shipment_id") or body.get("sr_order_id") or uuid.uuid4())
    await db.shiprocket_events.update_one(
        {"event_key": event_key},
        {"$setOnInsert": {"event_key": event_key, "payload": body, "received_at": now_iso()}},
        upsert=True,
    )
    # Best-effort: update the matching order status.
    await db.orders.update_one(
        {"$or": [
            {"shipment.shipment_id": body.get("shipment_id")},
            {"shipment.order_id": body.get("sr_order_id")},
            {"shiprocket.shipment_id": body.get("shipment_id")},
            {"shiprocket.order_id": body.get("sr_order_id")},
        ]},
        {"$set": {"tracking_event": body, "shipping_status": body.get("current_status")}},
    )
    return {"ok": True}