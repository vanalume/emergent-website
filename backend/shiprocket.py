"""Shiprocket integration for Vanalume.

Auth flow: POST /auth/login → JWT (~10 day lifetime, no refresh endpoint).
We cache the token in-process and force a re-login on 401 or before expiry.

The module stays fully dormant until SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD and
SHIPROCKET_PICKUP_LOCATION are set — is_configured() will return False and every
helper is a no-op. This mirrors the Razorpay approach used in server.py.
"""
from __future__ import annotations
import os
import time
import logging
from datetime import datetime, timezone
from typing import Any, Optional

import httpx

log = logging.getLogger("vanalume.shiprocket")

SR_BASE = "https://apiv2.shiprocket.in/v1/external"


def _env(key: str) -> str:
    return (os.environ.get(key) or "").strip()


def is_configured() -> bool:
    return bool(_env("SHIPROCKET_EMAIL") and _env("SHIPROCKET_PASSWORD") and _env("SHIPROCKET_PICKUP_LOCATION"))


_token: Optional[str] = None
_token_expiry: float = 0.0


async def _login(client: httpx.AsyncClient) -> str:
    global _token, _token_expiry
    r = await client.post(
        f"{SR_BASE}/auth/login",
        json={"email": _env("SHIPROCKET_EMAIL"), "password": _env("SHIPROCKET_PASSWORD")},
        timeout=20,
    )
    r.raise_for_status()
    data = r.json()
    _token = data["token"]
    # JWT is valid ~240h. Refresh comfortably before that.
    _token_expiry = time.time() + 9 * 24 * 3600
    return _token


async def _token_valid(client: httpx.AsyncClient, force: bool = False) -> str:
    global _token
    if _token and time.time() < _token_expiry and not force:
        return _token
    return await _login(client)


async def _request(method: str, path: str, **kwargs) -> Any:
    async with httpx.AsyncClient(timeout=30) as client:
        token = await _token_valid(client)
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        r = await client.request(method, f"{SR_BASE}{path}", headers=headers, **kwargs)
        if r.status_code == 401:
            token = await _token_valid(client, force=True)
            headers["Authorization"] = f"Bearer {token}"
            r = await client.request(method, f"{SR_BASE}{path}", headers=headers, **kwargs)
        r.raise_for_status()
        return r.json()


def _build_adhoc_payload(order_doc: dict) -> dict:
    """Convert a Vanalume order document into Shiprocket's /orders/create/adhoc payload."""
    c = order_doc["customer"]
    items = [
        {
            "name": li["name"] + (f" · {li['size']}" if li.get("size") else "") + (f" · {li['variant']}" if li.get("variant") else ""),
            "sku": li["product_id"] + ("-" + str(li.get("size") or "")) + ("-" + str(li.get("variant") or "")),
            "units": int(li["quantity"]),
            "selling_price": float(li["unit_price"]),
            "discount": 0,
            "tax": 0,
        }
        for li in order_doc["items"]
    ]
    return {
        "order_id": f"VAN-{order_doc['id'][:32]}",
        "order_date": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"),
        "pickup_location": _env("SHIPROCKET_PICKUP_LOCATION"),
        "channel_id": "",
        "billing_customer_name": c["name"],
        "billing_last_name": "",
        "billing_address": c["address"],
        "billing_address_2": "",
        "billing_city": c.get("city") or "",
        "billing_pincode": int(str(c.get("pincode") or "0").strip() or 0),
        "billing_state": c.get("state") or "",
        "billing_country": "India",
        "billing_email": c["email"],
        "billing_phone": c["phone"],
        "shipping_is_billing": True,
        "shipping_customer_name": c["name"],
        "shipping_address": c["address"],
        "shipping_address_2": "",
        "shipping_city": c.get("city") or "",
        "shipping_pincode": int(str(c.get("pincode") or "0").strip() or 0),
        "shipping_state": c.get("state") or "",
        "shipping_country": "India",
        "shipping_email": c["email"],
        "shipping_phone": c["phone"],
        "order_items": items,
        "payment_method": "Prepaid",
        "shipping_charges": order_doc.get("shipping", 0),
        "giftwrap_charges": 0,
        "transaction_charges": 0,
        "total_discount": 0,
        "sub_total": order_doc.get("subtotal", 0),
        "length": 15,
        "breadth": 15,
        "height": 15,
        "weight": 0.5,
    }


async def create_adhoc_order(order_doc: dict) -> Optional[dict]:
    """Create a Shiprocket order. Returns Shiprocket response or None if not configured/failed."""
    if not is_configured():
        return None
    try:
        payload = _build_adhoc_payload(order_doc)
        return await _request("POST", "/orders/create/adhoc", json=payload)
    except httpx.HTTPStatusError as e:
        log.error("Shiprocket create failed: %s %s", e.response.status_code, e.response.text[:300])
        return {"error": f"shiprocket_http_{e.response.status_code}", "detail": e.response.text[:300]}
    except Exception as e:  # noqa: BLE001
        log.error("Shiprocket create failed: %s", e)
        return {"error": "shiprocket_exception", "detail": str(e)}


async def track_by_source_order(source_order_id: str) -> dict:
    return await _request("GET", "/courier/track", params={"order_id": source_order_id})


async def track_by_shipment(shipment_id: int) -> dict:
    return await _request("GET", f"/courier/track/shipment/{shipment_id}")


async def track_by_awb(awb_code: str) -> dict:
    return await _request("GET", f"/courier/track/awb/{awb_code}")
