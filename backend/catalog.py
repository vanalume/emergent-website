"""Vanalume product catalogue, single source of truth for the shop & pricing (INR)."""

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
     "image": f"{DUET}/j3hz7tne_AWAKEN%20copy.png",
     "desc": "A crisp, grounding pair, bright lemongrass met with warm cedarwood."},
    {"id": "duet-bloom", "category": "duet", "collection": "Bloom", "name": "Bloom",
     "fragrances": ["Rose", "Jasmine"], "jar": "Red", "price": 1500,
     "image": f"{DUET}/l9rrpbom_BLOOM%20copy.png",
     "desc": "Soft florals in restraint, rose and jasmine, balanced and never sweet."},
    {"id": "duet-clarity", "category": "duet", "collection": "Clarity", "name": "Clarity",
     "fragrances": ["White Sage", "Aqua"], "jar": "Blue", "price": 1500,
     "image": f"{DUET}/1qz79thf_CLARITY%20copy.png",
     "desc": "A clean, meditative duet, cleansing white sage and cool aqua."},
    {"id": "duet-equilibrium", "category": "duet", "collection": "Equilibrium", "name": "Equilibrium",
     "fragrances": ["Tea Tree", "Sandalwood"], "jar": "Orange", "price": 1500,
     "image": f"{DUET}/i8wo86bm_EQUILIBRIUM%20copy.png",
     "desc": "Balance in a duet, herbal tea tree alongside creamy sandalwood."},
    {"id": "duet-intimacy", "category": "duet", "collection": "Intimacy", "name": "Intimacy",
     "fragrances": ["Lavender", "Mogra"], "jar": "Purple", "price": 1500,
     "image": f"{DUET}/u8xpxby0_INTIMACY.png",
     "desc": "For slower evenings, calming lavender and heady mogra."},
    {"id": "duet-oriental-cafe", "category": "duet", "collection": "Oriental Café", "name": "Oriental Café",
     "fragrances": ["Turkish Coffee", "Vanilla"], "jar": "Black & White", "price": 1500,
     "image": f"{DUET}/apwsai2q_ORIENTAL%20CAFE.png",
     "desc": "A warm, gourmand pairing, Turkish coffee and soft vanilla."},
    {"id": "duet-timeless", "category": "duet", "collection": "Timeless", "name": "Timeless",
     "fragrances": ["Black Oudh", "White Oudh"], "jar": "Black & White", "price": 1500,
     "image": f"{DUET}/ini4y51o_TIMELESS.png",
     "desc": "Two facets of oudh, deep black and luminous white."},

    # ---------------- ENSEMBLE (2 sets · ₹1200) ----------------
    {"id": "ensemble-celebrate", "category": "ensemble", "collection": "Celebrate", "name": "Celebrate",
     "fragrances": ["Apple Cinnamon", "Vanilla", "Turkish Coffee"], "jar": "Black & Gold Tin", "price": 1200,
     "image": f"{DUET}/afp78v3j_celebrate.png",
     "desc": "Three warm, celebratory scents, apple cinnamon, vanilla and Turkish coffee."},
    {"id": "ensemble-presence", "category": "ensemble", "collection": "Presence", "name": "Presence",
     "fragrances": ["White Oudh", "Black Oudh", "Musk"], "jar": "Black & Gold Tin", "price": 1200,
     "image": f"{DUET}/r2kqvo00_presence.png",
     "desc": "A composed trio of oudh and musk, quiet, resonant, present."},

    # ---------------- PERFUMER'S LIBRARY (1 set · ₹1800) ----------------
    {"id": "library-odyssey", "category": "library", "collection": "Odyssey", "name": "Odyssey",
     "fragrances": ["Neroli", "Black Oudh", "Tuberose", "Sandalwood", "Musk", "Cedarwood"],
     "jar": "Shot Glasses", "price": 1800, "image": f"{DUET}/egsxf81t_library.png",
     "desc": "The complete discovery experience, six fragrances."},

    # ---------------- PILLAR (Sea & Sand, rustic · ₹600) ----------------
    {"id": "pillar-midnight-blue", "category": "pillar", "collection": "Sea & Sand", "name": "Midnight Blue",
     "fragrances": ["Oudh"], "jar": "Midnight Blue", "price": 600, "sizes": ["4 inch", "5 inch", "6 inch"],
     "image": f"{DUET}/63b55l4v_midnight%20blue.png", "desc": "A rustic-finish pillar in deep midnight blue."},
    {"id": "pillar-deep-green", "category": "pillar", "collection": "Sea & Sand", "name": "Deep Green",
     "fragrances": ["Spearmint"], "jar": "Deep Green", "price": 600, "sizes": ["4 inch", "5 inch", "6 inch"],
     "image": f"{DUET}/81smp3e8_deep%20green.png", "desc": "A rustic-finish pillar in forest green."},
    {"id": "pillar-terracotta", "category": "pillar", "collection": "Sea & Sand", "name": "Terracotta",
     "fragrances": ["Patchouli"], "jar": "Terracotta", "price": 600, "sizes": ["4 inch", "5 inch", "6 inch"],
     "image": f"{DUET}/inlxtdzm_terracota.png", "desc": "A rustic-finish pillar in warm terracotta."},
    {"id": "pillar-sea-sand", "category": "pillar", "collection": "Sea & Sand", "name": "Sea & Sand",
     "fragrances": ["Aqua"], "jar": "Sea & Sand", "price": 600, "sizes": ["4 inch", "5 inch", "6 inch"],
     "image": f"{DUET}/c3u0h8bw_sea%20sand.png", "desc": "A rustic-finish pillar in soft sand tones."},

    # ---------------- TAPER (₹1200 sets / ₹450 singles) ----------------
    {"id": "taper-dual-colour", "category": "taper", "collection": "Taper", "name": "Dual Colour",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "jar": "Burgundy / Olive / Blue", "price": 1200,
     "sizes": ["Burgundy · Mulberry", "Olive · Basil", "Blue · Oudh"],
     "image": f"{DUET}/je8oxa7r_ChatGPT%20Image%20Jul%2028%2C%202026%20at%2002_57_59%20PM.png",
     "desc": "Smooth two-tone dip tapers, ivory into colour. 35cm."},
    {"id": "taper-grooved", "category": "taper", "collection": "Taper", "name": "Grooved",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "jar": "Yellow / Burgundy / Blue", "price": 1200,
     "sizes": ["Yellow · Basil", "Burgundy · Mulberry", "Blue · Oudh"],
     "image": f"{DUET}/gnedlfhf_ChatGPT%20Image%20Jul%2028%2C%202026%20at%2002_56_35%20PM.png",
     "desc": "Fluted, vertically grooved tapers. 25cm."},
    {"id": "taper-beaded", "category": "taper", "collection": "Taper", "name": "Beaded",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "jar": "Burgundy / Yellow / Blue", "price": 1200,
     "sizes": ["Burgundy · Mulberry", "Yellow · Basil", "Blue · Oudh"],
     "image": f"{DUET}/3hbkxewn_ChatGPT%20Image%20Jul%2028%2C%202026%20at%2003_01_24%20PM.png",
     "desc": "Stacked-bead tapers with a tactile, sculptural profile. 25cm."},
    {"id": "taper-pyramid", "category": "taper", "collection": "Taper", "name": "Pyramid",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "jar": "Olive / Burgundy / Blue", "price": 1200,
     "sizes": ["Olive · Basil", "Burgundy · Mulberry", "Blue · Oudh"],
     "image": f"{DUET}/l71ssy9l_ChatGPT%20Image%20Jul%2028%2C%202026%20at%2003_04_57%20PM.png",
     "desc": "Tiered, trapezium-stacked tapers. 25cm."},

    # ---------------- WAX BARS (₹600) ----------------
    {"id": "wax-clove-cinnamon", "category": "wax", "collection": "Wax Bars", "name": "Clove × Cinnamon",
     "fragrances": ["Clove", "Cinnamon"], "jar": "Bar", "price": 600, "image": f"{DUET}/v9gv9e1v_B617F427-57BC-4651-89AD-65D064992DA9.PNG",
     "desc": "Handcrafted wax melt bar, warm, spiced, enveloping."},
    {"id": "wax-rose-jasmine", "category": "wax", "collection": "Wax Bars", "name": "Rose × Jasmine",
     "fragrances": ["Rose", "Jasmine"], "jar": "Bar", "price": 600, "image": f"{DUET}/7bcnmeff_035E7F5A-A314-470D-9E4F-C99634F84434.PNG",
     "desc": "Handcrafted wax melt bar, soft florals, composed and clean."},

    # ---------------- FRAGRANCE OILS (Five Elements set · 15ml) ----------------
    {"id": "oils-five-elements", "category": "oils", "collection": "Fragrance Oils", "name": "The Five Elements",
     "fragrances": ["Zephyr · Wind", "Cascade · Water", "Aether · Space", "Ember · Fire", "Terra · Earth"],
     "jar": "Pack of 5 · 15ml", "price": None, "enquire": True,
     "image": f"{DUET}/wmx49ywl_40C745B2-BD21-4C78-8DAA-164A66607EC9.PNG",
     "desc": "A set of five signature fragrance oils inspired by the five elements, in 15ml bottles."},

    # ---------------- AROMA STONES (priced by weight · enquire) ----------------
    {"id": "stone-ceramic-pot", "category": "stone", "collection": "Aroma Stones", "name": "Amber Jar · Small Stones",
     "fragrances": [], "jar": "Frosted amber jar, wooden lid", "price": None, "enquire": True,
     "image": f"{DUET}/vfu6xbmo_ChatGPT%20Image%20Jul%2028%2C%202026%20at%2004_48_04%20PM.png",
     "desc": "Small lava pebbles in a frosted amber jar with a wooden lid, a gentle diffuser that doubles as a quiet decorative object."},
    {"id": "stone-abstract", "category": "stone", "collection": "Aroma Stones", "name": "Statement Lava Rock",
     "fragrances": [], "jar": "Sold separately", "price": None, "enquire": True,
     "image": f"{DUET}/kfskwid1_ChatGPT%20Image%20Jul%2028%2C%202026%20at%2004_52_53%20PM.png",
     "desc": "A single sculptural lava rock, sold on its own, a striking diffusing object and natural centrepiece."},
]

CATEGORIES = [
    {"id": "duet", "title": "Duet Collection", "tagline": "Two fragrances, one ritual."},
    {"id": "ensemble", "title": "Ensemble Collection", "tagline": "Three curated fragrances."},
    {"id": "library", "title": "Perfumer's Library", "tagline": "Six fragrances. The complete discovery experience."},
    {"id": "pillar", "title": "Pillar Candles", "tagline": "Rustic-finish pillars in three heights."},
    {"id": "taper", "title": "Taper Candles", "tagline": "Sculptural tapers, singly or as a trio."},
    {"id": "wax", "title": "Wax Bars", "tagline": "Handcrafted wax melts for modern rituals."},
    {"id": "oils", "title": "Fragrance Oils", "tagline": "A set of five, inspired by the five elements. 15ml each."},
    {"id": "stone", "title": "Aroma Stones", "tagline": "Fragrance as a timeless decorative object."},
]

PRICE_BY_ID = {p["id"]: p["price"] for p in PRODUCTS}
PRODUCT_BY_ID = {p["id"]: p for p in PRODUCTS}
