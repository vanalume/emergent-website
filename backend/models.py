"""Pydantic models for the Vanalume backend.

These define the shape of every document stored in / read from MongoDB, and the
request/response bodies of the API. `Product` and `Category` mirror the catalogue
schema documented in `catalog.py` so the database conforms to the same models.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ----------------------------- Catalogue -----------------------------
class Variant(BaseModel):
    label: str
    sku: Optional[str] = None
    mrp: Optional[int] = None
    sp: Optional[int] = None
    image: Optional[str] = None


class Size(BaseModel):
    label: str
    mrp: Optional[int] = None
    sp: Optional[int] = None


class Ritual(BaseModel):
    title: str
    steps: List[str]


class Product(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    category: str
    collection: str
    name: str
    mrp: int
    sp: int
    images: List[str]
    fragrances: List[str] = Field(default_factory=list)
    variants: Optional[List[Variant]] = None
    sizes: Optional[List[Size]] = None
    desc: Optional[str] = None
    long_desc: Optional[str] = None
    ritual: Optional[Ritual] = None
    enquire: bool = False


class Category(BaseModel):
    id: str
    title: str
    tagline: str


# ----------------------------- Inquiries -----------------------------
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


# ----------------------------- Newsletter -----------------------------
class NewsletterCreate(BaseModel):
    email: EmailStr


# ----------------------------- Orders -----------------------------
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


class Order(BaseModel):
    """Single order schema — both the POST /orders request and the stored/returned
    document. `items` and `customer` come from the client; the remaining fields
    are server-assigned (created via defaults) or filled during the order lifecycle."""

    model_config = ConfigDict(extra="allow")

    items: List[CartItem] = Field(min_length=1)
    customer: Customer

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending"
    currency: str = "INR"
    subtotal: int = 0
    shipping: int = 0
    amount: int = 0
    created_at: str = Field(default_factory=now_iso)
    razorpay_order_id: Optional[str] = None
    delivery_provider: Optional[str] = None
    shipment_id: Optional[str] = None
    shipment: Optional[dict] = None
    shipment_created_at: Optional[str] = None


class VerifyPayment(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str