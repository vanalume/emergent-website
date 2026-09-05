"""/api/offers — public, currently-active offers."""
from fastapi import APIRouter

from pricing import get_active_offers

router = APIRouter(tags=["offers"])


@router.get("/offers/active")
async def active_offers():
    return await get_active_offers()
