# Vanalume Admin Dashboard — Staged Implementation Plan

> Reference: `dashboard-plan.md` shared by user.
> Author: E1 · Draft for approval before any implementation begins.

---

## 0 · Deviations from the brief (please confirm)

The brief specifies a few tools that don't match our current stack. I'd like to lock the substitutions **before** we begin — none of them change what the user sees, only *how* we implement it.

| Brief says | Our stack | Proposed substitution | Impact |
|---|---|---|---|
| **Multer** (Node/Express file middleware) | FastAPI (Python) | FastAPI's native `UploadFile` — identical dropzone UX, native async, no extra dep | None visible |
| **Supabase Object Storage** | We already have Emergent-managed object storage wired via `EMERGENT_LLM_KEY` (playbook already used elsewhere) | **Option A (recommended):** use Emergent-managed storage — zero new keys, ready to ship. **Option B:** Supabase Storage — requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` from you and vendor lock-in on Supabase | You choose |
| **TailAdmin** (paid/PRO in most parts) | React + Tailwind + shadcn/ui + framer-motion | Use **shadcn/ui** primitives (`Table`, `Sheet`, `Dialog`, `Tabs`, `Form`, `Command`) which are already installed, plus **Recharts** for charts. Layout borrows the *ideas* from TailAdmin (sidebar + top bar + KPI cards) but styled to match Vanalume's warm palette / Didot + Avenir Next typography. Flowbite tabs are optional and only if shadcn's don't cover a case | Fully themed, no license cost, native to our components |

**Approval needed on:** (a) storage choice, (b) confirmation that shadcn+Recharts substituting TailAdmin is acceptable.

---

## 1 · Guiding principles

1. **Component-first.** Every reusable admin primitive is built and screenshotted **before** any feature glue. See Phase 1.
2. **Auth on every admin route.** Existing `ADMIN_KEY` gate is extended to every new endpoint via a shared `_check_admin` dependency.
3. **Server-side price is the source of truth.** Offers and prices are always computed on the backend at checkout — client-shown discounts are display-only.
4. **Nothing breaks retail.** Every phase ships with the site still purchasable end-to-end. If a phase risks the checkout flow, it's behind a flag until verified.
5. **One phase = one deploy.** Every phase ends with a green testing_agent run + optional user acceptance in preview before you deploy to production.

---

## Phase 1 · Admin shell & reusable primitives  *(no product changes yet)*

**Goal:** you can log in, see an empty branded admin, and every primitive below is screenshottable in isolation.

**Backend:** none new. Existing `/api/admin/verify` stays as the auth handshake.

**Frontend (new files):**
- `frontend/src/admin/AdminShell.jsx` — sidebar + top bar layout, warm-cream palette, Didot section headings, Avenir Next nav
- `frontend/src/admin/AdminAuth.jsx` — the existing key form, cleaned up + persistent (sessionStorage)
- `frontend/src/admin/primitives/DataTable.jsx` — column config, search box, pagination, row actions
- `frontend/src/admin/primitives/FormField.jsx` — labelled input, textarea, number, select (single wrapper for the whole admin)
- `frontend/src/admin/primitives/StringArrayEditor.jsx` — tag-style editor for `fragrances`, `ritual.steps`, etc.
- `frontend/src/admin/primitives/ImageDropzone.jsx` — drag/drop + click-to-upload, preview, remove (backed by Phase 2 upload endpoint stub)
- `frontend/src/admin/primitives/StatCard.jsx` — KPI card
- `frontend/src/admin/primitives/RangePicker.jsx` — Last week / month / quarter / All time / custom (used in Phase 6)
- Routes wired into `App.js`: `/admin`, `/admin/products`, `/admin/categories`, `/admin/offers`, `/admin/orders`, `/admin/sales`, `/admin/content`

**Deliverable:** empty admin with working sidebar. Every primitive above renders on a `/admin/kitchensink` demo page.

**Approval gate:** you review the visual + component set before we glue any data in.

---

## Phase 2 · Object storage & image upload endpoint

**Goal:** any admin form can accept an image and get back a permanent URL.

**Backend:**
- `backend/storage.py` — thin module with `put_object(path, bytes, content_type)`, `get_object(path)`, `init_storage()` (Emergent playbook) **or** Supabase client (whichever you picked in §0)
- `POST /api/admin/upload` (admin-only) — accepts multipart file, returns `{ path, url }`, stores a row in `db.files` for future soft-delete
- `GET /api/files/{path:path}` — serves the file with correct MIME (only needed for Emergent-managed; Supabase serves via CDN)

**Frontend:**
- `ImageDropzone` from Phase 1 becomes real — POSTs to `/api/admin/upload`, shows progress, returns URL on success

**Test:** upload a JPG from the kitchensink page, refresh, image still loads from stored URL.

---

## Phase 3 · Category CRUD

**Goal:** you can add, edit, delete, and re-order categories from the admin.

**Backend (new router `routers/admin_catalog.py`):**
- `GET  /api/admin/categories` — all categories
- `POST /api/admin/categories` — create `{id, title, tagline, subcategories?}`
- `PUT  /api/admin/categories/{id}` — update
- `DELETE /api/admin/categories/{id}` — delete (blocked if any product still uses this category — returns 409 with an explanatory message)
- Existing `GET /api/products` unchanged — still serves categories to the shop

**Frontend (`admin/pages/Categories.jsx`):**
- Category list as `DataTable`: title · tagline · #products · Edit / Delete
- "Add category" button → `Sheet` (side panel) with title, tagline, sub-categories editor
- Confirmation dialog on delete

**Test:** create → shows up on Shop page filter chips within a few seconds; edit tagline → reflected on Shop; delete → 409 if products present.

---

## Phase 4 · Product CRUD  *(including variants & sizes)*

**Goal:** full product lifecycle from the admin, no code changes needed for new SKUs.

**Backend (same router):**
- `GET    /api/admin/products` — full list
- `POST   /api/admin/products` — create
- `PUT    /api/admin/products/{id}` — update
- `DELETE /api/admin/products/{id}`
- Validates against the existing `Product` Pydantic model — nothing new to design, existing MongoDB schema is already extra=allow-safe

**Frontend (`admin/pages/Products.jsx` + `admin/pages/ProductEditor.jsx`):**
- `Products.jsx`: table with image thumbnail, name, category, MRP, SP, status, actions
- `ProductEditor.jsx` opens on **Add** or **Edit**. Layout **mirrors the public PDP** so what you see in the editor is what buyers see. Fields:
  - Text: `id` (auto), `name`, `collection`, `desc`, `long_desc`, `category` (select)
  - Numbers: `mrp`, `sp`
  - Toggle: `enquire`
  - String arrays: `fragrances` (StringArrayEditor)
  - Images: `ImageDropzone` (multi-file, ordered)
  - **Variants** panel (Tabs): add/remove variant rows, each with label, sku, mrp?, sp?, image?
  - **Sizes** panel: same shape
  - **Ritual** panel: title + editable steps array
- Save at bottom → `PUT`/`POST` → toast + return to table
- Bulk-safe: table has "Duplicate" action for cloning a product

**Test:** create a new product with 2 images and a variant → appears in Shop live → Add to Cart uses the correct SP.

---

## Phase 5 · Seasonal Offers

**Goal:** you release percentage-off offers by category with an on/off switch.

**Backend:**
- New Mongo collection `offers` and model:
  ```
  Offer(id, name, category_id, discount_percent [0-90], active: bool, starts_at?, ends_at?, created_at)
  ```
- `GET/POST/PUT/DELETE /api/admin/offers` — full CRUD
- `GET /api/offers/active` — public, returns currently-active offers by category
- **Price engine change (single point of truth):** `pricing.py` gets `apply_offer(product, base_sp)` which reads active offers for the product's category and returns `{final_sp, offer}`. Called by:
  - `GET /api/products` — response items now include `offer_price` and `offer` (nullable) so the storefront can render the discount
  - Order/cart calculation in `POST /api/orders` — uses `apply_offer` server-side; MRP/SP never trusted from the client
- Idempotent: if two offers overlap on a category, the **higher discount** wins.

**Frontend Admin (`admin/pages/Offers.jsx`):**
- Table of offers with active toggle, category, discount %, window, actions
- Add / Edit sheet with validation

**Frontend Retail (surgical changes):**
- `ProductCard` and `ProductDetail`: when a product has `offer` from the API, show the crossed-out SP + the new `offer_price` + a small "SUMMER · 20% OFF" chip
- Shop category header: if the whole category is on offer, render the badge at the top of the section

**Test:** create "Diwali · 20% off · Duet" → the 7 duet cards show `₹1,199` (was ₹1,499) + a badge. Add to cart. `POST /orders` returns `subtotal: 1199`, not 1499. Toggle offer off → prices revert everywhere in <5 s.

---

## Phase 6 · Sales analytics dashboard

**Goal:** you understand what sold, when, for how much — from one screen.

**Backend (new router `routers/admin_analytics.py`):**
- Sales are already tracked — every `db.orders` doc with `status="paid"` is a sale. **No new tracking needed.**
- `GET /api/admin/sales/summary?from=&to=` — totals: orders count, revenue, AOV, units sold, top category, top product
- `GET /api/admin/sales/timeseries?from=&to=&bucket=day|week|month` — for line chart
- `GET /api/admin/sales/by_category?from=&to=` — for donut / bar
- `GET /api/admin/sales/by_product?from=&to=&limit=10` — for horizontal bar (top-N)
- Aggregations use MongoDB's `$group` — fast, one query each; no client-side maths
- Defaults: **all-time** if `from`/`to` not supplied. Presets translated on the frontend into concrete ISO dates before hitting the API

**Frontend (`admin/pages/Sales.jsx`):**
- `RangePicker` at top: All time · Last week · Last month · Last quarter · Custom
- Row of 4 **StatCards**: Revenue · Orders · AOV · Units
- **Line chart** (Recharts `LineChart`) — revenue over time, bucketed automatically to day/week/month based on range
- **Donut chart** — revenue by category (with legend + %)
- **Bar chart** — top 10 products by units (toggle: units ↔ revenue)
- **Table** below (grouped by category or product, toggle) with sortable columns

**Chart choice rationale:**
- *Line* for trend over time (revenue, orders)
- *Stacked bar* is an option if you want revenue-by-category over time; can add later
- *Donut* for revenue mix by category (clear at-a-glance share)
- *Horizontal bar* for top-N products (labels readable)

**Test:** simulate a paid order → dashboard total ticks up on refresh. Change range to "Last week" → excludes older orders.

---

## Phase 7 · Orders view in admin  *(bonus, small)*

**Goal:** you can see and manage every order without leaving the site.

**Backend:**
- `GET /api/admin/orders?status=&from=&to=` — list + filter
- `POST /api/admin/orders/{id}/status` — manual status override (edge cases)

**Frontend (`admin/pages/Orders.jsx`):**
- Table: date, customer, amount, status pill, Razorpay ID, Shiprocket shipment/AWB
- Row expands into a detail panel with the full order, ability to trigger tracking refresh

*This wasn't in the brief but Sales + Offers pull hard toward wanting it. Flagging as bonus — say the word and I'll include, otherwise it's a future phase.*

---

## Phase 8 · Website content CMS  *(home + about text/images)*

**Goal:** you edit hero copy, belief statement, founder bios, etc. without redeploy.

**Data model (new Mongo collection `content`):**
```
Page:
  slug: "home" | "about" | ...
  sections: [
    { key: "hero_slide_1", type: "image", value: "<url>" },
    { key: "belief_body",  type: "text",  value: "Luxury isn't loud..." },
    { key: "founder_alok_bio", type: "richtext", value: "..." },
    ...
  ]
  updated_at
```
Types supported by the editor: `text` (single line), `richtext` (multi-line + italic/bold), `image`, `list_of_text`.

**Backend (new router `routers/content.py`):**
- `GET  /api/content/pages/{slug}` — public, cached lightly (no auth)
- `GET  /api/admin/content/pages/{slug}` — same but auth'd (returns even draft/future pages if we add versioning later)
- `PUT  /api/admin/content/pages/{slug}` — replace sections
- On first read of a slug that doesn't exist, seed it from the current hardcoded strings and return that — this migrates existing content into the CMS transparently

**Frontend Retail:**
- `Home.jsx` and `About.jsx` read from `/api/content/pages/:slug` and render sections by key. Falls back to hardcoded default if the API is unreachable (never a blank page)
- **Shop is intentionally not templated** — the brief says so

**Frontend Admin (`admin/pages/Content.jsx`):**
- Page selector (Home / About / Contact intro / Footer copy) → section list → per-section editor matched to `type`
- Live preview iframe pointing to `/?draft=1` (renders draft content) — this is a soft nice-to-have; can ship without it in v1

---

## Phase 9 · Testing, hardening, deploy

- Full backend pytest for offers pricing edge-cases + admin auth
- Full `testing_agent` regression: retail flow + admin CRUD + offers + analytics numbers
- `/admin` route protection review — no admin data leaks in public endpoints
- Update `/app/memory/PRD.md` and `test_credentials.md`
- Confirm production `.env` has: `ADMIN_KEY`, `EMERGENT_LLM_KEY` (or Supabase keys), everything else already in place
- You deploy to production

---

## Cross-cutting reusable components  *(built once in Phase 1, used everywhere)*

| Component | Used in phases |
|---|---|
| `AdminShell` | 1–9 |
| `DataTable` | 3, 4, 5, 7, 8 |
| `FormField` | 3, 4, 5, 8 |
| `StringArrayEditor` | 4, 8 |
| `ImageDropzone` | 4, 8 |
| `StatCard` | 6 |
| `RangePicker` | 6, 7 |
| `Sheet`-based EditorPanel wrapper | 3, 4, 5, 7, 8 |
| `ConfirmDialog` | 3, 4, 5, 8 |

---

## Open questions (please answer before I begin)

1. **Storage:** Emergent-managed (recommended, ready) or Supabase (needs your keys + adds vendor lock-in)?
2. **Bonus Phase 7 (Admin Orders):** include from the start, or defer?
3. **Auth on `/admin`:** stick with the current single `ADMIN_KEY` gate, or upgrade to per-user login (email + password with roles)? *Single key is fine for now; multi-user makes sense when the team grows.*
4. **Offer stacking rule:** confirm "higher discount wins" when two active offers overlap a category. Alternatively: latest-created wins, or don't allow overlap at all.
5. **Sales data cut-off:** all `status="paid"` orders count as a sale. Include or exclude the current in-flight order (i.e., paid but not yet shipped)? *Default: include, since the money's in.*
6. **CMS scope:** happy to start with Home + About only? Or do you want Contact intro + Footer + Navbar links editable too from day one?

Once you answer these + approve §0 substitutions, I'll begin **Phase 1** and share screenshots before touching any real data.
