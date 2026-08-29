"""GET /config — runtime configuration flags for the frontend."""
from fastapi import APIRouter

import delivery_provider
from config import RZP_KEY_ID, rzp_client

router = APIRouter(tags=["config"])


@router.get("/config")
async def get_config():
    return {
        "payment_configured": rzp_client is not None,
        "razorpay_key_id": RZP_KEY_ID or None,
        "delivery_providers": [
            {"id": p.id, "label": p.config.get("label"), "configured": p.is_configured()}
            for p in delivery_provider.all_providers()
        ],
    }