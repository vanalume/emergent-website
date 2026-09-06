import { useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * useContent — fetch a CMS page's sections and expose a `value(key, fallback)`
 * helper that returns the stored value, falling back to the hardcoded default
 * when the API is unreachable or a key is missing (the site never renders blank).
 */
export default function useContent(slug) {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${API}/content/pages/${slug}`)
      .then((r) => { if (mounted) setSections(r.data?.sections || []); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [slug]);

  const value = (key, fallback) => {
    const s = sections.find((x) => x.key === key);
    if (!s) return fallback;
    return s.value === undefined || s.value === null ? fallback : s.value;
  };

  return { value };
}
