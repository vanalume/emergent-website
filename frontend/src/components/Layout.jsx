import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollRestoration from "@/components/ScrollRestoration";
import useTypography from "@/hooks/useTypography";

export default function Layout() {
  const { pathname, key } = useLocation();
  useTypography();

  // The app owns scroll restoration (see ScrollRestoration); stop the browser
  // from also restoring on back/forward and fighting us.
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const l = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    window.__lenis = l;
    let raf;
    const loop = (time) => { l.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); l.destroy(); window.__lenis = null; };
  }, []);

  return (
    <div className="vl-grain relative min-h-screen bg-[#f8f6f2] text-[#2b2823]">
      <Navbar />
      {/* Re-keyed per navigation (location.key, not pathname) so a same-path
          navbar click remounts the page and its reset takes effect. */}
      <AnimatePresence mode="wait">
        <motion.main
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <ScrollRestoration />
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <CartDrawer />
    </div>
  );
}
