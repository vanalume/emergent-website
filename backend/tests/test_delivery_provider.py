"""Unit tests for delivery-provider selection and startup validation."""
import pytest

from delivery_provider import DeliveryProviderRegistry


def _def(pid, pincodes, states):
    return {
        "id": pid,
        "label": pid,
        "module": "shiprocket",
        "class": "ShipRocketProvider",
        "coverage": {"pincodes": pincodes, "states": states},
    }


def make_registry(*defs):
    return DeliveryProviderRegistry({"providers": list(defs)})


def _select(reg, pincode=None, state=None):
    provider = reg.select(pincode, state)
    assert provider is not None
    return provider


class TestProviderSelection:
    def test_pincode_match_wins_over_state_match(self):
        reg = make_registry(
            _def("alpha", ["560001"], []),
            _def("beta", [], ["Karnataka"]),
        )
        assert _select(reg, "560001", "Karnataka").id == "alpha"

    def test_state_fallback_when_pincode_unmatched(self):
        reg = make_registry(
            _def("alpha", ["560001"], []),
            _def("beta", [], ["Karnataka"]),
        )
        assert _select(reg, "999999", "Karnataka").id == "beta"

    def test_pincode_match_takes_priority_even_with_state_fallback(self):
        reg = make_registry(
            _def("alpha", ["400001"], []),
            _def("beta", [], ["Maharashtra"]),
        )
        assert _select(reg, "400001", "Maharashtra").id == "alpha"

    def test_unknown_pincode_and_state_returns_none(self):
        reg = make_registry(_def("alpha", ["560001"], ["Karnataka"]))
        assert reg.select("999999", "Maharashtra") is None

    def test_leading_zero_pincode_preserved(self):
        reg = make_registry(_def("alpha", ["060001"], []))
        assert _select(reg, "060001").id == "alpha"

    def test_pincode_matched_as_int(self):
        reg = make_registry(_def("alpha", ["560001"], []))
        assert _select(reg, 560001).id == "alpha"

    def test_state_match_case_insensitive(self):
        reg = make_registry(_def("alpha", [], ["Karnataka"]))
        assert _select(reg, state="karnataka").id == "alpha"
        assert _select(reg, state="KARNATAKA").id == "alpha"

    def test_missing_or_empty_values_returns_none(self):
        reg = make_registry(_def("alpha", [], []))
        assert reg.select(None, None) is None
        assert reg.select("", "") is None

    def test_by_id(self):
        reg = make_registry(_def("alpha", [], []))
        provider = reg.by_id("alpha")
        assert provider is not None
        assert provider.id == "alpha"
        assert reg.by_id("missing") is None

    def test_first_state_match_wins_on_overlap(self):
        reg = make_registry(
            _def("alpha", ["560001"], ["Karnataka"]),
            _def("beta", ["400001"], ["Karnataka"]),
        )
        assert _select(reg, "999999", "Karnataka").id == "alpha"


class TestProviderValidation:
    def test_duplicate_pincode_across_providers_raises(self):
        with pytest.raises(ValueError, match="pincode 560001"):
            make_registry(
                _def("alpha", ["560001"], []),
                _def("beta", ["560001"], []),
            )

    def test_provider_missing_id_raises(self):
        with pytest.raises(ValueError, match="missing 'id'"):
            DeliveryProviderRegistry({"providers": [{}]})

    def test_shared_state_between_providers_is_allowed(self):
        reg = make_registry(
            _def("alpha", ["560001"], ["Karnataka"]),
            _def("beta", ["400001"], ["Karnataka"]),
        )
        assert len(reg.providers()) == 2