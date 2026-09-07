# Refund Flow — Vanalume

> Logged 2026-09-07 · Backend-only flow. Refunds a **captured** Razorpay payment when an
> order can no longer be fulfilled, then notifies the customer by email.

---

## 1 · Overview

When a customer's payment is verified but the ordered stock is no longer available
(the **oversell race**), the order is failed, the captured payment is refunded via
Razorpay, and the customer receives a branded "refund initiated" email.

The flow only runs on the **payment-confirmation** path — it is *not* triggered by
signature-verification failure (no captured payment → no refund).

---

## 2 · Trigger condition

`POST /api/orders/verify` succeeds through Razorpay signature verification, but
`decrement_stock` raises `HTTPException(409)` because `available_stock < quantity`
for at least one line item.

This happens when two orders for the same unit(s) are both placed (stock was still
available at `POST /orders` time), and the second payment verifies after the first
has already consumed the last unit.

---

## 3 · Order lifecycle (status state machine)

```
POST /orders ──────────────► status: "pending"     (Razorpay order created, not yet paid)
        │
        │ POST /orders/verify
        ├── signature fails ──────► "failed"        (no refund — payment ambiguous)
        ├── decrement OK ─────────► "paid"          (stock deducted, shipment created)
        └── decrement 409 ────────► "failed" → "refunded"   (refund + email)  ★ this flow
```

On the refund path the order is first marked `failed`, then (if the refund API
succeeds) updated to `refunded` with `refund_id` + `refunded_at`.

---

## 4 · Step-by-step (with code)

1. **Verify signature** — `routers/orders.py::verify_payment` calls
   `rzp_client.utility.verify_payment_signature(...)`. On failure: order → `failed`,
   return 400. No refund.

2. **Fetch order** — `db.orders.find_one({id})`. 404 if missing.

3. **First-time guard** — only deduct if `status != "paid"` (idempotent on retries).

4. **Deduct stock** — `inventory.py::decrement_stock(items)` does an atomic
   conditional `$inc` per line guarded by `stock >= quantity`:
   - variant line → `$inc` on `variants.$[matching].stock`
   - plain line → `$inc` on `stock`
   - `matched_count == 0` ⇒ raises `HTTPException(409, "Not enough stock for …")`

5. **On 409 (oversell)** — `routers/orders.py`:
   ```python
   await db.orders.update_one({"id": order_id}, {"$set": {"status": "failed"}})
   refund = refund_payment(payload.razorpay_payment_id, existing["amount"] or 0)
   if refund and refund.get("id"):
       await db.orders.update_one({"id": order_id},
           {"$set": {"status": "refunded", "refund_id": refund["id"], "refunded_at": now_iso()}})
   await send_refund_email(existing)
   raise   # re-raise the 409 to the client
   ```

6. **Refund** — `refunds.py::refund_payment(payment_id, amount)` calls
   `rzp_client.payment.refund(payment_id, {"amount": amount * 100})` (Razorpay takes
   paise). Defensive: returns `None` (never raises) if payments aren't configured,
   no payment id, or the API call fails.

7. **Notify customer** — `notifications.py::send_refund_email(order_doc)` reads
   `order_doc["customer"]["email"]` / `["name"]`, renders the template, and sends via
   Resend (fire-and-forget; logs on failure).

---

## 5 · Files & responsibilities

| File | Role |
|---|---|
| `backend/routers/orders.py` | `verify_payment` — orchestrates the refund path (step 5) |
| `backend/inventory.py` | `decrement_stock` — atomic, guard-railed stock deduction |
| `backend/refunds.py` | `refund_payment` — Razorpay refund API wrapper |
| `backend/notifications.py` | `send_customer_email`, `refund_email_html`, `send_refund_email` |
| `backend/config.py` | `SUPPORT_EMAIL`, `REFUND_WINDOW` (and `EMAIL_FROM`, `RESEND_API_KEY`) |
| `backend/templates/refund_email.html` | Reusable email template (placeholders) |
| `backend/templates/refund_email.sample.html` | Pre-filled sample for visual review |

---

## 6 · Email

**Subject:** `Your Vanalume order could not be completed`

**Placeholders (rendered via `.replace()`, not Jinja2 — the container image doesn't
install Jinja2):**

| Placeholder | Source |
|---|---|
| `{{customer_name}}` | `order.customer.name` (HTML-escaped) |
| `{{order_id}}` | `order.id` truncated to first 8 chars, uppercased |
| `{{amount}}` | `order.amount` formatted as `₹N,NNN` |
| `{{refund_window}}` | `config.REFUND_WINDOW` (default "5–7 business days") |
| `{{support_email}}` | `config.SUPPORT_EMAIL` (default `support@vanalume.com`) |

**Design** matches the site aesthetic: ivory `#f5f1ea` background, charcoal `#2b2823`
header band with gold `VANALUME` kicker + serif "Composed Living", white body, forest
`#395439` "Contact Support" pill, thin gold divider, footer tagline. Email-safe markup
(inline styles, table layout, Georgia/Helvetica fallbacks — web fonts don't render in
clients).

---

## 7 · Config / env

| Key | Default | Notes |
|---|---|---|
| `SUPPORT_EMAIL` | `support@vanalume.com` | shown in the email body + mailto |
| `REFUND_WINDOW` | `5–7 business days` | constant, not env-driven |
| `EMAIL_FROM` | `Vanalume <support@vanalume.com>` | must be a Resend-verified domain/sender for real delivery |
| `RESEND_API_KEY` | — | email is a no-op when empty |

---

## 8 · Idempotency & edge cases

- **Retried verify** → decrement + refund only run while `status != "paid"`; a
  `refunded` order skips re-refunding (guard `status != "paid"`).
- **Refund API fails** → order stays `failed` (not `refunded`), error logged; email is
  still sent telling the customer a refund was *initiated*. Manual reconciliation
  needed in Razorpay.
- **Payments disabled** (`rzp_client is None`) → `refund_payment` returns `None`; no
  refund, order `failed`.
- **No customer email** → `send_refund_email` returns silently.

---

## 9 · Testing status

**Verified (automated):** `py_compile`, module imports, template renders with all
placeholders replaced, `test_inventory.py` + `test_analytics.py` (17 passed).

**Not yet verified (needs live credentials):**
- Real Razorpay refund (captured test-mode payment).
- Real email delivery to an inbox.
- Full oversell → refund → email end-to-end.

**Suggested coverage to add:** mocked unit tests asserting `send_customer_email`
POSTs the correct Resend payload, and that the oversell branch calls `refund_payment`
+ `send_refund_email`; plus a Razorpay test-mode smoke test with a real inbox.
