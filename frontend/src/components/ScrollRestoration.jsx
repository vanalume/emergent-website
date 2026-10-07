import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePageStateStore } from "@/context/PageStateContext";
import { restoreScroll } from "@/lib/scroll";

/**
 * ScrollRestoration — rendered inside the keyed route wrapper, so it mounts
 * fresh on every navigation (including same-path ones).
 *
 * While mounted it keeps the current route's scroll offset up to date in the
 * page-state store; on arrival it either restores the saved offset or — when a
 * reset navigation cleared the store — returns the viewport to the top.
 */
export default function ScrollRestoration() {
  const { pathname } = useLocation();
  const store = usePageStateStore();

  // Read the destination offset once, during render, so React StrictMode's
  // double-invoked effects can't overwrite it through the scroll listener.
  const [savedScroll] = useState(() => store.getScroll(pathname) ?? 0);

  useEffect(() => {
    const cancel = restoreScroll(savedScroll);
    const save = () => store.setScroll(pathname, window.scrollY);
    // If the visitor starts scrolling themselves, stop chasing the restore.
    const yieldToUser = () => cancel();
    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("wheel", yieldToUser, { passive: true, once: true });
    window.addEventListener("touchstart", yieldToUser, { passive: true, once: true });
    window.addEventListener("keydown", yieldToUser, { once: true });
    return () => {
      cancel();
      window.removeEventListener("scroll", save);
      window.removeEventListener("wheel", yieldToUser);
      window.removeEventListener("touchstart", yieldToUser);
      window.removeEventListener("keydown", yieldToUser);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
