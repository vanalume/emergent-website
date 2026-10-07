import { createContext, useCallback, useContext, useMemo, useRef } from "react";

const PageStateContext = createContext(null);

/**
 * PageStateProvider — an in-memory store of per-route UI state.
 *
 * Pages can persist their own meaningful state (selected filters, chosen
 * variant, image index, ...) and the window's scroll offset, keyed by the
 * route's pathname. Navigating back to a route restores the stored state; a
 * "reset" navigation — the navbar, CTAs (see <ResetLink />) — clears the
 * destination first, so it opens at its defaults instead.
 *
 * The maps live in a ref (not React state) on purpose: they must be read
 * synchronously during a page's first render and written without re-rendering
 * the whole tree.
 */
export function PageStateProvider({ children }) {
  const statesRef = useRef(new Map());
  const scrollRef = useRef(new Map());

  const getState = useCallback((key) => statesRef.current.get(key), []);
  const setState = useCallback((key, value) => { statesRef.current.set(key, value); }, []);
  const getScroll = useCallback((key) => scrollRef.current.get(key), []);
  const setScroll = useCallback((key, value) => { scrollRef.current.set(key, value); }, []);

  /** Forget a route's stored state and scroll offset (used by reset navigations). */
  const clear = useCallback((key) => {
    statesRef.current.delete(key);
    scrollRef.current.delete(key);
    // Also drop scoped keys (e.g. "/shop::categories") so reset navigations
    // clear sub-state such as a carousel's horizontal offset.
    const prefix = `${key}::`;
    for (const k of statesRef.current.keys()) if (k.startsWith(prefix)) statesRef.current.delete(k);
    for (const k of scrollRef.current.keys()) if (k.startsWith(prefix)) scrollRef.current.delete(k);
  }, []);

  const value = useMemo(
    () => ({ getState, setState, getScroll, setScroll, clear }),
    [getState, setState, getScroll, setScroll, clear],
  );

  return <PageStateContext.Provider value={value}>{children}</PageStateContext.Provider>;
}

export function usePageStateStore() {
  const ctx = useContext(PageStateContext);
  if (!ctx) throw new Error("usePageStateStore must be used within PageStateProvider");
  return ctx;
}
