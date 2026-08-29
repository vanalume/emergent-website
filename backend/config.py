"""Centralised settings for the Vanalume backend.

Everything that depends on environment variables lives here so routers stay
free of env plumbing. The `.env` file is loaded once at import time.
"""
import os
from pathlib import Path

from dotenv import load_dotenv
import razorpay

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

# Razorpay (both keys required before payments activate)
RZP_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "").strip()
RZP_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "").strip()
rzp_client = None
if RZP_KEY_ID and RZP_KEY_SECRET:
    rzp_client = razorpay.Client(auth=(RZP_KEY_ID, RZP_KEY_SECRET))

# Emergent managed email (Resend)
EMAIL_BASE_URL = os.environ.get("EMAIL_BASE_URL", "https://integrations.emergentagent.com")
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "").strip()
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Vanalume")
OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "support@vanalume.com")

# Admin
ADMIN_KEY = os.environ.get("ADMIN_KEY", "").strip()

# Shiprocket webhook
SR_WEBHOOK_SECRET = os.environ.get("SHIPROCKET_WEBHOOK_SECRET", "").strip()

# CORS
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")