"""Unit tests for the CMS section back-fill helper (pure, no backend needed)."""
from content_migrate import missing_sections

DEFAULTS = [
    {"key": "a", "type": "text", "value": "A"},
    {"key": "b", "type": "text", "value": "B"},
    {"key": "c", "type": "richtext", "value": "C"},
]


class TestMissingSections:
    def test_all_missing_on_empty_page(self):
        assert [s["key"] for s in missing_sections(DEFAULTS, [])] == ["a", "b", "c"]

    def test_returns_only_absent_keys(self):
        current = [
            {"key": "a", "type": "text", "value": "edited by admin"},
            {"key": "c", "type": "text", "value": "x"},
        ]
        assert [s["key"] for s in missing_sections(DEFAULTS, current)] == ["b"]

    def test_idempotent_when_page_is_complete(self):
        current = [{"key": s["key"], "type": s["type"], "value": s["value"]} for s in DEFAULTS]
        assert missing_sections(DEFAULTS, current) == []

    def test_never_returns_an_existing_key(self):
        current = [{"key": "a", "type": "text", "value": "admin edited"}]
        assert all(s["key"] != "a" for s in missing_sections(DEFAULTS, current))

    def test_tolerates_null_and_incomplete_entries(self):
        assert [s["key"] for s in missing_sections(DEFAULTS, None)] == ["a", "b", "c"]
        assert [s["key"] for s in missing_sections(DEFAULTS, [None, {}])] == ["a", "b", "c"]
