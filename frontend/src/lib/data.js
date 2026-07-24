// Static content & imagery for Vanalume (products come from the API; view-only)

export const IMAGES = {
  logo: "/vanalume-logo.png",
  // Warm, non-product ambiance imagery (Duet product photos are used ONLY inside the Shop's Duet section)
  heroWarm: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  rituals: "https://images.pexels.com/photos/3965508/pexels-photo-3965508.jpeg?auto=compress&cs=tinysrgb&w=1400",
  aromaStones: "https://images.pexels.com/photos/7814959/pexels-photo-7814959.jpeg?auto=compress&cs=tinysrgb&w=1400",
  warmInterior: "https://images.pexels.com/photos/6957095/pexels-photo-6957095.jpeg?auto=compress&cs=tinysrgb&w=1400",
  philosophyNature: "https://images.unsplash.com/photo-1594048023785-02c76ee32c10?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  founder1: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
  founder2: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
  founder3: "https://images.pexels.com/photos/29995581/pexels-photo-29995581.jpeg?auto=compress&cs=tinysrgb&w=800",
};

export const FRAGRANCES = [
  "Lavender", "Sandalwood", "Turkish Coffee", "Mulberry", "Tea Tree",
  "Cedarwood", "Black Oudh", "Mogra", "Jasmine", "Rose", "White Sage", "Musk",
];

export const SENSES = [
  { key: "Smell", desc: "Our signature candles and fragrances.", icon: "Flower2" },
  { key: "Sight", desc: "Objects and designs that elevate everyday spaces.", icon: "Eye" },
  { key: "Touch", desc: "The texture of handcrafted aroma stones.", icon: "Hand" },
  { key: "Sound", desc: "Curated ritual playlists designed to accompany moments of calm.", icon: "AudioLines" },
  { key: "Taste", desc: "Future tea rituals inspired by nature.", icon: "Leaf" },
];

export const FOUNDERS = [
  { name: "Nishant Sharma", role: "Founder", img: IMAGES.founder1 },
  { name: "Alok Sharma", role: "Co-Founder", img: IMAGES.founder2 },
  { name: "Bharati Malhotra", role: "Co-Founder", img: IMAGES.founder3 },
];

export const BUSINESS_ENQUIRIES = [
  "Wholesale", "Corporate Gifting", "Hospitality",
  "Interior Designers", "Retail Partnerships", "Custom Fragrance Projects",
];
