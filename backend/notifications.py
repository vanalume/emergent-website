"""Resend transactional email notifications."""
import logging
from html import escape
from pathlib import Path

import httpx

from config import EMAIL_FROM, OWNER_EMAIL, REFUND_WINDOW, RESEND_API_KEY, SUPPORT_EMAIL

RESEND_API_URL = "https://api.resend.com/emails"
TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"


async def send_notification_email(subject: str, html: str, reply_to: str | None = None):
    """Fire-and-forget notification to the business inbox. Never breaks the request."""
    if not RESEND_API_KEY:
        return
    payload = {
        "from": EMAIL_FROM,
        "to": [OWNER_EMAIL],
        "subject": subject,
        "html": html,
    }
    if reply_to:
        payload["reply_to"] = reply_to
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                RESEND_API_URL,
                headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
                json=payload,
            )
        resp.raise_for_status()
    except Exception as e:  # noqa: BLE001
        logging.getLogger(__name__).error(f"Notification email failed: {e}")


def inquiry_email_html(inquiry) -> str:
    """HTML body for the new-enquiry notification."""
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
    return (
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


def newsletter_email_html(email: str) -> str:
    return (
        "<div style='font-family:Arial,Helvetica,sans-serif;padding:24px;color:#2b2823'>"
        "<p style='color:#5c3e2b;font-size:11px;letter-spacing:2px;text-transform:uppercase'>Vanalume</p>"
        f"<p style='font-size:16px'>New newsletter signup: <strong>{email}</strong></p></div>"
    )


async def send_customer_email(to: str, subject: str, html: str) -> None:
    """Fire-and-forget email to a customer. Never breaks the calling request."""
    if not RESEND_API_KEY or not to:
        return
    payload = {
        "from": EMAIL_FROM,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                RESEND_API_URL,
                headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
                json=payload,
            )
        resp.raise_for_status()
    except Exception as e:  # noqa: BLE001
        logging.getLogger(__name__).error(f"Customer email failed: {e}")


def refund_email_html(customer_name: str, order_id: str, amount: str, refund_window: str, support_email: str) -> str:
    """Render the refund-notice email from the template file."""
    html = (TEMPLATES_DIR / "refund_email.html").read_text()
    return (
        html.replace("{{customer_name}}", customer_name)
        .replace("{{order_id}}", order_id)
        .replace("{{amount}}", amount)
        .replace("{{refund_window}}", refund_window)
        .replace("{{support_email}}", support_email)
    )


async def send_refund_email(order_doc: dict) -> None:
    """Notify the customer that their order failed and a refund was initiated."""
    customer = order_doc.get("customer") or {}
    to = customer.get("email")
    if not to:
        return
    name = escape(customer.get("name") or "there")
    order_id = (order_doc.get("id") or "")[:8].upper()
    amount = f"₹{int(order_doc.get('amount') or 0):,}"
    html = refund_email_html(name, order_id, amount, REFUND_WINDOW, SUPPORT_EMAIL)
    await send_customer_email(to, "Your Vanalume order could not be completed", html)