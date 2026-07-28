// Static content & imagery for Vanalume (products come from the API; view-only)

export const IMAGES = {
  logo: "/vanalume-logo.png",
  // Warm, non-product ambiance imagery (Duet product photos are used ONLY inside the Shop's Duet section)
  heroWarm: "https://customer-assets-gfyr7b9c.emergentagent.net/job_vanalume-preview/artifacts/jdp4yeyo_ChatGPT%20Image%20Jul%2028%2C%202026%20at%2003_18_50%20PM.png",
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

const A = "https://customer-assets-gfyr7b9c.emergentagent.net/job_vanalume-preview/artifacts";

export const FOUNDERS = [
  {
    name: "Nishant Sharma",
    role: "Co-Founder",
    img: `${A}/ndkrjhiv_nishant.PNG`,
    bio: "Vanalume began as more than a candle brand — it began as an idea to create moments people could truly feel. A Business Management student at Shiv Nadar University, a competitive cricketer, and a trained musician, Nishant draws inspiration from the balance between performance and creativity. Whether on the cricket field, behind the tabla, or building a brand from the ground up, his journey has always been guided by patience, precision, and purpose. Vanalume is an extension of that philosophy: thoughtfully crafted products inspired by nature and designed for conscious living.",
  },
  {
    name: "Dr. Alok Sharma",
    role: "Co-Founder",
    img: `${A}/s5gjf4zw_alok.PNG`,
    bio: "Vanalume is an expression of thoughtful precision for Dr. Alok Sharma — the belief that everyday objects, made well, can bring lasting warmth into ordinary moments. He sees the spaces we build and the choices we make as quiet reflections of how we choose to live. An eminent renal pathologist–researcher and lifelong maker at heart, he brings together scientific rigor, creative instinct, and genuine respect for good craftsmanship. Through Vanalume, he sets out to create pieces built to last — designed to bring presence, comfort, and simple joy into daily life, turning routine moments into ones worth noticing.",
  },
  {
    name: "Dr. Bharati Malhotra",
    role: "Co-Founder",
    img: `${A}/8z71o6x2_bharati.PNG`,
    bio: "For Dr. Bharati Malhotra, Vanalume is an expression of composed living — the art of slowing down, living intentionally, and discovering beauty in everyday rituals. She believes the spaces we create and the objects we choose quietly shape how we feel, connect, and experience life. A senior radiologist and lifelong artist, she brings together precision, creativity, and a deep appreciation for thoughtful craftsmanship. Through Vanalume, she seeks to create timeless pieces that invite moments of presence, warmth, and quiet joy, transforming the everyday into something meaningful.",
  },
];

export const BUSINESS_ENQUIRIES = [
  "Wholesale", "Corporate Gifting", "Hospitality",
  "Interior Designers", "Retail Partnerships", "Custom Fragrance Projects",
];
