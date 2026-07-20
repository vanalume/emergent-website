# VANALUME — Composed Living

## Problem Statement
Premium, candle-first luxury fragrance & home-ambiance brand site. Editorial "Apple × Aesop × Jo Malone" feel, warm earthy quiet luxury. Pivoted from a view-only 5-page site to a **candle-first, buyable shop**.

## Brand
- Tagline: "Composed Living"
- Colours: Off-white #F8F6F2, Ivory #F5F1EA, Charcoal #2B2823, Forest Green #395439, Navy #1B3453, Warm Brown #5C3E2B, Ember Gold #D4A574, Sage #8A9A86
- Fonts: Didot (headings, fallback Bodoni Moda) + Avenir Next (body, fallback Jost)
- Logo: leaf-V wordmark (user asset)

## Architecture
- Stack: FastAPI + React (CRA/craco) + MongoDB
- Motion: framer-motion + Lenis smooth scroll; react-fast-marquee
- Cart: React Context + localStorage
- Payments: Razorpay (create order + verify signature). Keys currently empty → DB-order fallback (payment_configured=false).

### Backend (/app/backend)
- catalog.py — 23 products / 7 categories, server-side pricing (INR)
- server.py — GET /api/products, /api/config; POST /api/orders, /api/orders/verify, /api/inquiries, /api/newsletter; GET /api/inquiries, /api/orders

### Frontend (/app/frontend/src)
- Nav: Home · Shop · About Us · Contact (Founder Story + Vision/Mission live inside About Us)
- pages: Home.jsx, Shop.jsx, About.jsx, Contact.jsx
- components: Navbar, Footer, Layout, CartDrawer, ProductCard, Motion
- context: CartContext.jsx

## Pricing (INR)
Duet 1500 · Ensemble 1200 · Perfumer's Library 1800 · Pillar 600 · Taper gift set 1200 / single 450 · Wax bars 600 · Aroma stones = priced by weight (Enquire).

## Product photography
Duet jars = real brand photos placed by colour: Awaken→green, Bloom→red, Clarity→blue, Equilibrium→orange, Intimacy→purple. Oriental Café / Timeless + other categories use tasteful stock.

## Implemented (2025-12)
- Candle-first hero (real Awaken product, parallax + particles + glow, masked Didot reveal)
- Home: Belief manifesto, Duet showcase, Why Vanalume, fragrance marquee, CTA
- Shop: 7 category sections, sticky filter bar, product cards, add-to-cart, size/colour variants, aroma-stone Enquire
- Cart drawer + checkout (Razorpay when configured, else DB order)
- About: What is Vanalume, Mission, Vision, Five Senses interactive, Founder Story, founder cards, quote
- Contact: validated inquiry form + business enquiry chips + socials; footer newsletter
- Tested: backend 13/13 pytest, frontend all critical flows PASS (iteration_1.json)

## Backlog / Next
- P0: Add Razorpay Test keys to enable live checkout; confirm taper prices (placeholders 1200/450)
- P1: Aroma stone weight-based pricing UI; order confirmation email (Resend); product detail pages
- P2: Admin view for orders/inquiries; Oriental Café / Timeless real jar photos; SEO meta/OG per page
EOF
