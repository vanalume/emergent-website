# Vanalume Admin Dashboard — Implementation Report

> A conclusive summary of everything built across the admin-dashboard phases
> (Phases 1–8, skipping the deferred "Admin Orders" bonus phase). Covers the
> current schema and every admin flow.

---

## 1 · Overview

A branded admin portal (`/admin`) was built on top of the existing FastAPI +
MongoDB backend and the React (CRA/craco) + Tailwind + shadcn/ui frontend.

Capabilities delivered:

- **Auth** — single `ADMIN_KEY` gate on every admin route/endpoint.
- **Products** — full CRUD, image upload, variants, ritual, live/draft toggle.
- **Categories** — CRUD, sub-categories, ordering, safe delete.
- **Seasonal Offers** — multi-category percentage discounts with date windows.
- **Sales Analytics** — revenue/orders/AOV/units with line, stacked-bar, donut
  and top-N charts plus a breakdown table.
- **Website Content (CMS)** — edit Home / About / Contact / Footer / Navbar /
  Shop copy and imagery without redeploying.
- **Submissions** — read-only view of inquiries and newsletter signups.
- **Object storage** — image uploads to Supabase S3.

The storefront (public site) was updated in lockstep so every admin change
reflects live, and nothing breaks the retail/checkout flow.

---

## 2 · Current schema

### 2.1 MongoDB collections

| Collection | Holds | Primary key |
|---|---|---|
| `products` | catalogue items | `id` (slug) |
| `categories` | storefront sections + sub-categories | `id` (slug) |
| `offers` | seasonal discounts | `id` (uuid) |
| `orders` | order documents | `id` (uuid) |
| `inquiries` | contact-form submissions | `id` (uuid) |
| `newsletter` | email signups | `id` (uuid) |
| `files` | uploaded image metadata | `path` |
| `content` | CMS pages/sections | `slug` |

### 2.2 Pydantic models (`backend/models.py`)

**Variant**
```
label: str · sku? · mrp? · sp? · images: List[str] · desc?
```

**Ritual**
```
title: str · steps: List[str]
```

**Product**
```
id: str (slug) · category: str · subcategory?: str · collection: str · name: str
mrp: int · sp: int · images: List[str] · fragrances: List[str]
variants?: List[Variant] · desc? · long_desc? · ritual?: Ritual · draft: bool
(extra: includes[], image_crops removed)
```

**SubCategory** — `id · title · tagline?`

**Category**
```
id: str (slug) · title: str · tagline: str
subcategories?: List[SubCategory] · order?: int
```

**CategoryUpdate** — `title? · tagline? · subcategories?`

**Offer**
```
id: str (uuid) · name: str · category_ids: List[str]
discount_percent: int (0–90) · active: bool · starts_at? · ends_at? · created_at
```

**CartItem** — `product_id · quantity · variant?`

**OrderItem(CartItem)** — `+ name? · collection? · unit_price? · line_total?` (extra: `offer`)

**Customer** — `name · email · phone · address · city? · state? · pincode?`

**Order**
```
items: List[OrderItem] · customer: Customer · id (uuid) · status ("pending"|"paid"|"failed")
currency · subtotal · shipping · amount · created_at · razorpay_order_id?
delivery_provider? · shipment_id? · shipment? · shipment_created_at?
(extra: paid_at, razorpay_payment_id)
```

**VerifyPayment** — `order_id · razorpay_order_id · razorpay_payment_id · razorpay_signature`

**Section** — `key: str · type: str · value: Any`
Types: `text` | `richtext` | `image` | `list_of_text` | `list` | `toggle`

**Page** — `slug: str · sections: List[Section] · updated_at`

**Inquiry / InquiryCreate / NewsletterCreate** — contact + newsletter models.

---

## 3 · Auth & shell

- **Backend:** shared FastAPI dependency `require_admin` (`backend/dependencies.py`)
  reads the `X-Admin-Key` header and compares against `ADMIN_KEY` (401 on mismatch).
  Applied to every `/api/admin/*` route.
- **Frontend:** `AdminAuth` context persists the key in `localStorage`, `AdminGuard`
  gates the whole `/admin` subtree, `AdminLogin` is the entry form.
- **Shell:** `AdminShell` sidebar with **Overview · Products · Categories · Offers ·
  Sales · Website content · Submissions** (+ a dev-only Kitchen Sink).

---

## 4 · Admin flows

### 4.1 Products (`/admin/products`)
- **List** — `DataTable` with thumbnail, name, category, MRP, SP, status badge
  (Live/Draft), text search, and **category + sub-category filter dropdowns**.
- **Create / Edit** — `ProductEditor` side panel with tabs:
  - *Details* — name, auto slug, collection, category → sub-category select,
    MRP/SP, card + long description, "Live" toggle (off = draft, hidden from
    store), fragrances, "What's inside", multi-image dropzone.
  - *Variants* — `VariantEditor` rows (label, sku, MRP, SP, desc, multi-image).
  - *Ritual* — title + steps.
- **Duplicate** — clones a product with a new unique slug.
- **Delete** — removes (orders keep their snapshot, so history is unaffected).
- Draft products are excluded from the public `GET /api/products` and rejected at
  checkout (`400 … is not available.`).

### 4.2 Categories (`/admin/categories`)
- **List** — title, tagline, product count, sub-category count.
- **Create / Edit** — `EditorPanel` with title, auto-generated slug (uniqueness
  suffix, immutable after create), tagline, and a `SubCategoryEditor`.
- **Reorder** — up/down arrows persist a new `order` (Shop renders in that order).
- **Delete** — blocked with 409 if any product still uses it; otherwise it also
  **pulls the category out of every offer's `category_ids`** before deleting.

### 4.3 Seasonal Offers (`/admin/offers`)
- **List** — name, target categories, discount %, window, inline active toggle.
- **Create / Edit** — name, **multi-select category pills**, discount % (0–90),
  active toggle, start/end dates (both **inclusive of their whole day**).
- **Delete**.
- Public `GET /api/offers/active` returns currently-active offers; the pricing
  engine (`apply_discount`, highest-discount-wins) drives the storefront price
  and the server-side checkout total (client prices are never trusted).

### 4.4 Sales analytics (`/admin/sales`)
- `RangePicker` (All time / Last week / Last month / Last quarter / Custom),
  auto-bucketed to day/week/month.
- Four `StatCard`s — **Revenue** (incl. shipping), **Orders**, **AOV**, **Units**.
- **Line chart** (revenue over time).
- **Stacked bar** (revenue by category over time).
- **Donut** (revenue by category).
- **Top-N horizontal bar** with a **Top 5/10/20/50** dropdown and
  **units ↔ revenue** toggle.
- **Breakdown table** toggling category ↔ product.
- Category is resolved by joining `OrderItem.product_id → Product.category`
  (no denormalisation); `from`/`to` are inclusive end-of-day.

### 4.5 Website content (`/admin/content`)
- Page selector: **Home · About · Contact · Footer · Navbar · Shop**.
- Each section renders the editor matching its `type`:
  `text` (input) · `richtext` (textarea) · `image` (dropzone) ·
  `list_of_text` (StringArrayEditor) · `list` (ListEditor with per-key schema) ·
  `toggle`.
- **Save** → `PUT /api/admin/content/pages/{slug}`.
- The storefront reads content via `useContent(slug)` and falls back to
  hardcoded defaults when the API is down (never a blank page).

### 4.6 Submissions (`/admin/submissions`)
- Read-only tabs for **Inquiries** and **Newsletter** signups.

### 4.7 Object storage
- `POST /api/admin/upload` (admin-only) stores images in **Supabase S3**
  (`storage.py`, boto3) and records a `db.files` row; returns `{path, url}`.
- Used by `ImageDropzone` across the product editor and content editor.

---

## 5 · Endpoint reference

**Admin (`/api/admin/*`, all `require_admin`)**

| Method | Path | Purpose |
|---|---|---|
| POST | `/admin/verify` | auth handshake (key in body) |
| GET | `/admin/data` | inquiries + newsletter dump |
| POST | `/admin/upload` | image upload → `{path, url}` |
| GET/POST | `/admin/categories` | list / create |
| PUT | `/admin/categories/reorder` | persist ordering |
| PUT/DELETE | `/admin/categories/{id}` | update / delete |
| GET/POST | `/admin/products` | list / create |
| PUT/DELETE | `/admin/products/{id}` | update / delete |
| GET/POST | `/admin/offers` | list / create |
| PUT/DELETE | `/admin/offers/{id}` | update / delete |
| GET | `/admin/sales/summary` | KPIs + top category/product |
| GET | `/admin/sales/timeseries` | revenue over time |
| GET | `/admin/sales/timeseries/categories` | revenue by category over time |
| GET | `/admin/sales/by_category` | donut data |
| GET | `/admin/sales/by_product` | top-N (limit + sort) |
| GET/PUT | `/admin/content/pages` / `/{slug}` | read / replace page sections |

**Public (`/api/*`)**

| Method | Path | Purpose |
|---|---|---|
| GET | `/products` | catalogue + categories (drafts excluded, offer applied) |
| GET | `/offers/active` | active offers |
| GET | `/content/pages/{slug}` | CMS page (seeds on first read) |
| POST | `/orders` | create order |
| POST | `/orders/verify` | verify payment + create shipment |
| GET | `/orders` | list orders |
| POST | `/inquiries` | submit contact form |
| POST | `/newsletter` | subscribe |
| GET | `/config` | payment config status |

---

## 6 · Seeding & storage

- **Catalogue** (`catalog.py::seed_catalog`) — seeds products/categories **only
  when empty** (admin CRUD is authoritative afterwards), and **uploads every
  product/variant image to Supabase S3** on first seed, rewriting URLs.
- **Content** (`routers/content.py::seed_content`) — seeds missing pages from
  `content_defaults.json`; also run manually via the standalone
  **`seed_content.py`** (seed / `--force` / `--export`), which reads `.env` from
  the CWD.
- **Storage** (`storage.py`) — Supabase S3-compatible client (boto3), keys:
  `SUPABASE_KEY_ID`, `SUPABASE_SECRET_ACCESS_KEY`, `SUPABASE_ENDPOINT_URL`,
  `SUPABASE_BUCKET_NAME`, `SUPABASE_REGION`.

---

## 7 · Supporting documents

- `geolocation-plan.md` — IP-based order geolocation plan + bot-traffic risks.
- `cms-wysiwyg-migration.md` — how to later swap plain-text `richtext` for a
  Quill.js WYSIWYG editor.

---

## 8 · Notable schema migrations made during the build

- `enquire` → `draft` (live/draft toggle; drafts hidden from storefront).
- `variants`/`sizes` merged into a single `variants` (with `desc`).
- `Variant.image` / `Size.image` → `images: List[str]` (multi-image).
- `image_crops` removed (pair-photo cropping dropped).
- Product `subcategory` added; categories gained `subcategories` + `order`.
- Offer `category_id` → `category_ids` (multi-category).
- Analytics: configurable top-N + stacked bar + `timeseries/categories`.
- CMS: `beginning` section moved from `list_of_text` → `list`; Shop
  "Partnerships & Gifting" section made editable.
