import { useEffect } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * useTypography — fetch the typography tokens once and inject them as CSS custom
 * properties, overriding the built-in defaults in index.css. Safe to call from a
 * single top-level component; on failure the defaults keep rendering.
 */
export default function useTypography() {
  useEffect(() => {
    let styleEl = null;
    axios
      .get(`${API}/typography`)
      .then((r) => {
        const tokens = r.data?.tokens || [];
        const breakpoints = r.data?.breakpoints || [{ key: "mobile" }, { key: "desktop" }];
        const rules = [];
        for (const t of tokens) {
          for (const bp of breakpoints) {
            const size = t.sizes?.[bp.key];
            if (size) rules.push(`--fs-${t.key}-${bp.key}: ${size};`);
          }
        }
        if (rules.length) {
          styleEl = document.createElement("style");
          styleEl.setAttribute("data-vanalume-typography", "true");
          styleEl.textContent = `:root { ${rules.join(" ")} }`;
          document.head.appendChild(styleEl);
        }
      })
      .catch(() => {});
    return () => {
      styleEl?.remove();
    };
  }, []);
}
