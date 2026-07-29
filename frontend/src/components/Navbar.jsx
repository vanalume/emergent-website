import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { IMAGES } from "@/lib/data";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const dark = pathname === "/" && !scrolled; // over the dark home hero

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const textCol = dark ? "text-[#f8f6f2]" : "text-[#2b2823]";

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled ? "bg-[#f5f1ea]/85 backdrop-blur-xl border-b border-[#5c3e2b]/12" : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-[1440px] mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo" aria-label="Vanalume, Home" className="flex items-center shrink-0">
          <img
            src={IMAGES.logo}
            alt="Vanalume"
            className={`h-8 md:h-10 w-auto object-contain transition-[filter] duration-500 ${dark ? "invert" : ""}`}
          />
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={`vl-link-underline text-sm tracking-wide transition-colors duration-300 ${textCol} ${pathname === l.to ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/shop"
            data-testid="nav-explore-btn"
            className={`inline-block border text-sm tracking-wide px-6 py-2.5 rounded-full transition-colors duration-300 ${
              dark ? "border-[#f8f6f2]/60 text-[#f8f6f2] hover:bg-[#f8f6f2] hover:text-[#2b2823]" : "border-[#5c3e2b] text-[#5c3e2b] hover:bg-[#5c3e2b] hover:text-[#f8f6f2]"
            }`}
          >
            Explore Products
          </Link>
        </div>

        <button data-testid="nav-mobile-toggle" onClick={() => setOpen((v) => !v)} className={`lg:hidden p-2 ${textCol}`} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden bg-[#f5f1ea]/97 backdrop-blur-xl border-b border-[#5c3e2b]/12"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {LINKS.map((l) => (
                <Link key={l.to} to={l.to} data-testid={`nav-mobile-${l.label.toLowerCase().replace(/\s+/g, "-")}`} className="font-display text-3xl text-[#2b2823]">
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
