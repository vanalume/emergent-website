import { useEffect, useRef, useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

function SoftCursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let rx = 0, ry = 0, x = 0, y = 0, raf;
    const move = (e) => { x = e.clientX; y = e.clientY; if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px)`; };
    const loop = () => {
      rx += (x - rx) * 0.12; ry += (y - ry) * 0.12;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    loop();
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="hidden lg:block" aria-hidden>
      <div ref={ring} className="pointer-events-none fixed top-0 left-0 z-[9998] -ml-4 -mt-4 h-8 w-8 rounded-full border border-[#5c3e2b]/40" />
      <div ref={dot} className="pointer-events-none fixed top-0 left-0 z-[9998] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-[#5c3e2b]" />
    </div>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const l = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    setLenis(l);
    let raf;
    const loop = (time) => { l.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); l.destroy(); };
  }, []);

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, lenis]);

  return (
    <div className="vl-grain relative min-h-screen bg-[#f8f6f2] text-[#2b2823]">
      <SoftCursor />
      <Navbar />
      <CartDrawer />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
