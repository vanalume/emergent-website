"""/newsletter — subscribe and de-duplicate."""
import uuid

from fastapi import APIRouter

from database import db
from models import NewsletterCreate, now_iso
from notifications import newsletter_email_html, send_notification_email

router = APIRouter(tags=["newsletter"])


@router.post("/newsletter")
async def subscribe_newsletter(payload: NewsletterCreate):
    existing = await db.newsletter.find_one({"email": payload.email}, {"_id": 0})
    if existing:
        return {"email": payload.email, "status": "already_subscribed"}
    await db.newsletter.insert_one({"id": str(uuid.uuid4()), "email": payload.email, "created_at": now_iso()})
    await send_notification_email(
        subject="New newsletter subscriber",
        html=newsletter_email_html(payload.email),
        reply_to=payload.email,
    )
    return {"email": payload.email, "status": "subscribed"}