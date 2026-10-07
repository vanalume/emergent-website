#!/usr/bin/env python3
"""Standalone CMS content seeder (not part of the server).

Run from the directory that contains the backend `.env` file (it loads `.env`
from the current working directory).

Usage:
    python3 seed_content.py            # seed missing pages + back-fill missing sections
    python3 seed_content.py --force    # overwrite all pages from defaults
    python3 seed_content.py --export   # dump current content to content_export.json
"""
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import pymongo
from dotenv import load_dotenv

from content_migrate import missing_sections

HERE = Path(__file__).resolve().parent
DEFAULTS_PATH = HERE / "content_defaults.json"

load_dotenv()  # reads `.env` from the current working directory


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _connect():
    url = os.environ.get("DB_URL") or os.environ.get("MONGO_URL")
    name = os.environ.get("DB_NAME")
    if not url or not name:
        sys.exit("Error: DB_URL / DB_NAME not found in .env (run from the directory containing .env).")
    client = pymongo.MongoClient(url, serverSelectionTimeoutMS=15000)
    return client, client[name]


def seed(force: bool = False) -> None:
    client, db = _connect()
    defaults = json.loads(DEFAULTS_PATH.read_text())
    inserted = replaced = backfilled = added_sections = 0
    for slug, sections in defaults.items():
        existing = db.content.find_one({"slug": slug}, {"sections": 1})
        if existing is None:
            db.content.insert_one({"slug": slug, "sections": sections, "updated_at": _now()})
            inserted += 1
            continue
        if force:
            db.content.replace_one({"slug": slug}, {"slug": slug, "sections": sections, "updated_at": _now()})
            replaced += 1
            continue
        added = missing_sections(sections, existing.get("sections"))
        if added:
            db.content.update_one(
                {"slug": slug},
                {"$push": {"sections": {"$each": added}}, "$set": {"updated_at": _now()}},
            )
            backfilled += 1
            added_sections += len(added)
    client.close()
    print(
        f"Seeded content: {inserted} page(s) inserted, {replaced} replaced (--force), "
        f"{backfilled} page(s) back-filled ({added_sections} section(s) added) "
        f"({len(defaults)} pages total)."
    )


def export(path: str = "content_export.json") -> None:
    client, db = _connect()
    docs = list(db.content.find({}, {"_id": 0}).sort("slug", 1))
    out = {d.pop("slug"): d for d in docs}
    Path(path).write_text(json.dumps(out, ensure_ascii=False, indent=2))
    client.close()
    print(f"Exported {len(out)} pages to {path}.")


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--export" in args:
        export()
    else:
        seed(force="--force" in args)
