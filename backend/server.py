from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import razorpay

from catalog import PRODUCTS, CATEGORIES, PRODUCT_BY_ID

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


class Customer(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=3, max_length=40)
    address: str = Field(min_length=1, max_length=600)
    city: Optional[str] = Field(default=None, max_length=120)
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
    return {"payment_configured": rzp_client is not None, "razorpay_key_id": RZP_KEY_ID or None}


# ---- Inquiries ----
@api_router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(payload: InquiryCreate):
    inquiry = Inquiry(**payload.model_dump())
    await db.inquiries.insert_one(inquiry.model_dump())
    return inquiry


@api_router.get("/inquiries", response_model=List[Inquiry])
async def list_inquiries():
    docs = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Inquiry(**d) for d in docs]


# ---- Newsletter ----
@api_router.post("/newsletter")
async def subscribe_newsletter(payload: NewsletterCreate):
    existing = await db.newsletter.find_one({"email": payload.email}, {"_id": 0})
    if existing:
        return {"email": payload.email, "status": "already_subscribed"}
    await db.newsletter.insert_one({"id": str(uuid.uuid4()), "email": payload.email, "created_at": now_iso()})
    return {"email": payload.email, "status": "subscribed"}


# ---- Orders ----
def compute_amount(items: List[CartItem]):
    """Compute order total (in INR) from the server-side catalogue. Returns (amount, line_items)."""
    total = 0
    lines = []
    for it in items:
        product = PRODUCT_BY_ID.get(it.product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Unknown product: {it.product_id}")
        if product.get("price") is None:
            raise HTTPException(status_code=400, detail=f"{product['name']} is priced by weight — please enquire.")
        line_total = product["price"] * it.quantity
        total += line_total
        lines.append({
            "product_id": it.product_id,
            "name": product["name"],
            "collection": product.get("collection"),
            "variant": it.variant,
            "unit_price": product["price"],
            "quantity": it.quantity,
            "line_total": line_total,
        })
    return total, lines


@api_router.post("/orders")
async def create_order(payload: OrderCreate):
    amount, lines = compute_amount(payload.items)
    order_id = str(uuid.uuid4())
    doc = {
        "id": order_id,
        "items": lines,
        "amount": amount,
        "currency": "INR",
        "customer": payload.customer.model_dump(),
        "status": "pending",
        "razorpay_order_id": None,
        "created_at": now_iso(),
    }

    razorpay_order_id = None
    if rzp_client is not None:
        rzp_order = rzp_client.order.create({
            "amount": amount * 100,  # paise
            "currency": "INR",
            "receipt": order_id[:40],
            "payment_capture": 1,
        })
        razorpay_order_id = rzp_order["id"]
        doc["razorpay_order_id"] = razorpay_order_id

    await db.orders.insert_one(doc)

    return {
        "order_id": order_id,
        "amount": amount,
        "currency": "INR",
        "payment_configured": rzp_client is not None,
        "razorpay_order_id": razorpay_order_id,
        "razorpay_key_id": RZP_KEY_ID or None,
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

    await db.orders.update_one(
        {"id": payload.order_id},
        {"$set": {"status": "paid", "razorpay_payment_id": payload.razorpay_payment_id, "paid_at": now_iso()}},
    )
    return {"status": "paid", "order_id": payload.order_id}


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
