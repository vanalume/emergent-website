"""Emergent managed email notifications (Resend)."""
import logging

import httpx

from config import EMAIL_BASE_URL, EMAIL_FROM_NAME, EMAIL_KEY, OWNER_EMAIL


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