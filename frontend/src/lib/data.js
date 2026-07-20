// Central content data for Vanalume

export const IMAGES = {
  logo: "https://customer-assets-agu9un31.emergentagent.net/job_2aa27605-9461-4082-9598-7b1b5e9d28b0/artifacts/6ei6hoc0_Logo%20temp.PNG",
  hero: "https://images.unsplash.com/photo-1648475237029-7f853809ca14?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwzfHxlbGVnYW50JTIwbWluaW1hbCUyMGludGVyaW9yJTIwaG9tZXxlbnwwfHx8fDE3ODQ1NzQ5MTF8MA&ixlib=rb-4.1.0&q=85",
  candles: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHw0fHxhZXN0aGV0aWMlMjBjYW5kbGUlMjBsdXh1cnl8ZW58MHx8fHwxNzg0NTc0OTExfDA&ixlib=rb-4.1.0&q=85",
  aromaStones: "https://images.pexels.com/photos/7814959/pexels-photo-7814959.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  essentialOils: "https://images.pexels.com/photos/7795817/pexels-photo-7795817.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  homeRituals: "https://images.pexels.com/photos/3965508/pexels-photo-3965508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  philosophyNature: "https://images.unsplash.com/photo-1594048023785-02c76ee32c10?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwyfHxjYWxtaW5nJTIwbmF0dXJlJTIwZm9yZXN0fGVufDB8fHx8MTc4NDU3NDkxMXww&ixlib=rb-4.1.0&q=85",
  founder1: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxmb3VuZGVyJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzg0NTc0OTExfDA&ixlib=rb-4.1.0&q=85",
  founder2: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxmb3VuZGVyJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzg0NTc0OTExfDA&ixlib=rb-4.1.0&q=85",
  founder3: "https://images.pexels.com/photos/29995581/pexels-photo-29995581.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  productFeature: "https://images.pexels.com/photos/30123011/pexels-photo-30123011.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

export const FRAGRANCES = [
  "Lavender",
  "Sandalwood",
  "Turkish Coffee",
  "Mulberry",
  "Tea Tree",
  "Cedarwood",
  "Black Oudh",
  "Mogra",
];

export const OUR_WORLD = [
  { title: "Candles", desc: "Hand-poured, slow-burning.", img: IMAGES.candles, span: "lg:col-span-2 lg:row-span-2" },
  { title: "Aroma Stones", desc: "Fragrance as sculpture.", img: IMAGES.aromaStones, span: "" },
  { title: "Home Rituals", desc: "Objects for daily calm.", img: IMAGES.homeRituals, span: "" },
  { title: "Future Collections", desc: "Chapters yet to come.", img: IMAGES.philosophyNature, span: "lg:col-span-2" },
];

export const WHY = [
  { n: "01", title: "Crafted with premium ingredients", desc: "Considered materials, natural waxes and fragrance oils selected for depth, cleanliness and longevity." },
  { n: "02", title: "Thoughtfully designed collections", desc: "Every object is designed to be lived with — a quiet presence that elevates the everyday." },
  { n: "03", title: "Made for meaningful living", desc: "Not trends. Timeless pieces that become part of the rituals you return to." },
];

export const COLLECTIONS = [
  {
    id: "aroma-candles",
    kicker: "01 — Gifting",
    title: "Aroma Candles",
    intro: "Premium scented candles presented in curated gifting formats, each with a ritual card.",
    image: IMAGES.candles,
    items: [
      { name: "Duet Collection", meta: "2 fragrances · Magnetic gift box", desc: "A premium magnetic gift box pairing two complementary fragrances, with a ritual card included." },
      { name: "Ensemble Collection", meta: "3 fragrances · Premium gift box", desc: "Three carefully curated fragrances presented together, with a ritual card." },
      { name: "Perfumer's Library", meta: "6 fragrances · Discovery set", desc: "The complete fragrance discovery experience — six candles, one ritual card." },
    ],
  },
  {
    id: "pillar-candles",
    kicker: "02 — Décor",
    title: "Pillar Candles",
    intro: "Three sculptural colourways, each available in three heights.",
    image: IMAGES.productFeature,
    items: [
      { name: "Rustic Blue", meta: "4\" · 5\" · 6\"", desc: "A deep, grounding blue with a hand-finished rustic texture." },
      { name: "Rustic Green", meta: "4\" · 5\" · 6\"", desc: "Forest-toned and earthy — a natural centre for any surface." },
      { name: "Sand Sea", meta: "4\" · 5\" · 6\"", desc: "Warm sand tones inspired by soft morning light." },
    ],
  },
  {
    id: "taper-candles",
    kicker: "03 — Décor",
    title: "Taper Candles",
    intro: "Architectural tapers in three silhouettes. Fragrances: Mulberry, Oudh, Basil.",
    image: IMAGES.homeRituals,
    items: [
      { name: "Dual Colour", meta: "35 cm", desc: "An elongated two-tone taper. Mulberry · Oudh · Basil." },
      { name: "Trapezium", meta: "25 cm", desc: "A faceted, sculptural profile. Mulberry · Oudh · Basil." },
      { name: "Groove", meta: "25 cm", desc: "Fluted and tactile, catching the light. Mulberry · Oudh · Basil." },
    ],
  },
  {
    id: "aroma-stones",
    kicker: "04 — Objects",
    title: "Aroma Stones",
    intro: "Luxury aroma stones designed to gently diffuse fragrance while becoming timeless decorative objects.",
    image: IMAGES.aromaStones,
    items: [
      { name: "Small Pebbles", meta: "Diffusing set", desc: "Petite lava pebbles that carry fragrance quietly across a room." },
      { name: "Large Decorative Artifacts", meta: "Includes aroma bottle", desc: "Sculptural centrepieces — every large artifact includes an aroma bottle." },
    ],
  },
  {
    id: "wax-bars",
    kicker: "05 — Rituals",
    title: "Wax Bars",
    intro: "Beautifully handcrafted wax melts for modern fragrance rituals.",
    image: IMAGES.essentialOils,
    items: [
      { name: "Clove × Cinnamon", meta: "Wax melt blend", desc: "Warm, spiced and enveloping — a blend for slower evenings." },
      { name: "Rose × Jasmine", meta: "Wax melt blend", desc: "Soft florals balanced with restraint. Never sweet, always composed." },
    ],
  },
  {
    id: "aroma-oils",
    kicker: "06 — Objects",
    title: "Aroma Oils",
    intro: "Signature aroma oils, designed for the Aroma Stones collection.",
    image: IMAGES.essentialOils,
    items: [
      { name: "15 cc", meta: "6 fragrances", desc: "A considered format for smaller spaces and travel." },
      { name: "30 cc", meta: "6 fragrances", desc: "The full pour, for the rooms you live in most." },
    ],
  },
];

export const SENSES = [
  { key: "Touch", desc: "The texture of handcrafted aroma stones.", icon: "Hand" },
  { key: "Smell", desc: "Our signature candles and fragrances.", icon: "Flower2" },
  { key: "Sight", desc: "Objects and designs that elevate everyday spaces.", icon: "Eye" },
  { key: "Taste", desc: "Future tea rituals inspired by nature.", icon: "Leaf" },
  { key: "Sound", desc: "Curated ritual playlists designed to accompany moments of calm.", icon: "AudioLines" },
];

export const FOUNDERS = [
  { name: "Nishant Sharma", role: "Founder", img: IMAGES.founder1 },
  { name: "Alok Sharma", role: "Co-Founder", img: IMAGES.founder2 },
  { name: "Bharati Malhotra", role: "Co-Founder", img: IMAGES.founder3 },
];

export const BUSINESS_ENQUIRIES = [
  "Wholesale",
  "Corporate Gifting",
  "Hospitality",
  "Interior Designers",
  "Retail Partnerships",
  "Custom Fragrance Projects",
];
