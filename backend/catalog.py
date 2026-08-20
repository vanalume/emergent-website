"""Vanalume retail catalogue (INR). MRP = crossed-out original, SP = selling price.

Schema (scalable, ready for future admin editing):
- id, category, collection, name
- mrp (int) : crossed-out original price
- sp (int)  : selling price
- images (list[str]) : 1 or more image URLs (used by the 2-image carousel)
- fragrances (list[str]) : displayed under name
- variants (list[dict], optional) : selectable variants {label, sku?, mrp?, sp?, image?}
  If variant defines its own mrp/sp/image, those override the product default.
- inventory (int, optional) : stock count. None = untracked / unlimited.
- enquire (bool) : if True, product is NOT purchasable (contact-only). Default False.
- desc (str)
"""

A = "https://customer-assets-gfyr7b9c.emergentagent.net/job_vanalume-preview/artifacts"

# Real product photos already placed on the site
IMG = {
    "awaken": f"{A}/j3hz7tne_AWAKEN%20copy.png",
    "awaken_box": f"{A}/nflsyjq1_Awaken%20box.png",
    "bloom": f"{A}/l9rrpbom_BLOOM%20copy.png",
    "bloom_box": f"{A}/2tnx0tsx_bloom%20box.png",
    "clarity": f"{A}/1qz79thf_CLARITY%20copy.png",
    "clarity_box": f"{A}/kqso40pb_clarity%20box.png",
    "equilibrium": f"{A}/i8wo86bm_EQUILIBRIUM%20copy.png",
    "equilibrium_box": f"{A}/2wuv7lii_Equilibrium%20box.png",
    "intimacy": f"{A}/u8xpxby0_INTIMACY.png",
    "intimacy_box": f"{A}/2i1cnhod_intimacy%20box.png",
    "oriental": f"{A}/apwsai2q_ORIENTAL%20CAFE.png",
    "oriental_box": f"{A}/gxgy5891_orientla%20cafe%20box.png",
    "timeless": f"{A}/ini4y51o_TIMELESS.png",
    "timeless_box": f"{A}/pivbqtxh_Timeless%20box.png",
    "celebrate": f"{A}/afp78v3j_celebrate.png",
    "presence": f"{A}/r2kqvo00_presence.png",
    "library": f"{A}/egsxf81t_library.png",
    "midnight": f"{A}/63b55l4v_midnight%20blue.png",
    "green": f"{A}/81smp3e8_deep%20green.png",
    "terracotta": f"{A}/inlxtdzm_terracota.png",
    "seasand": f"{A}/c3u0h8bw_sea%20sand.png",
    "beaded": f"{A}/j3iypem3_ChatGPT%20Image%20Jul%2029%2C%202026%20at%2011_51_48%20PM.png",
    "wax_clove": f"{A}/v9gv9e1v_B617F427-57BC-4651-89AD-65D064992DA9.PNG",
    "wax_rose": f"{A}/7bcnmeff_035E7F5A-A314-470D-9E4F-C99634F84434.PNG",
    "stone_jar": f"{A}/vfu6xbmo_ChatGPT%20Image%20Jul%2028%2C%202026%20at%2004_48_04%20PM.png",
    "stone_rock": f"{A}/kfskwid1_ChatGPT%20Image%20Jul%2028%2C%202026%20at%2004_52_53%20PM.png",
    "oils": f"{A}/wmx49ywl_40C745B2-BD21-4C78-8DAA-164A66607EC9.PNG",
}


def _duet(id_, name, frags, img_key, box_key=None):
    images = [IMG[img_key]]
    if box_key:
        images.append(IMG[box_key])
    return {
        "id": id_, "category": "duet", "collection": name, "name": name,
        "fragrances": frags, "mrp": 1899, "sp": 1499,
        "images": images,
        "desc": "Two fragrances, one ritual.",
    }


# All 14 individual fragrances (from all Duet sets combined)
DUET_INDIVIDUAL_VARIANTS = [
    {"label": "Lemongrass", "image": IMG["awaken"]},
    {"label": "Cedarwood", "image": IMG["awaken"]},
    {"label": "Rose", "image": IMG["bloom"]},
    {"label": "Jasmine", "image": IMG["bloom"]},
    {"label": "White Sage", "image": IMG["clarity"]},
    {"label": "Aqua", "image": IMG["clarity"]},
    {"label": "Tea Tree", "image": IMG["equilibrium"]},
    {"label": "Sandalwood", "image": IMG["equilibrium"]},
    {"label": "Lavender", "image": IMG["intimacy"]},
    {"label": "Mogra", "image": IMG["intimacy"]},
    {"label": "Turkish Coffee", "image": IMG["oriental"]},
    {"label": "Vanilla", "image": IMG["oriental"]},
    {"label": "Black Oudh", "image": IMG["timeless"]},
    {"label": "White Oudh", "image": IMG["timeless"]},
]


PRODUCTS = [
    # ---------------- DUET GIFT BOX (7 sets · MRP 1899 · SP 1499) ----------------
    _duet("duet-awaken", "Awaken", ["Lemongrass", "Cedarwood"], "awaken", "awaken_box"),
    _duet("duet-bloom", "Bloom", ["Rose", "Jasmine"], "bloom", "bloom_box"),
    _duet("duet-clarity", "Clarity", ["White Sage", "Aqua"], "clarity", "clarity_box"),
    _duet("duet-equilibrium", "Equilibrium", ["Tea Tree", "Sandalwood"], "equilibrium", "equilibrium_box"),
    _duet("duet-intimacy", "Intimacy", ["Lavender", "Mogra"], "intimacy", "intimacy_box"),
    _duet("duet-oriental-cafe", "Oriental Cafe", ["Turkish Coffee", "Vanilla"], "oriental", "oriental_box"),
    _duet("duet-timeless", "Timeless", ["Black Oudh", "White Oudh"], "timeless", "timeless_box"),

    # ---------------- DUET INDIVIDUAL (14 variants · MRP 999 · SP 599) ----------------
    {"id": "duet-individual", "category": "duet", "collection": "Individual",
     "name": "Individual Candle", "fragrances": [f["label"] for f in DUET_INDIVIDUAL_VARIANTS],
     "mrp": 999, "sp": 599, "images": [IMG["intimacy"]],
     "variants": DUET_INDIVIDUAL_VARIANTS,
     "desc": "Any single fragrance from the Duet library. Choose your scent."},

    # ---------------- ENSEMBLE (4 SKUs) ----------------
    {"id": "ensemble-celebrate-tin", "category": "ensemble", "collection": "Celebrate",
     "name": "Celebrate · Tin", "fragrances": ["Apple Cinnamon", "Vanilla", "Turkish Coffee"],
     "mrp": 1299, "sp": 999, "images": [IMG["celebrate"]],
     "desc": "Three warm, celebratory scents in the signature tin."},
    {"id": "ensemble-celebrate-metallic", "category": "ensemble", "collection": "Celebrate",
     "name": "Celebrate · Metallic Jar", "fragrances": ["Apple Cinnamon", "Vanilla", "Turkish Coffee"],
     "mrp": 2599, "sp": 1999, "images": [IMG["celebrate"]],
     "desc": "Celebrate, in a premium 220cc metallic jar."},
    {"id": "ensemble-presence-tin", "category": "ensemble", "collection": "Presence",
     "name": "Presence · Tin", "fragrances": ["White Oudh", "Black Oudh", "Musk"],
     "mrp": 1299, "sp": 999, "images": [IMG["presence"]],
     "desc": "A composed trio of oudh and musk in the signature tin."},
    {"id": "ensemble-presence-metallic", "category": "ensemble", "collection": "Presence",
     "name": "Presence · Metallic Jar", "fragrances": ["White Oudh", "Black Oudh", "Musk"],
     "mrp": 2599, "sp": 1999, "images": [IMG["presence"]],
     "desc": "Presence, in a premium 220cc metallic jar."},

    # ---------------- PERFUMER'S LIBRARY (1) ----------------
    {"id": "library-odyssey", "category": "library", "collection": "Odyssey",
     "name": "Odyssey", "fragrances": ["Neroli", "Black Oudh", "Tuberose", "Sandalwood", "Musk", "Cedarwood"],
     "mrp": 2299, "sp": 1799, "images": [IMG["library"]],
     "desc": "The complete discovery experience, six fragrances."},

    # ---------------- PILLAR CANDLES (4 SKUs) ----------------
    # 3 individual sizes with colour variants + 1 pack of 3
    {"id": "pillar-4in", "category": "pillar", "collection": "Sea & Sand", "name": "Pillar 4-inch",
     "fragrances": ["Oudh", "Spearmint", "Patchouli", "Aqua"], "mrp": 799, "sp": 599,
     "images": [IMG["midnight"]],
     "variants": [
        {"label": "Midnight Blue · Oudh", "image": IMG["midnight"]},
        {"label": "Deep Green · Spearmint", "image": IMG["green"]},
        {"label": "Terracotta · Patchouli", "image": IMG["terracotta"]},
        {"label": "Sea & Sand · Aqua", "image": IMG["seasand"]},
     ],
     "desc": "Rustic-finish 4-inch pillar. Choose your colour and fragrance."},
    {"id": "pillar-5in", "category": "pillar", "collection": "Sea & Sand", "name": "Pillar 5-inch",
     "fragrances": ["Oudh", "Spearmint", "Patchouli", "Aqua"], "mrp": 899, "sp": 699,
     "images": [IMG["green"]],
     "variants": [
        {"label": "Midnight Blue · Oudh", "image": IMG["midnight"]},
        {"label": "Deep Green · Spearmint", "image": IMG["green"]},
        {"label": "Terracotta · Patchouli", "image": IMG["terracotta"]},
        {"label": "Sea & Sand · Aqua", "image": IMG["seasand"]},
     ],
     "desc": "Rustic-finish 5-inch pillar. Choose your colour and fragrance."},
    {"id": "pillar-6in", "category": "pillar", "collection": "Sea & Sand", "name": "Pillar 6-inch",
     "fragrances": ["Oudh", "Spearmint", "Patchouli", "Aqua"], "mrp": 999, "sp": 799,
     "images": [IMG["terracotta"]],
     "variants": [
        {"label": "Midnight Blue · Oudh", "image": IMG["midnight"]},
        {"label": "Deep Green · Spearmint", "image": IMG["green"]},
        {"label": "Terracotta · Patchouli", "image": IMG["terracotta"]},
        {"label": "Sea & Sand · Aqua", "image": IMG["seasand"]},
     ],
     "desc": "Rustic-finish 6-inch pillar. Choose your colour and fragrance."},
    {"id": "pillar-pack3", "category": "pillar", "collection": "Sea & Sand", "name": "Pillar Pack of 3",
     "fragrances": ["Oudh", "Spearmint", "Patchouli", "Aqua"], "mrp": 2299, "sp": 1699,
     "images": [IMG["seasand"]],
     "desc": "A set of three rustic-finish pillars in curated colours and heights."},

    # ---------------- TAPER (1 SKU) ----------------
    {"id": "taper-set3", "category": "taper", "collection": "Taper", "name": "Taper Set of 3",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "mrp": 999, "sp": 799,
     "images": [IMG["beaded"]],
     "desc": "Three sculptural tapers, in Mulberry, Oudh and Basil."},

    # ---------------- WAX BARS (1 SKU) ----------------
    {"id": "wax-set2", "category": "wax", "collection": "Wax Bars", "name": "Wax Bars Set of 2",
     "fragrances": ["Clove", "Cinnamon", "Rose", "Jasmine"], "mrp": 799, "sp": 599,
     "images": [IMG["wax_clove"]],
     "desc": "Two handcrafted wax melt bars — Clove × Cinnamon and Rose × Jasmine."},

    # ---------------- AROMA (2 stones + 1 oil set) ----------------
    {"id": "aroma-stone-jar", "category": "aroma", "collection": "Aroma Stones",
     "name": "Aroma Stones · Jar with 15cc Oil", "fragrances": [],
     "mrp": 1799, "sp": 1299, "images": [IMG["stone_jar"]],
     "desc": "Small lava pebbles in a frosted amber jar with a 15cc signature aroma oil."},
    {"id": "aroma-sculpture", "category": "aroma", "collection": "Aroma Stones",
     "name": "Aroma Sculpture with Dish", "fragrances": [],
     "mrp": 5999, "sp": 4999, "images": [IMG["stone_rock"]],
     "desc": "A sculptural lava rock centrepiece mounted on a ceramic dish."},
    {"id": "aroma-oil-set5", "category": "aroma", "collection": "Aroma Oils",
     "name": "Aroma Oil · 30cc Set of 5", "fragrances": ["Zephyr", "Cascade", "Aether", "Ember", "Terra"],
     "mrp": 1299, "sp": 999, "images": [IMG["oils"]],
     "desc": "A set of five 30cc signature aroma oils, inspired by the five elements."},
]


CATEGORIES = [
    {"id": "duet",     "title": "Duet Collection",      "tagline": "Two fragrances, one ritual. Also available as individuals."},
    {"id": "ensemble", "title": "Ensemble Collection",  "tagline": "Three curated fragrances. Tin or premium metallic jar."},
    {"id": "library",  "title": "Perfumer's Library",   "tagline": "Six fragrances. The complete discovery experience."},
    {"id": "pillar",   "title": "Pillar Candles",       "tagline": "Rustic-finish pillars in three heights, or as a pack of three."},
    {"id": "taper",    "title": "Taper Candles",        "tagline": "Sculptural tapers, in a set of three."},
    {"id": "wax",      "title": "Wax Bars",             "tagline": "Handcrafted wax melts, in a set of two."},
    {"id": "aroma",    "title": "Aroma Stones & Oils",  "tagline": "Objects and oils for a quiet, sensory home."},
]


# ---------- Helpers used by the backend ----------
PRODUCT_BY_ID = {p["id"]: p for p in PRODUCTS}


def resolve_line_price(product, variant_label=None):
    """Return the SP for a given product/variant."""
    if variant_label and product.get("variants"):
        for v in product["variants"]:
            if v["label"] == variant_label and "sp" in v:
                return v["sp"]
    return product.get("sp")


# Shipping rule
SHIPPING_FLAT = 100        # INR
SHIPPING_FREE_THRESHOLD = 2000  # SP subtotal >= this => free


def compute_shipping(subtotal: int) -> int:
    return 0 if subtotal >= SHIPPING_FREE_THRESHOLD else SHIPPING_FLAT
