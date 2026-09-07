"""Razorpay refunds.

`refund_payment` refunds a captured payment in whole rupees (the Razorpay SDK
takes paise). It is defensive: returns None (never raises) when payments aren't
configured, no payment id is known, or the refund API call fails, so a refund
failure can't break the order-verification request.
"""
import logging

from config import rzp_client

logger = logging.getLogger(__name__)


def refund_payment(payment_id: str | None, amount: int) -> dict | None:
    """Refund ``amount`` (INR) for a captured payment. Returns the refund object
    (with an ``id``) on success, or None if a refund could not be initiated."""
    if rzp_client is None or not payment_id or not amount:
        return None
    try:
        return rzp_client.payment.refund(payment_id, {"amount": int(amount) * 100})
    except Exception as exc:  # noqa: BLE001
        logger.error("Refund failed for payment %s (amount %s): %s", payment_id, amount, exc)
        return None
