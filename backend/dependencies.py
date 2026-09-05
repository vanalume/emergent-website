"""Shared FastAPI dependencies."""
from fastapi import Header, HTTPException

from config import ADMIN_KEY


async def require_admin(x_admin_key: str | None = Header(default=None)):
    """Gate admin routes behind the shared ADMIN_KEY (sent as X-Admin-Key)."""
    if not ADMIN_KEY or x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
