"""/inquiries — create + list contact enquiries."""
from typing import List

from fastapi import APIRouter

from database import db
from notifications import inquiry_email_html, send_notification_email
from models import Inquiry, InquiryCreate

router = APIRouter(tags=["inquiries"])


@router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(payload: InquiryCreate):
    inquiry = Inquiry(**payload.model_dump())
    await db.inquiries.insert_one(inquiry.model_dump())

    await send_notification_email(
        subject=f"New enquiry from {inquiry.name}"
        + (f" · {inquiry.inquiry_type}" if inquiry.inquiry_type else ""),
        html=inquiry_email_html(inquiry),
        reply_to=inquiry.email,
    )
    return inquiry


@router.get("/inquiries", response_model=List[Inquiry])
async def list_inquiries():
    docs = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Inquiry(**d) for d in docs]