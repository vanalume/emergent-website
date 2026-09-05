"""Vanalume retail catalogue seed (INR). MRP = crossed-out original, SP = selling price.

This module is NOT a runtime database. It holds the canonical seed data and a
`seed_catalog()` helper that persists it into MongoDB at startup (conforming to
the Product / Category models in `models.py`). Every API route reads the
catalogue from MongoDB via `database.db` — never from these static lists.

Schema (scalable, ready for future admin editing):
- id, category, collection, name
- mrp (int) : crossed-out original price
- sp (int)  : selling price
- images (list[str]) : 1 or more image URLs (used by the 2-image carousel)
- fragrances (list[str]) : displayed under name
- variants (list[dict], optional) : selectable variants {label, sku?, mrp?, sp?, image?}
- sizes (list[dict], optional) : selectable sizes {label, mrp, sp} — overrides product SP
- desc (str)      : short (card) description
- long_desc (str) : extended description shown on the product detail page
- ritual (dict, optional) : {"title": str, "steps": [str, ...]} — Vanalume ritual instruction
- enquire (bool) : if True, product is NOT purchasable (contact-only). Default False.
"""

from config import VANALUME_URL
from models import Category, Product

# A = "https://customer-assets-gfyr7b9c.emergentagent.net/job_vanalume-preview/artifacts"

A = VANALUME_URL

IMG = {
    "awaken": f"{A}/duet/awaken.png",
    "awaken_box": f"{A}/boxes-with-candles/awaken-box.png",
    "bloom": f"{A}/duet/bloom.png",
    "clarity": f"{A}/duet/clarity.png",
    "equilibrium": f"{A}/duet/equilibrium.png",
    "intimacy": f"{A}/duet/intimacy.png",
    "oriental": f"{A}/duet/oriental-cafe.png",
    "timeless": f"{A}/duet/timeless.png",
    "bloom_box": f"{A}/boxes-with-candles/bloom-box.png",
    "clarity_box": f"{A}/boxes-with-candles/clarity-box.png",
    "equilibrium_box": f"{A}/boxes-with-candles/equilibrium-box.png",
    "intimacy_box": f"{A}/boxes-with-candles/intimacy-box.png",
    "oriental_box": f"{A}/boxes-with-candles/oriental-cafe-box.png",
    "timeless_box": f"{A}/boxes-with-candles/timeless-box.png",

    "celebrate": f"{A}/ensemble-tin/celebrate.png",
    "presence": f"{A}/ensemble-tin/presence.png",
    "celebrate_metallic": f"{A}/ensemble-metallic/celebrate-metallic.png",
    "presence_metallic": f"{A}/ensemble-metallic/presence-metallic.png",
    "library": f"{A}/library/library.png",
    
    "midnight-blue-4-inch": f"{A}/pillar/midnight-blue/midnight-blue-4.png",
    "midnight-blue-5-inch": f"{A}/pillar/midnight-blue/midnight-blue-5.png",
    "midnight-blue-6-inch": f"{A}/pillar/midnight-blue/midnight-blue-6.png",
    "midnight-blue-pack": f"{A}/pillar/midnight-blue/midnight-blue-pack.png",

    "deep-green-4-inch": f"{A}/pillar/deep-green/deep-green-4.png",
    "deep-green-5-inch": f"{A}/pillar/deep-green/deep-green-5.png",
    "deep-green-6-inch": f"{A}/pillar/deep-green/deep-green-6.png",
    "deep-green-pack": f"{A}/pillar/deep-green/deep-green-pack.png",

    "sea-and-sand-4-inch": f"{A}/pillar/sea-and-sand/sea-sand-4.png",
    "sea-and-sand-5-inch": f"{A}/pillar/sea-and-sand/sea-sand-5.png",
    "sea-and-sand-6-inch": f"{A}/pillar/sea-and-sand/sea-sand-6.png",
    "sea-and-sand-pack": f"{A}/pillar/sea-and-sand/sea-sand-pack.png",
    
    "terracotta-4-inch": f"{A}/pillar/terracotta/terracotta-4.png",
    "terracotta-5-inch": f"{A}/pillar/terracotta/terracotta-5.png",
    "terracotta-6-inch": f"{A}/pillar/terracotta/terracotta-6.png",
    "terracotta-pack": f"{A}/pillar/terracotta/terracotta-pack.png",

    "midnight": f"{A}/pillar/midnight-blue.png",
    "green": f"{A}/pillar/deep-green.png",
    "terracotta": f"{A}/pillar/terracota.png",
    "seasand": f"{A}/pillar/sea-sand.png",

    "orbis": f"{A}/taper/orbis.png",
    "obelisk": f"{A}/taper/obelisk.png",
    "confluence": f"{A}/taper/confluence.png",
    "stria": f"{A}/taper/stria.png",

    "wax_clove": f"{A}/wax-bars/wax-bar-clovexcinnamon.png",
    "wax_rose": f"{A}/wax-bars/wax-bar-rosexjasmine.png",
    "stone_jar": f"{A}/aroma-stones/small-stones-with-amber-jar.png",
    "stone_rock": f"{A}/aroma-stones/large-stone.png",

    "oils": f"{A}/oils/aroma-oils.png",

    # Individual candle photography (supplied by user)
    "s_aqua":           f"{A}/single-candles/aqua.png",
    "s_black_oudh":     f"{A}/single-candles/black-oudh%20.png",
    "s_awaken_pair":    f"{A}/single-candles/cendarwood-and-lemongrass.png",
    "s_jasmine":        f"{A}/single-candles/jasmine.png",
    "s_intimacy_pair":  f"{A}/single-candles/mogra-and-lavender.png",
    "s_rose":           f"{A}/single-candles/rose.png",
    "s_white_sage":     f"{A}/single-candles/white-sage.png",
    "s_white_oudh":     f"{A}/single-candles/white-oudh-indi.png",
    "s_equilib_pair":   f"{A}/single-candles/sandalwood-and-teatree-indi.png",
    "s_oriental_pair":  f"{A}/single-candles/oriental-cafe.png",
}


# ---------- Duet ritual copy ----------
# Each Duet is a pair of scents that together compose a mood.
# The ritual guides the user on how to burn them.

_DUET_META = {
    "awaken": {
        "long_desc": (
            "Awaken is the first breath of the day, translated into wax. Cool citrus lemongrass meets "
            "steady, grounded cedarwood — a duet made to lift you gently out of sleep, not shock you into it. "
            "Together they turn a Monday morning into something that feels deliberate."
        ),
        "ritual": {
            "title": "The Awaken ritual",
            "steps": [
                "Begin with Lemongrass. Light it as you start your morning — the citrus opens up first and clears the air.",
                "Let it burn on its own for eight to ten minutes. Give the room time to fill.",
                "Now light Cedarwood alongside it. The warmth grounds the citrus so it doesn't feel sharp anymore.",
                "That's the Awaken moment — bright at the top, calm underneath. A morning that finally has a shape.",
            ],
        },
    },
    "bloom": {
        "long_desc": (
            "Bloom is the fragrance of a garden waking up. Dewy rose meets warm, indulgent jasmine — one is fresh and open, "
            "the other is soft and full. Burnt together they smell like a bouquet that hasn't been arranged yet, which is "
            "exactly the point."
        ),
        "ritual": {
            "title": "The Bloom ritual",
            "steps": [
                "Start with Rose. Let the fresh, dewy top note settle into the room for a few minutes on its own.",
                "Once you can smell it clearly from across the room, light Jasmine.",
                "The jasmine wraps itself around the rose and sweetens everything.",
                "This is Bloom — a room that smells like it's in season.",
            ],
        },
    },
    "clarity": {
        "long_desc": (
            "Clarity is the pair we wrote first, and everything else is built around it. Herbal white sage clears the space; "
            "clean, cool aqua fills it back up with something calmer. Together they smell like a room after the windows have "
            "been open all afternoon."
        ),
        "ritual": {
            "title": "The Clarity ritual",
            "steps": [
                "Light White Sage first. This is the reset — the smoky, herbal top note clears whatever the day has left behind.",
                "Let it burn alone for about ten minutes. Wait until you can really feel the room fill up.",
                "Now light Aqua next to it. The cool, watery note takes over softly, without pushing the sage away.",
                "That's Clarity — the moment the mind actually goes quiet. Not empty, just clear.",
            ],
        },
    },
    "equilibrium": {
        "long_desc": (
            "Equilibrium is the duet for the middle of a long day. Sharp, medicinal tea tree resets the room, and warm "
            "sandalwood softens the edges. It smells the way a good, unhurried afternoon feels."
        ),
        "ritual": {
            "title": "The Equilibrium ritual",
            "steps": [
                "Light Tea Tree first. The crisp, almost medicinal opening resets the room — this is the exhale.",
                "Let it burn quietly for a few minutes.",
                "Then light Sandalwood. Its woody warmth catches the tea tree and softens it into something calming.",
                "This is Equilibrium — sharp, then soft. Balanced, on purpose.",
            ],
        },
    },
    "intimacy": {
        "long_desc": (
            "Intimacy is a slow, private evening in wax. Lavender is soft and sleepy, mogra is warm and floral — one calms, "
            "the other lingers. Burnt together they make a room feel closer without saying anything."
        ),
        "ritual": {
            "title": "The Intimacy ritual",
            "steps": [
                "Start with Lavender. Its cool, floral softness lowers the volume of the room straight away.",
                "Give it a few minutes to settle in.",
                "Then light Mogra. The warm white-floral note deepens the lavender and makes the whole room feel a little heavier — in a good way.",
                "This is Intimacy — quiet, close, unhurried.",
            ],
        },
    },
    "oriental-cafe": {
        "long_desc": (
            "Oriental Café is a slow Sunday morning in a corner café. Dark, roasted Turkish coffee meets soft, familiar vanilla "
            "— together they smell like something warm just came out of the kitchen. It's less a fragrance, more a mood."
        ),
        "ritual": {
            "title": "The Oriental Café ritual",
            "steps": [
                "Light Turkish Coffee first. Let the deep, roasted note fill the room the way a real coffee shop would.",
                "Wait a few minutes for it to settle. It should feel warm, not sharp.",
                "Now light Vanilla. The soft sweetness melts into the coffee and turns it into a dessert.",
                "This is Oriental Café — a Sunday you're not in a hurry to end.",
            ],
        },
    },
    "timeless": {
        "long_desc": (
            "Timeless is our most composed duet, and our darkest. White oudh is soft, creamy, almost powdery; black oudh is "
            "smoky, deep and quiet. Together they smell the way a well-worn library smells — expensive, unhurried, personal."
        ),
        "ritual": {
            "title": "The Timeless ritual",
            "steps": [
                "Light White Oudh first. Its softer, creamier take on oudh sets the tone gently.",
                "Let it fill the room. This is the base you want before adding depth.",
                "Then light Black Oudh. The smoky, resinous darkness settles underneath and gives the whole room weight.",
                "This is Timeless — the kind of room you don't feel like leaving.",
            ],
        },
    },
}


def _duet(id_, name, frags, img_key, box_key, key):
    meta = _DUET_META[key]
    return {
        "id": id_, "category": "jar-candles", "subcategory": "duet", "collection": name, "name": name,
        "fragrances": frags, "mrp": 1899, "sp": 1499,
        "images": [IMG[img_key], IMG[box_key]],
        "desc": "Two fragrances, one ritual.",
        "long_desc": meta["long_desc"],
        "ritual": meta["ritual"],
        "includes": [
            "Two 180 ml hand-poured scented candles in elegant frosted-glass jars",
            "Each candle contains a premium soy–coconut wax blend",
            f"Two complementary fragrances - {frags[0]} and {frags[1]}, designed to be enjoyed individually or together",
            "One ritual card for the set, featuring an especially curated Spotify music playlist code",
            "A candle-care guide with burning and safety instructions", "Presented in Vanalume’s signature premium gift box"

            # f"Signature Vanalume gift box, containing two 180 ml soy-coconut wax candles — {frags[0]} and {frags[1]}",
            # "A printed ritual guide",
            # "Unique Spotify playlist bar-code",
        ],
    }


PRODUCTS = [
    # ============ DUET GIFT SETS (7 sets · MRP 1899 · SP 1499) ============
    _duet("duet-awaken",        "Awaken",        ["Lemongrass", "Cedarwood"],       "awaken",       "awaken_box",       "awaken"),
    _duet("duet-bloom",         "Bloom",         ["Rose", "Jasmine"],               "bloom",        "bloom_box",        "bloom"),
    _duet("duet-clarity",       "Clarity",       ["White Sage", "Aqua"],            "clarity",      "clarity_box",      "clarity"),
    _duet("duet-equilibrium",   "Equilibrium",   ["Tea Tree", "Sandalwood"],        "equilibrium",  "equilibrium_box",  "equilibrium"),
    _duet("duet-intimacy",      "Intimacy",      ["Lavender", "Mogra"],             "intimacy",     "intimacy_box",     "intimacy"),
    _duet("duet-oriental-cafe", "Oriental Cafe", ["Turkish Coffee", "Vanilla"],     "oriental",     "oriental_box",     "oriental-cafe"),
    _duet("duet-timeless",      "Timeless",      ["Black Oudh", "White Oudh"],      "timeless",     "timeless_box",     "timeless"),

    # ============ INDIVIDUAL CANDLES (14 SKUs · MRP 999 · SP 599) ============
    # Separate category — each fragrance sold on its own. Photos to come per fragrance.
    {"id": "single-lemongrass",      "category": "jar-candles", "subcategory": "single", "collection": "Awaken",        "name": "Lemongrass",     "fragrances": ["Lemongrass"],      "mrp": 999, "sp": 599, "images": [IMG["s_awaken_pair"]],       "image_crops": ["bottom", None], "desc": "Single Awaken candle · Lemongrass. Sharp, citrusy, morning-bright.",             "long_desc": "One 180 ml Lemongrass candle from the Awaken duet. Cool citrus with a herbal undertone — the top half of the Awaken ritual, on its own."},
    {"id": "single-cedarwood",       "category": "jar-candles", "subcategory": "single", "collection": "Awaken",        "name": "Cedarwood",      "fragrances": ["Cedarwood"],       "mrp": 999, "sp": 599, "images": [IMG["s_awaken_pair"]],       "image_crops": ["top", None],    "desc": "Single Awaken candle · Cedarwood. Woody, warm, grounded.",                        "long_desc": "One 180 ml Cedarwood candle from the Awaken duet. Steady woody warmth — the base half of the Awaken ritual, burned solo."},
    {"id": "single-rose",            "category": "jar-candles", "subcategory": "single", "collection": "Bloom",         "name": "Rose",           "fragrances": ["Rose"],            "mrp": 999, "sp": 599, "images": [IMG["s_rose"]],        "desc": "Single Bloom candle · Rose. Fresh, dewy, garden-in-the-morning.",                "long_desc": "One 180 ml Rose candle from the Bloom duet. A clean, dewy rose — the fresh half of the Bloom ritual."},
    {"id": "single-jasmine",         "category": "jar-candles", "subcategory": "single", "collection": "Bloom",         "name": "Jasmine",        "fragrances": ["Jasmine"],         "mrp": 999, "sp": 599, "images": [IMG["s_jasmine"]],        "desc": "Single Bloom candle · Jasmine. Warm, indulgent, floral.",                         "long_desc": "One 180 ml Jasmine candle from the Bloom duet. Warm and full white-floral — the sweeter half of the Bloom ritual."},
    {"id": "single-white-sage",      "category": "jar-candles", "subcategory": "single", "collection": "Clarity",       "name": "White Sage",     "fragrances": ["White Sage"],      "mrp": 999, "sp": 599, "images": [IMG["s_white_sage"]],      "desc": "Single Clarity candle · White Sage. Herbal, cleansing, quietly smoky.",           "long_desc": "One 180 ml White Sage candle from the Clarity duet. A gentle, herbal reset — the clearing half of the Clarity ritual."},
    {"id": "single-aqua",            "category": "jar-candles", "subcategory": "single", "collection": "Clarity",       "name": "Aqua",           "fragrances": ["Aqua"],            "mrp": 999, "sp": 599, "images": [IMG["s_aqua"]],      "desc": "Single Clarity candle · Aqua. Cool, clean, quietly watery.",                      "long_desc": "One 180 ml Aqua candle from the Clarity duet. Cool and clean — the calming half of the Clarity ritual."},
    {"id": "single-tea-tree",        "category": "jar-candles", "subcategory": "single", "collection": "Equilibrium",   "name": "Tea Tree",       "fragrances": ["Tea Tree"],        "mrp": 999, "sp": 599, "images": [IMG["s_equilib_pair"]],  "image_crops": ["top", None],    "desc": "Single Equilibrium candle · Tea Tree. Sharp, herbal, clearing.",                  "long_desc": "One 180 ml Tea Tree candle from the Equilibrium duet. Crisp and medicinal — the reset half of the Equilibrium ritual."},
    {"id": "single-sandalwood",      "category": "jar-candles", "subcategory": "single", "collection": "Equilibrium",   "name": "Sandalwood",     "fragrances": ["Sandalwood"],      "mrp": 999, "sp": 599, "images": [IMG["s_equilib_pair"]],  "image_crops": ["bottom", None], "desc": "Single Equilibrium candle · Sandalwood. Woody, soft, calming.",                   "long_desc": "One 180 ml Sandalwood candle from the Equilibrium duet. Warm woody softness — the settling half of the Equilibrium ritual."},
    {"id": "single-lavender",        "category": "jar-candles", "subcategory": "single", "collection": "Intimacy",      "name": "Lavender",       "fragrances": ["Lavender"],        "mrp": 999, "sp": 599, "images": [IMG["s_intimacy_pair"]],     "image_crops": ["bottom", None], "desc": "Single Intimacy candle · Lavender. Cool, floral, quietening.",                    "long_desc": "One 180 ml Lavender candle from the Intimacy duet. Soft and sleepy — the calming half of the Intimacy ritual."},
    {"id": "single-mogra",           "category": "jar-candles", "subcategory": "single", "collection": "Intimacy",      "name": "Mogra",          "fragrances": ["Mogra"],           "mrp": 999, "sp": 599, "images": [IMG["s_intimacy_pair"]],     "image_crops": ["top", None],    "desc": "Single Intimacy candle · Mogra. Warm, floral, close.",                            "long_desc": "One 180 ml Mogra candle from the Intimacy duet. Warm and full jasmine-family floral — the deepening half of the Intimacy ritual."},
    {"id": "single-turkish-coffee",  "category": "jar-candles", "subcategory": "single", "collection": "Oriental Cafe", "name": "Turkish Coffee", "fragrances": ["Turkish Coffee"],  "mrp": 999, "sp": 599, "images": [IMG["s_oriental_pair"]],     "image_crops": ["bottom", None], "desc": "Single Oriental Café candle · Turkish Coffee. Dark, roasted, café-warm.",         "long_desc": "One 180 ml Turkish Coffee candle from the Oriental Café duet. Deep and roasted — the café half of the ritual."},
    {"id": "single-vanilla",         "category": "jar-candles", "subcategory": "single", "collection": "Oriental Cafe", "name": "Vanilla",        "fragrances": ["Vanilla"],         "mrp": 999, "sp": 599, "images": [IMG["s_oriental_pair"]],     "image_crops": ["top", None],    "desc": "Single Oriental Café candle · Vanilla. Soft, sweet, familiar.",                    "long_desc": "One 180 ml Vanilla candle from the Oriental Café duet. Soft and dessert-warm — the sweet half of the ritual."},
    {"id": "single-black-oudh",      "category": "jar-candles", "subcategory": "single", "collection": "Timeless",      "name": "Black Oudh",     "fragrances": ["Black Oudh"],      "mrp": 999, "sp": 599, "images": [IMG["s_black_oudh"]],     "desc": "Single Timeless candle · Black Oudh. Smoky, resinous, deep.",                     "long_desc": "One 180 ml Black Oudh candle from the Timeless duet. Smoky and deep — the darker half of the Timeless ritual."},
    {"id": "single-white-oudh",      "category": "jar-candles", "subcategory": "single", "collection": "Timeless",      "name": "White Oudh",     "fragrances": ["White Oudh"],      "mrp": 999, "sp": 599, "images": [IMG["s_white_oudh"]],     "desc": "Single Timeless candle · White Oudh. Creamy, powdery, refined.",                  "long_desc": "One 180 ml White Oudh candle from the Timeless duet. Creamy and refined — the softer half of the Timeless ritual."},

    # ============ ENSEMBLE (4 SKUs) ============
    {"id": "ensemble-celebrate-tin",      "category": "jar-candles", "subcategory": "ensemble-tin", "collection": "Celebrate", "name": "Celebrate · Tin",          "fragrances": ["Apple Cinnamon", "Vanilla", "Turkish Coffee"], "mrp": 1299, "sp": 999,  "images": [IMG["celebrate"]],          "desc": "Three warm, celebratory scents in the signature tin.",                       "long_desc": "Three 100 ml tin candles in Apple Cinnamon, Vanilla and Turkish Coffee — the scents you associate with warm rooms and warm people. Gift-ready as they arrive."
     
    },
    {"id": "ensemble-celebrate-metallic", "category": "jar-candles", "subcategory": "ensemble-metal", "collection": "Celebrate", "name": "Celebrate · Metallic Jar", "fragrances": ["Apple Cinnamon", "Vanilla", "Turkish Coffee"], "mrp": 2599, "sp": 1999, "images": [IMG["celebrate_metallic"]], "desc": "Celebrate, in a premium 220cc metallic jar.",                                "long_desc": "The same three Celebrate scents — Apple Cinnamon, Vanilla, Turkish Coffee — now in a heavier 220cc rose-metallic jar. Made to sit on a table, not be hidden away."},
    {"id": "ensemble-presence-tin",       "category": "jar-candles", "subcategory": "ensemble-tin", "collection": "Presence",  "name": "Presence · Tin",           "fragrances": ["White Oudh", "Black Oudh", "Musk"],            "mrp": 1299, "sp": 999,  "images": [IMG["presence"]],           "desc": "A composed trio of oudh and musk in the signature tin.",                      "long_desc": "Three 100 ml tin candles in White Oudh, Black Oudh and Musk — a composed, quieter trio for evenings and low-lit rooms."},
    {"id": "ensemble-presence-metallic",  "category": "jar-candles", "subcategory": "ensemble-metal", "collection": "Presence",  "name": "Presence · Metallic Jar",  "fragrances": ["White Oudh", "Black Oudh", "Musk"],            "mrp": 2599, "sp": 1999, "images": [IMG["presence_metallic"]],  "desc": "Presence, in a premium 220cc metallic jar.",                                  "long_desc": "The Presence trio — White Oudh, Black Oudh, Musk — in the premium 220cc metallic jar. Heavier, quieter, and made to stay lit for a full evening."},

    # ============ PERFUMER'S LIBRARY ============
    {"id": "library-odyssey", "category": "jar-candles", "subcategory": "library", "collection": "Odyssey", "name": "Odyssey",
     "fragrances": ["Neroli", "Black Oudh", "Tuberose", "Sandalwood", "Musk", "Cedarwood"],
     "mrp": 2299, "sp": 1799, "images": [IMG["library"]],
     "desc": "The complete discovery experience, six fragrances.",
     "long_desc": "Odyssey is Vanalume's complete tasting menu — six discovery-size candles across Neroli, Black Oudh, Tuberose, Sandalwood, Musk and Cedarwood. It's how we recommend starting if you don't yet know which fragrance is yours."},

    # ============ CONCRETE JAR ============
    {"id": "concrete-jar-meadow-lace", "category": "jar-candles", "subcategory": "concrete-jar", "collection": "Concrete Jar", "name": "Meadow Lace",
     "fragrances": ["Neroli", "Black Oudh", "Tuberose", "Sandalwood", "Musk", "Cedarwood"],
     "mrp": 2299, "sp": 1799, "images": [IMG["library"]],
     "desc": "The complete discovery experience, six fragrances.",
     "long_desc": "Odyssey is Vanalume's complete tasting menu — six discovery-size candles across Neroli, Black Oudh, Tuberose, Sandalwood, Musk and Cedarwood. It's how we recommend starting if you don't yet know which fragrance is yours."},


    # ============ PILLAR CANDLES (4 separate SKUs) ============
    {"id": "pillar-midnight-blue", "category": "pillar", "collection": "Pillar", "name": "Pillar Candle · Midnight Blue",
     "fragrances": ["Oudh"], "mrp": 799, "sp": 599,
     "images": [IMG["midnight-blue-4-inch"]],
     "sizes": [
        {"label": "4-inch", "image": IMG["midnight-blue-4-inch"], "mrp": 799, "sp": 599, "desc": "Our Shortest rustic finish pillar, at 4 inches. Long clean burn texted surface. Four colour fragrance pairing to choose from." },
        {"label": "5-inch", "image": IMG["midnight-blue-5-inch"], "mrp": 899, "sp": 699, "desc": "The Middle height, at 5 inches. Same rustic finish, same 4 colour-fragrance, parings, longer burn than the 4-inch." },
        {"label": "6-inch", "image": IMG["midnight-blue-6-inch"], "mrp": 999, "sp": 799, "desc": " The tallest at 6-inches. Statement height for a mantel, or bath, same finish same four pairings" },
        {"label": "Pack of 3", "image": IMG["midnight-blue-pack"], "mrp": 2299, "sp": 1699, "desc": " the full pillar set: 4-inch, 5-inch and 6-inch pillars in one colour–fragrance pairing. Meant to be arranged together – the height variation is the point." },
     ],
    },




    {"id": "pillar-deep-green", "category": "pillar", "collection": "Pillar", "name": "Pillar Candle · Deep Green",
     "fragrances": ["Spearmint"], "mrp": 799, "sp": 599,
     "images": [IMG["deep-green-4-inch"]],
       "sizes": [
        {"label": "4-inch", "image": IMG["deep-green-4-inch"], "mrp": 799, "sp": 599, "desc": "Our Shortest rustic finish pillar, at 4 inches. Long clean burn texted surface. Four colour fragrance pairing to choose from." },
        {"label": "5-inch", "image": IMG["deep-green-5-inch"], "mrp": 899, "sp": 699, "desc": "The Middle height, at 5 inches. Same rustic finish, same 4 colour-fragrance, parings, longer burn than the 4-inch." },
        {"label": "6-inch", "image": IMG["deep-green-6-inch"], "mrp": 999, "sp": 799, "desc": " The tallest at 6-inches. Statement height for a mantel, or bath, same finish same four pairings" },
        {"label": "Pack of 3", "image": IMG["deep-green-pack"], "mrp": 2299, "sp": 1699, "desc": " the full pillar set: 4-inch, 5-inch and 6-inch pillars in one colour–fragrance pairing. Meant to be arranged together – the height variation is the point." },
     ],
    },


    {"id": "pillar-sea-and-sand", "category": "pillar", "collection": "Pillar", "name": "Pillar Candle · Sea and Sand",
     "fragrances": ["Aqua"], "mrp": 799, "sp": 599,
     "images": [IMG["sea-and-sand-4-inch"]],
     "sizes": [
        {"label": "4-inch", "image": IMG["sea-and-sand-4-inch"], "mrp": 799, "sp": 599, "desc": "Our Shortest rustic finish pillar, at 4 inches. Long clean burn texted surface. Four colour fragrance pairing to choose from." },
        {"label": "5-inch", "image": IMG["sea-and-sand-5-inch"], "mrp": 899, "sp": 699, "desc": "The Middle height, at 5 inches. Same rustic finish, same 4 colour-fragrance, parings, longer burn than the 4-inch." },
        {"label": "6-inch", "image": IMG["sea-and-sand-6-inch"], "mrp": 999, "sp": 799, "desc": " The tallest at 6-inches. Statement height for a mantel, or bath, same finish same four pairings" },
        {"label": "Pack of 3", "image": IMG["sea-and-sand-pack"], "mrp": 2299, "sp": 1699, "desc": " the full pillar set: 4-inch, 5-inch and 6-inch pillars in one colour–fragrance pairing. Meant to be arranged together – the height variation is the point." },
     ],
    },


    {"id": "pillar-terracotta", "category": "pillar", "collection": "Pillar", "name": "Pillar Candle · Terracotta",
     "fragrances": ["Patchouli"], "mrp": 799, "sp": 599,
     "images": [IMG["terracotta-4-inch"]],
     "sizes": [
        {"label": "4-inch", "image": IMG["terracotta-4-inch"], "mrp": 799, "sp": 599},
        {"label": "5-inch", "image": IMG["terracotta-5-inch"], "mrp": 899, "sp": 699},
        {"label": "6-inch", "image": IMG["terracotta-6-inch"], "mrp": 999, "sp": 799},
        {"label": "Pack of 3", "image": IMG["terracotta-pack"], "mrp": 2299, "sp": 1699},
     ],
    },





    # {"id": "pillar-deep-green", "category": "pillar", "collection": "Pillar", "name": "Pillar Candle · Deep Green",
    #  "fragrances": ["Oudh", "Spearmint", "Patchouli", "Aqua"], "mrp": 899, "sp": 699,
    #  "images": [IMG["green"]],
    #  "variants": [
    #     {"label": "4-inch", "image": IMG["midnight"]},
    #     {"label": "5-inch", "image": IMG["green"]},
    #     {"label": "6-inch", "image": IMG["terracotta"]},
    #     {"label": "Pack of 3", "image": IMG["seasand"]},
    #  ],
    #  "desc": "Rustic-finish 5-inch pillar. Choose your colour and fragrance.",
    #  "long_desc": "The middle height, at 5 inches. Same rustic finish, same four colour-fragrance pairings, longer burn than the 4-inch."},
    # {"id": "pillar-6in", "category": "pillar", "collection": "Pillar", "name": "Pillar Candle · Terracotta",
    #  "fragrances": ["Oudh", "Spearmint", "Patchouli", "Aqua"], "mrp": 999, "sp": 799,
    #  "images": [IMG["terracotta"]],
    #  "variants": [

    #     {"label": "4-inch", "image": IMG["midnight"]},
    #     {"label": "5-inch", "image": IMG["green"]},
    #     {"label": "6-inch", "image": IMG["terracotta"]},
    #     {"label": "Pack of 3", "image": IMG["seasand"]},
    #  ],
    #  "desc": "Rustic-finish 6-inch pillar. Choose your colour and fragrance.",
    #  "long_desc": "The tallest, at 6 inches. Statement height for a mantel, table or bath — same finish, same four pairings."},
    #  {"id": "pillar-6in", "category": "pillar", "collection": "Pillar", "name": "Pillar Candle · Terracotta",
    #  "fragrances": ["Oudh", "Spearmint", "Patchouli", "Aqua"], "mrp": 999, "sp": 799,
    #  "images": [IMG["terracotta"]],
    #  "variants": [
    #     {"label": "4-inch", "image": IMG["midnight"]},
    #     {"label": "5-inch", "image": IMG["green"]},
    #     {"label": "6-inch", "image": IMG["terracotta"]},
    #     {"label": "Pack of 3", "image": IMG["seasand"]},
    #  ],
    #  "desc": "Rustic-finish 6-inch pillar. Choose your colour and fragrance.",
    #  "long_desc": "The tallest, at 6 inches. Statement height for a mantel, table or bath — same finish, same four pairings."},

    # {"id": "pillar-pack3", "category": "pillar", "collection": "Pillar", "name": "Pillar · Pack of 3 (4·5·6-inch)",
    #  "fragrances": ["Oudh", "Spearmint", "Patchouli", "Aqua"], "mrp": 2299, "sp": 1699,
    #  "images": [IMG["seasand"]],
    #  "variants": [
    #     {"label": "Midnight Blue · Oudh", "image": IMG["midnight"]},
    #     {"label": "Deep Green · Spearmint", "image": IMG["green"]},
    #     {"label": "Terracotta · Patchouli", "image": IMG["terracotta"]},
    #     {"label": "Sea & Sand · Aqua", "image": IMG["seasand"]},
    #  ],
    #  "desc": "All three heights — 4, 5 and 6 inches — in your chosen colour.",
    #  "long_desc": "The full pillar set: 4-inch, 5-inch and 6-inch pillars in one colour-fragrance pairing. Meant to be arranged together — the height variation is the point."},

    # ============ TAPER ============
    {"id": "taper-set-1", "category": "taper", "collection": "Taper", "name": "Orbis Taper · Set of 3",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "mrp": 999, "sp": 799,
     "images": [IMG["orbis"]],
     "desc": "Three sculptural tapers, in Mulberry, Oudh and Basil.",
     "long_desc": "A set of three sculptural taper candles — one Mulberry, one Oudh, one Basil. Meant to be lit together at dinner or displayed unlit as an object."},
    {"id": "taper-set-2", "category": "taper", "collection": "Taper", "name": "Obelisk Taper · Set of 3",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "mrp": 999, "sp": 799,
     "images": [IMG["obelisk"]],
     "desc": "Three sculptural tapers, in Mulberry, Oudh and Basil.",
     "long_desc": "A set of three sculptural taper candles — one Mulberry, one Oudh, one Basil. Meant to be lit together at dinner or displayed unlit as an object."},
    {"id": "taper-set-3", "category": "taper", "collection": "Taper", "name": "Confluence Taper · Set of 3",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "mrp": 999, "sp": 799,
     "images": [IMG["confluence"]],
     "desc": "Three sculptural tapers, in Mulberry, Oudh and Basil.",
     "long_desc": "A set of three sculptural taper candles — one Mulberry, one Oudh, one Basil. Meant to be lit together at dinner or displayed unlit as an object."},
    {"id": "taper-set-4", "category": "taper", "collection": "Taper", "name": "Stria Taper · Set of 3",
     "fragrances": ["Mulberry", "Oudh", "Basil"], "mrp": 999, "sp": 799,
     "images": [IMG["stria"]],
     "desc": "Three sculptural tapers, in Mulberry, Oudh and Basil.",
     "long_desc": "A set of three sculptural taper candles — one Mulberry, one Oudh, one Basil. Meant to be lit together at dinner or displayed unlit as an object."},




    # ============ WAX BARS ============
    {"id": "wax-set1", "category": "wax", "collection": "Wax Bars", "name": "Wax Bars · Set of 2",
     "fragrances": ["Clove", "Cinnamon"], "mrp": 799, "sp": 599,
     "images": [IMG["wax_clove"]],
     "desc": "Two handcrafted wax melt bars — Clove × Cinnamon.",
     "long_desc": "Two handcrafted wax melt bars in one set: Clove × Cinnamon for warm evenings."},

    {"id": "wax-set2", "category": "wax", "collection": "Wax Bars", "name": "Wax Bars · Set of 2",
     "fragrances": ["Rose", "Jasmine"], "mrp": 799, "sp": 599,
     "images": [IMG["wax_rose"]],
     "desc": "Two handcrafted wax melt bars — Rose × Jasmine.",
     "long_desc": "Two handcrafted wax melt bars in one set: Rose × Jasmine for lighter, floral moods. Break, warm and diffuse."},

    # ============ AROMA STONES (own category) ============
    {"id": "aroma-stone-jar", "category": "aroma-stones", "collection": "Aroma Stones",
     "name": "Aroma Stones · Jar with 15cc Oil", "fragrances": [],
     "mrp": 1799, "sp": 1299, "images": [IMG["stone_jar"]],
     "desc": "Small lava pebbles in a frosted amber jar with a 15cc signature aroma oil.",
     "long_desc": "A frosted amber jar of small lava pebbles paired with a 15cc bottle of Vanalume aroma oil. Dose the pebbles, close the jar, and let the fragrance release slowly over the week."},

    {"id": "aroma-sculpture", "category": "aroma-stones", "collection": "Aroma Stones",
     "name": "Aroma Sculpture with Dish", "fragrances": [],
     "mrp": 5999, "sp": 4999, "images": [IMG["stone_rock"]],
     "desc": "A sculptural lava rock centrepiece mounted on a ceramic dish.",
     "long_desc": "A statement lava rock, mounted on a hand-thrown ceramic dish. Add a few drops of Vanalume aroma oil directly to the stone — the rock diffuses slowly and quietly, all day."},

    # ============ AROMA OILS (own category) ============
    {"id": "aroma-oil-set5", "category": "aroma-oils", "collection": "Aroma Oils",
     "name": "Aroma Oil · 30cc Set of 5", "fragrances": ["Zephyr", "Cascade", "Aether", "Ember", "Terra"],
     "mrp": 1299, "sp": 999, "images": [IMG["oils"]],
     "desc": "A set of five 30cc signature aroma oils, inspired by the five elements.",
     "long_desc": "Five 30cc signature aroma oils, each named after an element — Zephyr (air), Cascade (water), Aether (space), Ember (fire), Terra (earth). Use with any Vanalume aroma stone or diffuser."},
]


CATEGORIES = [
    {
        "id": "jar-candles",
        "title": "Jar Candles",
        "tagline": "Every fragrance we make, cast in glass or metal.",
        "subcategories": [
            {"id": "duet", "title": "Duet Collection", "tagline": "Two fragrances, one ritual."},
            {"id": "single", "title": "Individual Candles", "tagline": "Every Duet fragrance available on its own."},
            {"id": "ensemble-tin", "title": "Ensemble · Tin", "tagline": "Three curated fragrances in the signature tin."},
            {"id": "ensemble-metal", "title": "Ensemble · Shimmer Jar", "tagline": "Three curated fragrances in a premium 220cc metallic jar."},
            {"id": "library", "title": "Perfumer's Library", "tagline": "Six fragrances. The complete discovery experience."},
            {"id": "concrete-jar", "title": "Concrete Jars", "tagline": "Coming soon."},
        ],
    },
    {"id": "aroma-stones", "title": "Aroma Stones", "tagline": "Objects for a quiet, sensory home."},
    {"id": "aroma-oils", "title": "Aroma Oils", "tagline": "Signature oils, inspired by the five elements."},
    {"id": "pillar", "title": "Pillar Candles", "tagline": "Rustic-finish pillars in three heights, or as a set of three."},
    {"id": "taper", "title": "Taper Candles", "tagline": "Sculptural tapers, in a set of three."},
    {"id": "wax", "title": "Wax Bars", "tagline": "Handcrafted wax melts, in a set of two."},
]


# ---------- Seed helper (runs once at startup) ----------
async def seed_catalog(db) -> None:
    """Replace the catalogue in MongoDB with the canonical seed data.

    Flushes existing products/categories first, then inserts PRODUCTS /
    CATEGORIES from this module so the DB always mirrors the seed lists on
    startup.
    """
    await db.products.delete_many({})
    await db.categories.delete_many({})

    products = [Product(**p).model_dump() for p in PRODUCTS]
    categories = [Category(**c).model_dump() for c in CATEGORIES]

    if products:
        await db.products.insert_many(products)
    if categories:
        await db.categories.insert_many(categories)
