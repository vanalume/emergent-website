# VANALUME — Composed Living

## Problem Statement
Premium, candle-first luxury fragrance & home-ambiance brand site. Editorial "Apple × Aesop × Jo Malone" feel, warm earthy quiet luxury. Now a **buyable retail store** built on top of the existing B2B experience, with the B2B inquiry flow preserved.

## Brand
- Tagline: "Composed Living"
- Colours: Off-white #F8F6F2, Ivory #F5F1EA, Charcoal #2B2823, Forest Green #395439, Navy #1B3453, Warm Brown #5C3E2B, Ember Gold #D4A574 / #E6B980, Sage #8A9A86
- Fonts: Didot (headings, fallback Bodoni Moda) + Avenir Next / Jost (body) + Fraunces italic (editorial statements)
- Logo: leaf-V wordmark (user asset)

## Architecture
- Stack: FastAPI + React (CRA/craco) + MongoDB
- Motion: framer-motion + Lenis smooth scroll; react-fast-marquee
- Cart: React Context + localStorage key `vanalume_cart_v2`
- Payments: Razorpay create-order + signature verify; **dormant** until keys are supplied (`payment_configured=false`). Order still persists to Mongo as `pending`.
- Email: Emergent-managed Resend for inquiry / newsletter notifications to support@vanalume.com

### Backend (/app/backend)
- `catalog.py` — 22 SKUs / 7 categories; MRP + SP pricing (INR); variants with per-variant image override; `resolve_line_price`; `compute_shipping` (₹100 flat, free ≥ ₹2000)
- `server.py`
  - `GET /api/products`, `GET /api/config`
  - `POST /api/orders` (server-side price computation, shipping, optional Razorpay order)
  - `POST /api/orders/verify` (Razorpay signature)
  - `GET /api/orders`
  - `POST /api/inquiries`, `GET /api/inquiries`
  - `POST /api/newsletter`
  - `POST /api/admin/verify`, `GET /api/admin/data` (X-Admin-Key header)

### Frontend (/app/frontend/src)
- Nav: Home · Shop · About · Contact
- pages: Home.jsx, Shop.jsx, About.jsx, Contact.jsx, Admin.jsx
- components: Navbar (cart icon + count badge), Footer, Layout (renders CartDrawer), CartDrawer, ProductCard (MRP/SP, variants, image carousel), Motion
- context: CartContext.jsx (add/remove/setQty/clear, subtotal/shipping/total, drawer open)

## Retail Pricing (MRP → SP, INR)
- Duet gift box (7 sets): 1899 → 1499
- Duet Individual (14 fragrance variants): 999 → 599
- Ensemble Tin (Celebrate / Presence): 1299 → 999
- Ensemble Metallic Jar 220cc: 2599 → 1999
- Perfumer's Library (Odyssey): 2299 → 1799
- Pillar 4-inch: 799 → 599 · 5-inch: 899 → 699 · 6-inch: 999 → 799 · Pack of 3: 2299 → 1699
- Taper Set of 3: 999 → 799
- Wax Bars Set of 2: 799 → 599
- Aroma Stones Jar (+15cc oil): 1799 → 1299 · Aroma Sculpture with Dish: 5999 → 4999 · Aroma Oil 30cc Set of 5: 1299 → 999
- Shipping: ₹100 flat within India, free at/above ₹2000 subtotal

## Product photography
Duet jars = real brand photos; Ensemble Celebrate/Presence, Odyssey, Pillar colours, Beaded taper, Aroma stones jar / rock, Wax bars, Oils set — all real supplied assets. Second product images pending from user for the 2-image carousel (carousel is already wired to accept them).

## Implemented
- **2025-12**: Home hero, Belief manifesto, About (Founder Story + Five Senses modal), Contact form + newsletter, backend inquiries/newsletter with Resend, admin dashboard
- **2026-07 (retail phase)**:
  - Retail catalog (22 SKUs / 7 categories) with MRP/SP, variants, shipping rules
  - Cart context + persistent localStorage; live count badge in Navbar (desktop + mobile)
  - Cart Drawer: quantity controls, remove, subtotal/shipping/total, checkout form (name/email/phone/address/city/pincode) with per-field validation, order confirmation "Thank you" view
  - `POST /api/orders` with server-side pricing, shipping tiers, unknown-product rejection, dormant Razorpay path
  - Full regression: 20/20 backend pytest + all frontend flows passed (iteration_6.json)

## Backlog / Next
- **P0**: Second product images from user → wire 2-image carousel with real content; Razorpay keys once user opens an account
- **P1**: Shiprocket integration (needs playbook + credentials); order confirmation email to customer; Admin Orders view
- **P2**: Product detail pages (currently card-only); inventory / stock tracking; SEO meta/OG per page; production email delivery reconfirmation
