import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePageStateStore } from "@/context/PageStateContext";

/**
 * usePageState — a useState that survives a page's unmount, keyed by route.
 *
 *   const [filters, setFilters] = usePageState({ group: "all", sub: {} });
 *
 * Restore happens during the first render (the initializer reads the store), so
 * the page paints directly in its previous state. Writes are continuous — the
 * store is kept current on every change — which is what lets a reset
 * navigation (which clears the store synchronously *before* the route changes)
 * survive the outgoing page's unmount.
 *
 * Because the routed page is re-keyed by `location.key`, the component always
 * remounts on navigation, so the initializer runs exactly once per visit.
 *
 * Returns [state, setState, restored]. `restored` is true when this arrival
 * reused previously stored state (breadcrumb / back / forward) and false for a
 * cold or reset arrival — useful for suppressing one-shot "deep link" effects
 * (e.g. a #hash scroll) when the view is being restored instead.
 */
export default function usePageState(defaults, options = {}) {
  const { pathname } = useLocation();
  const key = options.key || pathname;
  const store = usePageStateStore();

  const [restored] = useState(() => store.getState(key) !== undefined);
  const [state, setState] = useState(() => {
    const stored = store.getState(key);
    return stored === undefined ? defaults : stored;
  });

  useEffect(() => {
    store.setState(key, state);
  }, [store, key, state]);

  return [state, setState, restored];
}
