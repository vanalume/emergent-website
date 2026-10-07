/**
 * Scroll helpers that stay compatible with Lenis (exposed as window.__lenis)
 * and fall back to the native scroller when smooth scrolling is disabled.
 */

function setScrollTop(y) {
  const lenis = window.__lenis;
  if (lenis && typeof lenis.scrollTo === "function") lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

/**
 * Restore the window scroll to `target`.
 *
 * Content is often rendered asynchronously (data fetches, images), so the
 * document may not yet be tall enough to reach the offset when the route
 * mounts. We therefore re-attempt across animation frames until the target is
 * reachable, bailing out after `timeout` ms either way.
 *
 * Returns a cancel function.
 */
export function restoreScroll(target, { timeout = 1600 } = {}) {
  if (!target || target <= 0) {
    setScrollTop(0);
    return () => {};
  }

  const start = performance.now();
  let raf = 0;
  let cancelled = false;

  const tick = () => {
    if (cancelled) return;
    const max = Math.max(
      document.documentElement.scrollHeight,
      document.body ? document.body.scrollHeight : 0,
    ) - window.innerHeight;

    if (max >= target - 2) {
      setScrollTop(target);
      if (Math.abs(window.scrollY - target) <= 2) return;
    }
    if (performance.now() - start < timeout) raf = requestAnimationFrame(tick);
    else setScrollTop(target);
  };

  tick();
  return () => { cancelled = true; if (raf) cancelAnimationFrame(raf); };
}
