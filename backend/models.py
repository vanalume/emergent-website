"""Pydantic models for the Vanalume backend.

These define the shape of every document stored in / read from MongoDB, and the
request/response bodies of the API. `Product` and `Category` mirror the catalogue
schema documented in `catalog.py` so the database conforms to the same models.
"""
import uuid
from datetime import datetime, timezone
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ----------------------------- Catalogue -----------------------------
class Variant(BaseModel):
    label: str
    sku: Optional[str] = None
    mrp: Optional[int] = None
    sp: Optional[int] = None
    images: List[str] = Field(default_factory=list)
    desc: Optional[str] = None


class Ritual(BaseModel):
    title: str
    steps: List[str]


class Product(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    category: str
    subcategory: Optional[str] = None
    collection: str
    name: str
    mrp: int
    sp: int
    images: List[str]
    fragrances: List[str] = Field(default_factory=list)
    variants: Optional[List[Variant]] = None
    desc: Optional[str] = None
    long_desc: Optional[str] = None
    ritual: Optional[Ritual] = None
    draft: bool = False


class SubCategory(BaseModel):
    id: str
    title: str
    tagline: Optional[str] = None


class Category(BaseModel):
    id: str
    title: str
    tagline: str
    subcategories: Optional[List[SubCategory]] = None
    order: Optional[int] = None


class CategoryUpdate(BaseModel):
    title: Optional[str] = None
    tagline: Optional[str] = None
    subcategories: Optional[List[SubCategory]] = None


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


class OrderItem(CartItem):
    """A resolved line stored on an order: raw cart fields plus the product
    name and unit price charged, so fulfillment (Shiprocket) needs no re-lookup."""
    model_config = ConfigDict(extra="allow")
    name: Optional[str] = None
    collection: Optional[str] = None
    unit_price: Optional[int] = None
    line_total: Optional[int] = None


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

    items: List[OrderItem] = Field(min_length=1)
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


# ----------------------------- Offers -----------------------------
class Offer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category_ids: List[str] = Field(default_factory=list)
    discount_percent: int = Field(ge=0, le=90)
    active: bool = True
    starts_at: Optional[str] = None
    ends_at: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ----------------------------- Content (CMS) -----------------------------
class Section(BaseModel):
    key: str
    type: str
    value: Any = None


class Page(BaseModel):
    slug: str
    sections: List[Section]
    updated_at: str = Field(default_factory=now_iso)