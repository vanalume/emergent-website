import { Children, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePageStateStore } from "@/context/PageStateContext";

/**
 * ScrollCarousel — a horizontal, snapping rail with prev/next arrows.
 *
 * Items are passed as children and carry their own width classes. The rail
 * scrolls a page at a time (the track's client width) and hides an arrow when
 * there is nothing left to scroll that way.
 *
 * `restoreKey` (optional) persists the rail's scroll offset in the page-state
 * store so a later visit can restore it; `resetKey` (optional) scrolls back to
 * the start whenever it changes.
 */
export default function ScrollCarousel({
  children,
  itemCount,
  resetKey,
  restoreKey,
  className = "",
  trackClassName = "",
  arrowClassName = "",
  prevLabel = "Scroll left",
  nextLabel = "Scroll right",
  prevTestId,
  nextTestId,
}) {
  const count = itemCount ?? Children.count(children);
  const trackRef = useRef(null);
  const store = usePageStateStore();
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;

    if (restoreKey) {
      const saved = store.getState(restoreKey);
      el.scrollLeft = typeof saved === "number" ? saved : 0;
    } else {
      el.scrollLeft = 0;
    }

    const measure = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    const onScroll = () => {
      measure();
      if (restoreKey) store.setState(restoreKey, el.scrollLeft);
    };

    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [count, resetKey, restoreKey, store]);

  const scrollByPage = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const arrowCls = (side, visible) =>
    `absolute top-[38%] -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-[#f8f6f2] border border-[#2b2320]/15 text-[#2b2320] shadow-md flex items-center justify-center transition-all duration-300 hover:bg-[#2b2320] hover:text-[#f8f6f2] ${
      side === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
    } ${visible ? "opacity-100" : "opacity-0 pointer-events-none"} ${arrowClassName}`;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        disabled={!canLeft}
        aria-label={prevLabel}
        data-testid={prevTestId}
        className={arrowCls("left", canLeft)}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        disabled={!canRight}
        aria-label={nextLabel}
        data-testid={nextTestId}
        className={arrowCls("right", canRight)}
      >
        <ChevronRight size={18} />
      </button>

      <div
        ref={trackRef}
        className={`flex overflow-x-auto snap-x snap-mandatory scroll-smooth vl-hide-scrollbar ${trackClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
