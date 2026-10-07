"""Pure helpers for back-filling CMS content from content_defaults.json.

Kept dependency-free so both the server (routers/content.py, motor/async) and
the standalone CLI (seed_content.py, pymongo/sync) can share the same logic.
"""


def missing_sections(default_sections: list, current_sections: list) -> list:
    """Return the default sections whose `key` is absent from the stored page.

    Existing sections are never returned (and therefore never overwritten), so a
    back-fill adds new defaults only and is idempotent: once a page contains
    every default key, this returns an empty list.
    """
    current_keys = {(s or {}).get("key") for s in (current_sections or [])}
    return [s for s in (default_sections or []) if s.get("key") not in current_keys]
