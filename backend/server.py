"""Vanalume API — application assembly.

Every route group lives in `routers/`; models live in `models.py`; MongoDB,
configuration, notifications and pricing logic are in dedicated modules. This
file only ties them together and seeds the catalogue into MongoDB at startup.
"""
import logging

from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware

import delivery_provider
from catalog import seed_catalog
from config import CORS_ORIGINS
from database import close_db_client, db
from routers import admin, config, inquiries, newsletter, orders, products, root, shipping

app = FastAPI(title="Vanalume API")
api_router = APIRouter(prefix="/api")
api_router.include_router(root.router)
api_router.include_router(products.router)
api_router.include_router(config.router)
api_router.include_router(inquiries.router)
api_router.include_router(admin.router)
api_router.include_router(newsletter.router)
api_router.include_router(orders.router)
api_router.include_router(shipping.router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS.split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def seed_catalog_on_startup():
    """Validate delivery provider config, then persist the seed catalogue into MongoDB."""
    delivery_provider.validate_provider_config()
    await seed_catalog(db)


@app.on_event("shutdown")
async def shutdown_db_client():
    close_db_client()