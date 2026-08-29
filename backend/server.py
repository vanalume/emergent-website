from fastapi import FastAPI, APIRouter, HTTPException, Header, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import hmac
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import razorpay
import httpx

from catalog import PRODUCTS, CATEGORIES, PRODUCT_BY_ID, resolve_line_price, compute_shipping
import shiprocket

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

RZP_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '').strip()
RZP_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '').strip()
rzp_client = None
if RZP_KEY_ID and RZP_KEY_SECRET:
    rzp_client = razorpay.Client(auth=(RZP_KEY_ID, RZP_KEY_SECRET))

# Emergent managed email (Resend). Base URL is a constant so it survives deployment.
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "").strip()
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Vanalume")
OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "support@vanalume.com")
ADMIN_KEY = os.environ.get("ADMIN_KEY", "").strip()


async def send_notification_email(subject: str, html: str, reply_to: str | None = None):
    """Fire-and-forget notification to the business inbox. Never breaks the request."""
    if not EMAIL_KEY:
        return
    payload = {"to": [OWNER_EMAIL], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to:
        payload["contact_email"] = reply_to
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
    except Exception as e:  # noqa: BLE001
        logging.getLogger(__name__).error(f"Notification email failed: {e}")

app = FastAPI(title="Vanalume API")
api_router = APIRouter(prefix="/api")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ----------------------------- Models -----------------------------
class InquiryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=40)
    company: Optional[str] = Field(default=None, max_length=160)
    inquiry_type: Optional[str] = Field(default=None, max_length=80)
    message: str = Field(min_length=1, max_length=4000)


class Inquiry(InquiryCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)


class NewsletterCreate(BaseModel):
    email: EmailStr


class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, le=50)
    variant: Optional[str] = None
    size: Optional[str] = None


class Customer(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=3, max_length=40)
    address: str = Field(min_length=1, max_length=600)
    city: Optional[str] = Field(default=None, max_length=120)
    state: Optional[str] = Field(default=None, max_length=120)
    pincode: Optional[str] = Field(default=None, max_length=20)


class OrderCreate(BaseModel):
    items: List[CartItem] = Field(min_length=1)
    customer: Customer


# ----------------------------- Routes -----------------------------
@api_router.get("/")
async def root():
    return {"message": "Vanalume — Composed Living"}


@api_router.get("/products")
async def get_products():
    return {"products": PRODUCTS, "categories": CATEGORIES}


@api_router.get("/config")
async def get_config():
    return {
        "payment_configured": rzp_client is not None,
        "razorpay_key_id": RZP_KEY_ID or None,
        "shipping_configured": shiprocket.is_configured(),
    }


# ---- Inquiries ----
@api_router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(payload: InquiryCreate):
    inquiry = Inquiry(**payload.model_dump())
    await db.inquiries.insert_one(inquiry.model_dump())

    rows = "".join(
        f"<tr><td style='padding:6px 14px 6px 0;color:#5c3e2b;font-size:13px;white-space:nowrap;vertical-align:top'>{label}</td>"
        f"<td style='padding:6px 0;color:#2b2823;font-size:14px'>{value or '-'}</td></tr>"
        for label, value in [
            ("Name", inquiry.name),
            ("Email", inquiry.email),
            ("Phone", inquiry.phone),
            ("Company", inquiry.company),
            ("Enquiry type", inquiry.inquiry_type),
        ]
    )
    html = (
        "<div style='font-family:Arial,Helvetica,sans-serif;background:#f5f1ea;padding:28px'>"
        "<div style='max-width:560px;margin:0 auto;background:#ffffff;border-radius:6px;overflow:hidden'>"
        "<div style='background:#2b2823;padding:22px 28px'>"
        "<div style='color:#e6b980;font-size:11px;letter-spacing:2px;text-transform:uppercase'>Vanalume</div>"
        "<div style='color:#f8f6f2;font-size:20px;margin-top:6px'>New enquiry</div></div>"
        f"<div style='padding:24px 28px'><table style='width:100%;border-collapse:collapse'>{rows}</table>"
        f"<div style='margin-top:18px;padding-top:16px;border-top:1px solid #eee'>"
        f"<div style='color:#5c3e2b;font-size:13px;margin-bottom:6px'>Message</div>"
        f"<div style='color:#2b2823;font-size:14px;line-height:1.6;white-space:pre-wrap'>{inquiry.message}</div></div>"
        "</div></div></div>"
    )
    await send_notification_email(
        subject=f"New enquiry from {inquiry.name}"
        + (f" · {inquiry.inquiry_type}" if inquiry.inquiry_type else ""),
        html=html,
        reply_to=inquiry.email,
    )
    return inquiry


@api_router.get("/inquiries", response_model=List[Inquiry])
async def list_inquiries():
    docs = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Inquiry(**d) for d in docs]


def _check_admin(key: str | None):
    if not ADMIN_KEY or key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")


@api_router.post("/admin/verify")
async def admin_verify(payload: dict):
    _check_admin((payload or {}).get("key"))
    return {"ok": True}


@api_router.get("/admin/data")
async def admin_data(x_admin_key: str | None = Header(default=None)):
    _check_admin(x_admin_key)
    inquiries = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    newsletter = await db.newsletter.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    return {"inquiries": inquiries, "newsletter": newsletter}


# ---- Newsletter ----
@api_router.post("/newsletter")
async def subscribe_newsletter(payload: NewsletterCreate):
    existing = await db.newsletter.find_one({"email": payload.email}, {"_id": 0})
    if existing:
        return {"email": payload.email, "status": "already_subscribed"}
    await db.newsletter.insert_one({"id": str(uuid.uuid4()), "email": payload.email, "created_at": now_iso()})
    await send_notification_email(
        subject="New newsletter subscriber",
        html=(
            "<div style='font-family:Arial,Helvetica,sans-serif;padding:24px;color:#2b2823'>"
            "<p style='color:#5c3e2b;font-size:11px;letter-spacing:2px;text-transform:uppercase'>Vanalume</p>"
            f"<p style='font-size:16px'>New newsletter signup: <strong>{payload.email}</strong></p></div>"
        ),
        reply_to=payload.email,
    )
    return {"email": payload.email, "status": "subscribed"}


# ---- Orders ----
def compute_amount(items: List[CartItem]):
    """Compute (subtotal, shipping, total, line_items) in INR from the server-side catalogue."""
    subtotal = 0
    lines = []
    for it in items:
        product = PRODUCT_BY_ID.get(it.product_id)
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


@api_router.post("/orders")
async def create_order(payload: OrderCreate):
    subtotal, shipping, amount, lines = compute_amount(payload.items)
    order_id = str(uuid.uuid4())
    doc = {
        "id": order_id, "items": lines,
        "subtotal": subtotal, "shipping": shipping, "amount": amount, "currency": "INR",
        "customer": payload.customer.model_dump(),
        "status": "pending", "razorpay_order_id": None, "created_at": now_iso(),
    }
    razorpay_order_id = None
    if rzp_client is not None:
        rzp_order = rzp_client.order.create({
            "amount": amount * 100, "currency": "INR",
            "receipt": order_id[:40], "payment_capture": 1,
        })
        razorpay_order_id = rzp_order["id"]
        doc["razorpay_order_id"] = razorpay_order_id
    await db.orders.insert_one(doc)
    return {
        "order_id": order_id, "subtotal": subtotal, "shipping": shipping,
        "amount": amount, "currency": "INR",
        "payment_configured": rzp_client is not None,
        "razorpay_order_id": razorpay_order_id, "razorpay_key_id": RZP_KEY_ID or None,
    }


class VerifyPayment(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@api_router.post("/orders/verify")
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
    if order_doc and shiprocket.is_configured():
        # Idempotent: only create a shipment once per Vanalume order.
        if not order_doc.get("shiprocket"):
            shipment = await shiprocket.create_adhoc_order(order_doc)
            if shipment:
                await db.orders.update_one({"id": payload.order_id}, {"$set": {"shiprocket": shipment, "shiprocket_created_at": now_iso()}})
        else:
            shipment = order_doc["shiprocket"]

    return {"status": "paid", "order_id": payload.order_id, "shipment": shipment}


# ---- Shipping / tracking ----
@api_router.get("/shipping/track/order/{source_order_id}")
async def track_order(source_order_id: str):
    if not shiprocket.is_configured():
        raise HTTPException(status_code=400, detail="Shipping is not configured.")
    try:
        return await shiprocket.track_by_source_order(source_order_id)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Shiprocket: {e.response.text[:300]}")


@api_router.get("/shipping/track/shipment/{shipment_id}")
async def track_shipment(shipment_id: int):
    if not shiprocket.is_configured():
        raise HTTPException(status_code=400, detail="Shipping is not configured.")
    try:
        return await shiprocket.track_by_shipment(shipment_id)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Shiprocket: {e.response.text[:300]}")


@api_router.get("/shipping/track/awb/{awb_code}")
async def track_awb(awb_code: str):
    if not shiprocket.is_configured():
        raise HTTPException(status_code=400, detail="Shipping is not configured.")
    try:
        return await shiprocket.track_by_awb(awb_code)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Shiprocket: {e.response.text[:300]}")


SR_WEBHOOK_SECRET = os.environ.get("SHIPROCKET_WEBHOOK_SECRET", "").strip()


@api_router.post("/webhooks/logistics")
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
            {"shiprocket.shipment_id": body.get("shipment_id")},
            {"shiprocket.order_id": body.get("sr_order_id")},
        ]},
        {"$set": {"tracking_event": body, "shipping_status": body.get("current_status")}},
    )
    return {"ok": True}


@api_router.get("/orders")
async def list_orders():
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
