# Vanalume — SEO Optimization Plan

> Scoped 2026-09-08 · Covers existing SEO artifacts and a phased plan to bring the
> site up to modern SEO standards. Nothing here is implemented yet — review and
> approve before execution.

---

## 1 · Current state (what exists today)

| Artifact | Status |
|---|---|
| `<title>` | Static `"Vanalume — Composed Living"` for every route |
| `<meta name="description">` | **Placeholder** — `"A product of emergent.sh"` |
| `<meta name="viewport">` / charset | Present |
| `<html lang="en">` | Present |
| `<meta name="theme-color">` | `#000000` (wrong — should be brand `#f8f6f2`) |
| Favicon / `manifest.json` | **None** (only `public/vanalume-logo.png` exists) |
| `robots.txt` / `sitemap.xml` | **None** |
| Canonical / Open Graph / Twitter | **None** |
| Structured data (JSON-LD) | **None** |
| Per-route head management | **None** (no `react-helmet`, no `document.title`) |
| Image `alt` text | Good (product cards, founders, etc.) |
| Semantic HTML | Reasonable (one `h1`/page, `h2`/`h3` sections) |
| Font loading | `preconnect` + `display=swap` present (but `preconnect` is duplicated) |

**Architectural fact:** client-side SPA; products / blogs / categories live in
MongoDB (served via `/api`). Therefore `sitemap.xml` and structured data must be
**generated from the DB**, not shipped as static files in `public/`.

---

## 2 · Phased plan

### P0 — Fundamentals (small, high impact)

**2.1 · Fix `frontend/public/index.html`**
- Replace `<meta name="description">` with a real brand description
  (e.g. "Luxury scented candles, aroma stones and oils for composed living.").
- `theme-color` → `#f8f6f2`.
- Remove the duplicate `preconnect` (lines 8 and 10–12 are redundant).
- Add default Open Graph / Twitter meta (brand-level):
  `og:title`, `og:description`, `og:image` (logo), `og:type=website`,
  `twitter:card=summary_large_image`.

**2.2 · Favicon, manifest, apple-touch-icon**
- Generate `favicon.ico` / `favicon-32.png` / `apple-touch-icon.png` from
  `public/vanalume-logo.png`.
- Add `<link rel="icon">` + `<link rel="apple-touch-icon">` + `<link rel="manifest">`.
- Add `public/manifest.json` (name, short_name, `theme_color`/`background_color` in
  brand palette, icon paths, `display: standalone`).

**2.3 · Per-route titles & meta — a lightweight head hook**
- Add a small `useMeta({ title, description, canonical, og })` hook (no new dep —
  or `react-helmet-async` if preferred) that writes `document.title`, meta tags,
  and a `<link rel="canonical">` on mount/update.
- Apply to every route:
  - Home — brand title + description.
  - Shop — "Shop | Vanalume".
  - ProductDetail — `{product.name} | Vanalume` (dynamic).
  - About, Contact, Blogs (list), BlogDetail (`{blog.title} | Vanalume`, dynamic).

---

### P1 — Structured data + discoverability (the e-commerce win)

**2.4 · JSON-LD structured data**
Inject `<script type="application/ld+json">` per route (via `useMeta`):
- **ProductDetail** — `Product` + `Offer` (name, image, price / offer price, `priceCurrency: INR`, `availability` from stock → `InStock` / `OutOfStock`).
- **ProductDetail** — `BreadcrumbList` (Home → Shop → Category → Product).
- **Home** — `Organization` (brand) + `WebSite`.
- **BlogDetail** — `BlogPosting` (headline, image, datePublished, author).

**2.5 · `robots.txt`**
- Serve from backend (`GET /robots.txt`) or static `public/robots.txt`:
  allow all, reference the sitemap URL.

**2.6 · Dynamic `sitemap.xml` (backend)**
- New `GET /sitemap.xml` (in a router, e.g. `routers/seo.py`):
  - Static routes: `/`, `/shop`, `/about`, `/contact`, `/blogs`.
  - Products: `db.products` where `draft != true` and effective stock > 0 →
    `/product/{id}` with `lastmod` (none stored — use now or a static date).
  - Blogs: `db.blogs` where `published == true` → `/blog/{id}`.
  - Absolute URLs built from `VANALUME_URL`.
  - Return `application/xml`.

---

### P2 — Social, performance, and (optional) prerender

**2.7 · Open Graph / Twitter per-route** — via `useMeta` overrides (product image,
blog image) so shared links render rich cards.

**2.8 · Core Web Vitals / performance**
- Serve next-gen images (WebP/AVIF) from S3 where available.
- `nginx.conf`: long-lived `Cache-Control` for hashed static assets
  (`/static/*`), `no-cache` for `index.html`.
- (Optional) remove the Google Fonts render-block by self-hosting or `media=print`
  async pattern — evaluate against CWV.

**2.9 · Optional SSR / prerender (larger lift, decide later)**
- Client-side meta + dynamic sitemap + JSON-LD is the pragmatic 80/20.
- True prerender/SSR (e.g. prerendering with `react-snap`, or migrating to a
  framework with SSR) is the ceiling — worth revisiting only if search/social
  crawlers need it.

---

## 3 · Files to touch

| Area | File(s) |
|---|---|
| HTML head | `frontend/public/index.html` |
| Favicon/manifest | `frontend/public/` (new assets + `manifest.json`) |
| Head hook | `frontend/src/hooks/useMeta.js` (new) |
| Route wiring | `App.js` + each page (`Home`, `Shop`, `ProductDetail`, `About`, `Contact`, `Blogs`, `BlogDetail`) |
| Structured data | `frontend/src/lib/seo.js` (new JSON-LD builders) or inline in `useMeta` |
| Sitemap/robots | `backend/routers/seo.py` (new), registered in `server.py` |
| Cache headers | `dev-container/nginx.conf` |

---

## 4 · Verification

- **Meta per route** — `curl` the built app + inspect `document.title` / meta tags
  on each route; confirm product/blog pages get dynamic titles.
- **Sitemap** — `GET /sitemap.xml` returns valid XML listing live products and
  published blogs; validate at `https://www.xml-sitemaps.com` or Google Search Console.
- **robots.txt** — returns 200 and references the sitemap.
- **Structured data** — validate with Google Rich Results Test
  (`https://search.google.com/test/rich-results`) for Product/Offer/Breadcrumb/BlogPosting.
- **index.html** — no `emergent.sh` remnant, brand theme-color, favicon resolves.
- **Regression** — `bun run build` clean; existing backend tests still pass.

---

## 5 · Open questions (confirm before P1)

1. Canonical domain — confirm `https://vanalume.com` (from `VANALUME_URL`) as the
   canonical base for sitemap/canonical/OG URLs.
2. `lastmod` for products/blogs — acceptable to use a single "last seeded/updated"
   date, or should we track per-item `updated_at` (products/blogs don't store one today)?
3. Head hook approach — dependency-free `useMeta` hook (recommended) vs
   `react-helmet-async`?
