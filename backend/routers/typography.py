"""Typography settings — named text roles with per-breakpoint font sizes.

Stored as a single document in the `typography` collection. Breakpoints are a
fixed, ordered list (mobile, desktop — tablet can be added later without a
schema change); each token's `sizes` map is keyed by breakpoint.
"""
import json
from pathlib import Path

from fastapi import APIRouter

from database import db
from models import now_iso

router = APIRouter(tags=["typography"])

DEFAULTS_PATH = Path(__file__).resolve().parent.parent / "typography_defaults.json"

# Ordered breakpoints. `min_width` is the CSS lower bound in px (mobile is base).
BREAKPOINTS = [
    {"key": "mobile", "label": "Mobile", "min_width": 0},
    {"key": "desktop", "label": "Desktop", "min_width": 768},
]


def load_defaults() -> dict:
    return json.loads(DEFAULTS_PATH.read_text())


async def seed_typography() -> None:
    """Insert the default typography tokens once, if the collection is empty.

    Never overwrites — on a live database this only adds the doc on first deploy,
    and admin edits persist across restarts/redeploys.
    """
    if await db.typography.count_documents({}) > 0:
        return
    await db.typography.insert_one({
        "_id": "default",
        "tokens": load_defaults()["tokens"],
        "updated_at": now_iso(),
    })


@router.get("/typography")
async def get_typography():
    doc = await db.typography.find_one({}, {"_id": 0})
    tokens = doc["tokens"] if doc else load_defaults()["tokens"]
    return {"breakpoints": BREAKPOINTS, "tokens": tokens}
