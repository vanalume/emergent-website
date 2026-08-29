"""Delivery provider abstraction.

A ``DeliveryProvider`` is the base interface every integrated delivery provider
implements. Providers are selected per-destination by pincode first, then by
state, using static coverage data from ``delivery_providers.json``.

Selection rules:
  1. Provider coverage is checked at ``pincode`` granularity first.
  2. If no provider lists the pincode, coverage falls back to ``state``.
  3. Invariant enforced at load: a pincode must never be listed by more than
     one provider, so a pincode match is always unambiguous.
"""
from __future__ import annotations

import importlib
import json
import logging
import re
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, List, Optional

log = logging.getLogger("vanalume.delivery_provider")

PROVIDER_JSON_PATH = Path(__file__).with_name("delivery_providers.json")


def _norm(value) -> str:
    """Normalise a pincode / state value for matching."""
    if value is None:
        return ""
    v = str(value).strip()
    return v.casefold() if re.match(r"^[A-Za-z]", v) else v


class DeliveryProvider(ABC):
    """Base interface shared by every integrated delivery provider."""

    def __init__(self, config: Dict[str, Any]):
        self.config = config

    # -- identity / capability -------------------------------------------
    @property
    @abstractmethod
    def id(self) -> str:
        """Stable provider id (must match the id in delivery_providers.json)."""

    @abstractmethod
    def is_configured(self) -> bool:
        """True when the provider's credentials are present in the environment."""

    # -- fulfillment ------------------------------------------------------
    @abstractmethod
    async def create_adhoc_order(self, order_doc: dict) -> Optional[dict]:
        """Create a shipment/ad-hoc order. Returns the provider response or None."""

    def shipment_id_from(self, response: dict) -> Optional[str]:
        """Extract the provider's shipment id from a create response."""
        return response.get("shipment_id")

    # -- tracking (base set of APIs supported by all providers) ----------
    @abstractmethod
    async def track_by_source_order(self, source_order_id: str) -> dict:
        """Track by this provider's order id."""

    @abstractmethod
    async def track_by_shipment(self, shipment_id: int) -> dict:
        """Track by the provider's shipment id."""

    @abstractmethod
    async def track_by_awb(self, awb_code: str) -> dict:
        """Track by air waybill number."""


class DeliveryProviderRegistry:
    """Loads static provider coverage and selects a provider for a destination."""

    def __init__(self, data: Dict[str, Any]):
        self._defs: List[Dict[str, Any]] = list(data.get("providers", []))
        self._instances: Dict[str, DeliveryProvider] = {}
        self._pincode_index: Dict[str, Dict[str, Any]] = {}
        self._state_index: Dict[str, List[Dict[str, Any]]] = {}
        self._validate_and_index()

    def _validate_and_index(self) -> None:
        for provider_def in self._defs:
            pid = provider_def.get("id")
            if not pid:
                raise ValueError("delivery_providers.json: provider missing 'id'")
            coverage = provider_def.get("coverage") or {}
            for pincode in coverage.get("pincodes", []):
                pin = _norm(pincode)
                if not pin:
                    continue
                if pin in self._pincode_index:
                    other = self._pincode_index[pin]["id"]
                    raise ValueError(
                        f"delivery_providers.json: pincode {pin} is claimed by both "
                        f"'{other}' and '{pid}'. A pincode may only be served by one provider."
                    )
                self._pincode_index[pin] = provider_def
            for state in coverage.get("states", []):
                self._state_index.setdefault(_norm(state), []).append(provider_def)

    def _instantiate(self, provider_def: Dict[str, Any]) -> DeliveryProvider:
        module_name = provider_def.get("module", "")
        class_name = provider_def["class"]
        module = importlib.import_module(module_name)
        cls = getattr(module, class_name)
        return cls(provider_def)

    def _get(self, provider_def: Dict[str, Any]) -> DeliveryProvider:
        pid = provider_def["id"]
        if pid not in self._instances:
            self._instances[pid] = self._instantiate(provider_def)
        return self._instances[pid]

    def providers(self) -> List[DeliveryProvider]:
        return [self._get(d) for d in self._defs]

    def by_id(self, provider_id: str) -> Optional[DeliveryProvider]:
        for d in self._defs:
            if d["id"] == provider_id:
                return self._get(d)
        return None

    def select(self, pincode=None, state=None) -> Optional[DeliveryProvider]:
        """Pick the provider for a destination: pincode match first, state fallback."""
        pin = _norm(pincode)
        if pin and pin in self._pincode_index:
            return self._get(self._pincode_index[pin])
        st = _norm(state)
        if st and st in self._state_index:
            return self._get(self._state_index[st][0])
        return None


_registry: Optional[DeliveryProviderRegistry] = None


def _load_registry() -> DeliveryProviderRegistry:
    global _registry
    if _registry is None:
        _registry = DeliveryProviderRegistry(json.loads(PROVIDER_JSON_PATH.read_text()))
    return _registry


def validate_provider_config() -> None:
    """Load and validate the static provider config. Called at server startup."""
    _load_registry()
    log.info("validated delivery provider config from %s", PROVIDER_JSON_PATH.name)


def select_delivery_provider(pincode=None, state=None) -> Optional[DeliveryProvider]:
    """Choose a delivery provider for the destination pincode/state, or None."""
    return _load_registry().select(pincode, state)


def provider_by_id(provider_id: str) -> Optional[DeliveryProvider]:
    return _load_registry().by_id(provider_id)


def all_providers() -> List[DeliveryProvider]:
    return _load_registry().providers()