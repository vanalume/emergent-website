import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import { IMAGES } from "@/lib/data";
import { useCart } from "@/context/CartContext";

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
  const { count, setOpen: setCartOpen } = useCart();

  const dark = pathname === "/" && !scrolled; // hero is dark → light text at top of home

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
        scrolled ? "bg-[#f8f6f2]/85 backdrop-blur-xl border-b border-[#2b2823]/10" : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 shrink-0">
          <img src={IMAGES.logo} alt="Vanalume" className={`h-6 md:h-7 w-auto object-contain transition-[filter] duration-500 ${dark ? "invert" : ""}`} />
        </Link>

        <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
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
        </div>

        <div className="flex items-center gap-4">
          <button
            data-testid="nav-cart-btn"
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className={`relative p-2 transition-colors duration-300 ${textCol}`}
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {count > 0 && (
              <span data-testid="nav-cart-count" className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[#395439] text-[#f8f6f2] text-[10px] flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          <button data-testid="nav-mobile-toggle" onClick={() => setOpen((v) => !v)} className={`lg:hidden p-2 ${textCol}`} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden bg-[#f8f6f2]/97 backdrop-blur-xl border-b border-[#2b2823]/10"
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
