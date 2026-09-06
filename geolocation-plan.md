# Vanalume — Order Geo-Location Capture: Implementation Plan & Risk Report

> Status: **Proposed** · Author: E1 · For review before any implementation.

---

## 1 · Goal & scope

For every order placed from the website, capture the **network-derived geographic
location** of the person placing the order (as opposed to the *shipping* address,
which is already captured). The location is derived from the client IP address and
stored on the order for analytics, audit, and fraud-signal purposes.

This is **not** the same as the shipping address. The checkout already collects
`name`, `email`, `phone`, `address`, `city`, `state`, `pincode` (with city/state
auto-detected from pincode via `api.postalpincode.in`). The new capture is about
where the *device/network* is, not where the goods are going.

---

## 2 · Current state

- No existing IP or geo capture anywhere in the backend.
- No geo packages present in `backend/requirements.txt`.
- No `Request`/`X-Forwarded-For` handling in the order path.
- `POST /api/orders` (`backend/routers/orders.py`) builds the `Order` server-side
  from the client payload `{ items, customer }` and inserts into `db.orders`.
- `Order` model (`backend/models.py`) has `extra="allow"` and already carries
  `customer`, `subtotal`, `shipping`, `amount`, `status`, `created_at`, etc.

---

## 3 · Mechanism options

| Option | How | Pros | Cons |
|---|---|---|---|
| **A. MaxMind GeoLite2 (local `.mmdb`)** | `geoip2` package reads a bundled `GeoLite2-City.mmdb` | Offline, fast, no rate limits, no per-request latency | Needs account + license to download DB; periodic DB refresh |
| **B. Free HTTP API** (`ip-api.com`, `ipinfo.io`, `ipapi.co`) | `httpx` call per order | Zero setup, no DB file | External dependency, rate limits, latency, some need API key |
| **C. Edge headers** (`CF-IPCountry`, `X-Country-Code`) | Read a header set by Cloudflare/CDN | Free, zero code | Only if the app runs behind Cloudflare — it currently doesn't |
| **D. Browser `navigator.geolocation`** | Frontend asks for GPS | Precise, no IP needed | Requires user permission + consent banner; not IP-based |

**Recommendation:** **A (GeoLite2 + `geoip2`)** for robustness, with **B** as a
fallback/quick-start option.

---

## 4 · Changes & additions (checklist)

### Backend

1. **`models.py`** — add server-assigned fields to `Order`:
   - `ip: Optional[str] = None`
   - `geo: Optional[dict] = None` — or a typed `Geo` sub-model:
     `{ country, region, city, latitude, longitude, timezone, isp, is_vpn, is_proxy }`
2. **`config.py`** — env-driven settings:
   - `GEOIP_DB_PATH` (option A) or `GEO_API_KEY` / `GEO_API_URL` (option B)
   - `GEO_ENABLED` flag
3. **New `backend/geo.py`**:
   - `get_client_ip(request)` — reads `request.client.host`, honors **trusted**
     `X-Forwarded-For` only.
   - `geolocate(ip) -> dict | None` — wraps GeoLite2 or the API. Graceful: returns
     `None` on any failure.
4. **`routers/orders.py`** — `create_order` accepts `request: Request`, resolves IP
   + geo, attaches both to the `Order(...)` before `insert_one`. Geo failure must
   **never** block the order.
5. **`requirements.txt` + dev/prod `Dockerfile`** — add `geoip2` (and a `.mmdb`
   download step, or the API package if option B).
6. **`.env`** — new empty keys (`GEOIP_DB_PATH` / `GEO_API_KEY` / `GEO_ENABLED`).

### Frontend

7. **None** required for IP-based geo (the server derives it from the request).
   Only option D (browser geolocation) would touch `CartDrawer.jsx` to send lat/lon.

### Tests

8. **`backend/tests/test_geo.py`**:
   - Unit: `geolocate()` with a mocked IP→geo map; `get_client_ip()` XFF parsing.
   - Integration: order still succeeds when geo is disabled/unavailable; the order
     document contains `ip`/`geo` keys.

---

## 5 · Risk of IP-based geolocation (especially vs. bot traffic)

1. **Bots come from datacenter/cloud IPs.** A bot hammering `/orders` from
   AWS/GCP/scraping infra geolocates to the *datacenter's* city (e.g. "Boardman,
   US"), not the operator. IP geo won't identify a bot operator and can be
   actively misleading.
2. **Proxies / VPNs / Tor / residential botnets** make the IP look like a normal
   user in an arbitrary country. Bots routinely rotate proxies, so the location is
   trivially fakeable.
3. **`X-Forwarded-For` spoofing.** If the backend naively trusts `X-Forwarded-For`
   (instead of only trusting it from a known proxy), a bot can inject a forged
   residential IP and make the geo read whatever it wants.
4. **Shared IPs / CGNAT** (mobile carriers) make even real-user geo coarse and
   sometimes wrong.
5. **The core risk if you gate on it:** blocking "non-India IPs" or "VPN IPs" will
   (a) be bypassed instantly by bots via Indian/residential proxies, and (b) block
   legitimate users on VPNs or corporate networks — net false positives, little
   bot value.
6. **It's still a useful weak signal, not a gate:** "billing IP country ≠ shipping
   country", "datacenter/VPN ASN", "Tor exit" are classic fraud hints — but only as
   one input into a combined risk score alongside rate limiting, CAPTCHA/honeypot,
   Razorpay's own risk engine, 3DS, and behavioural checks.
7. **Privacy/compliance.** IP is personal data under GDPR and India's DPDP Act
   2023. Disclose it, and consider storing **coarse** geo (country/region/city) +
   a **hash** of the IP rather than the raw IP + precise lat/lon, with a retention
   window.

---

## 6 · Recommendations & decisions to confirm

1. Mechanism: **A (GeoLite2 local)** or **B (free API)**?
2. Store **raw IP + full geo**, or **coarse geo + hashed IP** (privacy-lean)?
3. Treat geo as **audit/analytics only**, or also surface a **risk flag** (e.g.
   `geo_risk: "datacenter" | "vpn" | "mismatch"`)?
4. Add **browser geolocation** (option D) later, or skip entirely?
