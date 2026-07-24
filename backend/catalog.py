"""Vanalume product catalogue — single source of truth for the shop & pricing (INR)."""

DUET = "https://customer-assets-gfyr7b9c.emergentagent.net/job_vanalume-preview/artifacts"
STOCK_CANDLE = "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
STOCK_STONES = "https://images.pexels.com/photos/7814959/pexels-photo-7814959.jpeg?auto=compress&cs=tinysrgb&w=1200"
STOCK_OILS = "https://images.pexels.com/photos/7795817/pexels-photo-7795817.jpeg?auto=compress&cs=tinysrgb&w=1200"
STOCK_RITUALS = "https://images.pexels.com/photos/3965508/pexels-photo-3965508.jpeg?auto=compress&cs=tinysrgb&w=1200"
STOCK_FEATURE = "https://images.pexels.com/photos/30123011/pexels-photo-30123011.jpeg?auto=compress&cs=tinysrgb&w=1200"

PRODUCTS = [
    # ---------------- DUET (7 sets · ₹1500) ----------------
    {"id": "duet-awaken", "category": "duet", "collection": "Awaken", "name": "Awaken",
     "fragrances": ["Lemongrass", "Cedarwood"], "jar": "Green", "price": 1500,
     "image": f"{DUET}/l6poykvu_awaken%20green%20ai.png",
     "desc": "A crisp, grounding pair — bright lemongrass met with warm cedarwood."},
    {"id": "duet-bloom", "category": "duet", "collection": "Bloom", "name": "Bloom",
     "fragrances": ["Rose", "Jasmine"], "jar": "Red", "price": 1500,
     "image": f"{DUET}/nmlr0dbl_bloom%20red%20ai.png",
     "desc": "Soft florals in restraint — rose and jasmine, balanced and never sweet."},
    {"id": "duet-clarity", "category": "duet", "collection": "Clarity", "name": "Clarity",
     "fragrances": ["White Sage", "Aqua"], "jar": "Blue", "price": 1500,
     "image": f"{DUET}/hmke92zk_clarity%20blue%20ai.png",
     "desc": "A clean, meditative duet — cleansing white sage and cool aqua."},
    {"id": "duet-equilibrium", "category": "duet", "collection": "Equilibrium", "name": "Equilibrium",
     "fragrances": ["Tea Tree", "Sandalwood"], "jar": "Orange", "price": 1500,
     "image": f"{DUET}/v2hkyxvu_equilibrium%20orange%20ai.png",
     "desc": "Balance in a duet — herbal tea tree alongside creamy sandalwood."},
    {"id": "duet-intimacy", "category": "duet", "collection": "Intimacy", "name": "Intimacy",
     "fragrances": ["Lavender", "Mogra"], "jar": "Purple", "price": 1500,
     "image": f"{DUET}/94fayxk6_intimacy%20purple%20ai.png",
     "desc": "For slower evenings — calming lavender and heady mogra."},
    {"id": "duet-oriental-cafe", "category": "duet", "collection": "Oriental Café", "name": "Oriental Café",
     "fragrances": ["Turkish Coffee", "Vanilla"], "jar": "Black & White", "price": 1500,
     "image": STOCK_CANDLE,
     "desc": "A warm, gourmand pairing — Turkish coffee and soft vanilla."},
    {"id": "duet-timeless", "category": "duet", "collection": "Timeless", "name": "Timeless",
     "fragrances": ["Black Oudh", "White Oudh"], "jar": "Black & White", "price": 1500,
     "image": STOCK_FEATURE,
     "desc": "Two facets of oudh — deep black and luminous white."},

    # ---------------- ENSEMBLE (2 sets · ₹1200) ----------------
    {"id": "ensemble-celebrate", "category": "ensemble", "collection": "Celebrate", "name": "Celebrate",
     "fragrances": ["Apple Cinnamon", "Vanilla", "Turkish Coffee"], "jar": "Black & Gold Tin", "price": 1200,
     "image": STOCK_FEATURE,
     "desc": "Three warm, celebratory scents — apple cinnamon, vanilla and Turkish coffee."},
    {"id": "ensemble-presence", "category": "ensemble", "collection": "Presence", "name": "Presence",
     "fragrances": ["White Oudh", "Black Oudh", "Musk"], "jar": "Black & Gold Tin", "price": 1200,
     "image": STOCK_CANDLE,
     "desc": "A composed trio of oudh and musk — quiet, resonant, present."},

    # ---------------- PERFUMER'S LIBRARY (1 set · ₹1800) ----------------
    {"id": "library-odyssey", "category": "library", "collection": "Odyssey", "name": "Odyssey",
     "fragrances": ["Neroli", "Black Oudh", "Tuberose", "Sandalwood", "Musk", "Cedarwood"],
     "jar": "Shot Glasses", "price": 1800, "image": STOCK_CANDLE,
     "desc": "The complete discovery experience — six fragrances."},

    # ---------------- PILLAR (Sea & Sand, rustic · ₹600) ----------------
    {"id": "pillar-midnight-blue", "category": "pillar", "collection": "Sea & Sand", "name": "Midnight Blue",
     "fragrances": ["Oudh"], "jar": "Midnight Blue", "price": 600, "sizes": ["4 inch", "5 inch", "6 inch"],
     "image": STOCK_RITUALS, "desc": "A rustic-finish pillar in deep midnight blue."},
    {"id": "pillar-deep-green", "category": "pillar", "collection": "Sea & Sand", "name": "Deep Green",
     "fragrances": ["Spearmint"], "jar": "Deep Green", "price": 600, "sizes": ["4 inch", "5 inch", "6 inch"],
     "image": STOCK_RITUALS, "desc": "A rustic-finish pillar in forest green."},
    {"id": "pillar-terracotta", "category": "pillar", "collection": "Sea & Sand", "name": "Terracotta",
     "fragrances": ["Patchouli"], "jar": "Terracotta", "price": 600, "sizes": ["4 inch", "5 inch", "6 inch"],
     "image": STOCK_FEATURE, "desc": "A rustic-finish pillar in warm terracotta."},
    {"id": "pillar-sea-sand", "category": "pillar", "collection": "Sea & Sand", "name": "Sea & Sand",
     "fragrances": ["Aqua"], "jar": "Sea & Sand", "price": 600, "sizes": ["4 inch", "5 inch", "6 inch"],
     "image": STOCK_RITUALS, "desc": "A rustic-finish pillar in soft sand tones."},

    # ---------------- TAPER (₹1200 sets / ₹450 singles) ----------------
    {"id": "taper-plain-trio", "category": "taper", "collection": "Taper", "name": "Plain Taper Trio",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "jar": "Burgundy / Deep Blue / Olive", "price": 1200,
     "image": STOCK_RITUALS, "desc": "Three elongated 35cm tapers — Mulberry, Oudh and Basil."},
    {"id": "taper-assorted-box", "category": "taper", "collection": "Taper", "name": "Assorted Set",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "jar": "Assorted", "price": 1200,
     "image": STOCK_FEATURE, "desc": "An assorted trio of 25cm tapers, by colour or fragrance."},
    {"id": "taper-beaded", "category": "taper", "collection": "Taper", "name": "Beaded Taper",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "jar": "Burgundy / Deep Blue / Olive", "price": 450,
     "sizes": ["Burgundy · Mulberry", "Deep Blue · Oudh", "Olive · Basil"],
     "image": STOCK_RITUALS, "desc": "A single beaded 25cm taper. Choose your colour & fragrance."},
    {"id": "taper-pyramid", "category": "taper", "collection": "Taper", "name": "Pyramid Taper",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "jar": "Burgundy / Deep Blue / Olive", "price": 450,
     "sizes": ["Burgundy · Mulberry", "Deep Blue · Oudh", "Olive · Basil"],
     "image": STOCK_FEATURE, "desc": "A single stacked-pyramid 25cm taper. Choose your colour & fragrance."},
    {"id": "taper-grooved", "category": "taper", "collection": "Taper", "name": "Grooved Taper",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "jar": "Burgundy / Deep Blue / Olive", "price": 450,
     "sizes": ["Burgundy · Mulberry", "Deep Blue · Oudh", "Olive · Basil"],
     "image": STOCK_RITUALS, "desc": "A single fluted, grooved 25cm taper. Choose your colour & fragrance."},

    # ---------------- WAX BARS (₹600) ----------------
    {"id": "wax-clove-cinnamon", "category": "wax", "collection": "Wax Bars", "name": "Clove × Cinnamon",
     "fragrances": ["Clove", "Cinnamon"], "jar": "Bar", "price": 600, "image": STOCK_OILS,
     "desc": "Handcrafted wax melt bar — warm, spiced, enveloping."},
    {"id": "wax-rose-jasmine", "category": "wax", "collection": "Wax Bars", "name": "Rose × Jasmine",
     "fragrances": ["Rose", "Jasmine"], "jar": "Bar", "price": 600, "image": STOCK_OILS,
     "desc": "Handcrafted wax melt bar — soft florals, composed and clean."},

    # ---------------- AROMA STONES (priced by weight · enquire) ----------------
    {"id": "stone-ceramic-pot", "category": "stone", "collection": "Aroma Stones", "name": "Black Ceramic Pot",
     "fragrances": [], "jar": "200–220cc", "price": None, "enquire": True, "image": STOCK_STONES,
     "desc": "A black ceramic pot filled with small diffusing lava stones."},
    {"id": "stone-abstract", "category": "stone", "collection": "Aroma Stones", "name": "Abstract Aroma Stone",
     "fragrances": [], "jar": "4–6cm, with ceramic dish", "price": None, "enquire": True, "image": STOCK_STONES,
     "desc": "A medium abstract sculptural stone mounted in a ceramic dish."},
]

CATEGORIES = [
    {"id": "duet", "title": "Duet Collection", "tagline": "Two fragrances, one ritual."},
    {"id": "ensemble", "title": "Ensemble Collection", "tagline": "Three curated fragrances."},
    {"id": "library", "title": "Perfumer's Library", "tagline": "Six fragrances. The complete discovery experience."},
    {"id": "pillar", "title": "Pillar Candles", "tagline": "Rustic-finish pillars in three heights."},
    {"id": "taper", "title": "Taper Candles", "tagline": "Sculptural tapers, singly or as a trio."},
    {"id": "wax", "title": "Wax Bars", "tagline": "Handcrafted wax melts for modern rituals."},
    {"id": "stone", "title": "Aroma Stones", "tagline": "Fragrance as a timeless decorative object."},
]

PRICE_BY_ID = {p["id"]: p["price"] for p in PRODUCTS}
PRODUCT_BY_ID = {p["id"]: p for p in PRODUCTS}
