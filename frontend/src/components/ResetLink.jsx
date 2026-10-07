import { Link } from "react-router-dom";
import { usePageStateStore } from "@/context/PageStateContext";

/** Reduce a `to` (string or location descriptor) to the route key we store under. */
function targetPath(to) {
  if (typeof to === "string") return to.split("#")[0].split("?")[0];
  return to?.pathname || "";
}

/**
 * ResetLink — a <Link> that forgets the destination route's stored page state
 * and scroll offset before navigating, so the destination opens at its
 * defaults instead of restoring.
 *
 * Used by the navbar and CTAs. Ordinary <Link>s (breadcrumbs, product cards,
 * browser back/forward) restore instead.
 */
export default function ResetLink({ to, onClick, ...props }) {
  const store = usePageStateStore();

  const handleClick = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // Modifier clicks and non-primary buttons open a new tab/window and don't
    // navigate this tab — don't clear state the current tab still needs.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const path = targetPath(to);
    if (path) store.clear(path);
  };

  return <Link to={to} onClick={handleClick} {...props} />;
}
