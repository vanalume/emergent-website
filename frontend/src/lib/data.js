// Static content & imagery for Vanalume (products/prices come from the API)

const JAR = "https://customer-assets-gfyr7b9c.emergentagent.net/job_vanalume-preview/artifacts";

export const IMAGES = {
  logo: "https://customer-assets-agu9un31.emergentagent.net/job_2aa27605-9461-4082-9598-7b1b5e9d28b0/artifacts/6ei6hoc0_Logo%20temp.PNG",
  heroAwaken: `${JAR}/l6poykvu_awaken%20green%20ai.png`,
  heroBloom: `${JAR}/nmlr0dbl_bloom%20red%20ai.png`,
  heroClarity: `${JAR}/hmke92zk_clarity%20blue%20ai.png`,
  heroEquilibrium: `${JAR}/v2hkyxvu_equilibrium%20orange%20ai.png`,
  heroIntimacy: `${JAR}/94fayxk6_intimacy%20purple%20ai.png`,
  philosophyNature: "https://images.unsplash.com/photo-1594048023785-02c76ee32c10?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  aromaStones: "https://images.pexels.com/photos/7814959/pexels-photo-7814959.jpeg?auto=compress&cs=tinysrgb&w=1200",
  rituals: "https://images.pexels.com/photos/3965508/pexels-photo-3965508.jpeg?auto=compress&cs=tinysrgb&w=1200",
  founder1: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
  founder2: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
  founder3: "https://images.pexels.com/photos/29995581/pexels-photo-29995581.jpeg?auto=compress&cs=tinysrgb&w=800",
};

export const FRAGRANCES = [
  "Lavender", "Sandalwood", "Turkish Coffee", "Mulberry", "Tea Tree",
  "Cedarwood", "Black Oudh", "Mogra", "Jasmine", "Rose", "White Sage", "Musk",
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
  "Wholesale", "Corporate Gifting", "Hospitality",
  "Interior Designers", "Retail Partnerships", "Custom Fragrance Projects",
];

export const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
