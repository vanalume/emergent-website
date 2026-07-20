import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { IMAGES } from "@/lib/data";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/philosophy", label: "Our Philosophy" },
  { to: "/founders", label: "Founder Story" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled
          ? "bg-[#f8f6f2]/80 backdrop-blur-xl border-b border-[#2b2823]/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 shrink-0">
          <img src={IMAGES.logo} alt="Vanalume" className="h-6 md:h-7 w-auto object-contain" />
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={`vl-link-underline text-sm tracking-wide transition-colors duration-300 ${
                pathname === l.to ? "text-[#2b2823]" : "text-[#2b2823]/70 hover:text-[#2b2823]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:block">
          <Link
            to="/collections"
            data-testid="nav-explore-btn"
            className="inline-block border border-[#2b2823] text-[#2b2823] text-sm tracking-wide px-7 py-3 rounded-full hover:bg-[#2b2823] hover:text-[#f8f6f2] transition-colors duration-300"
          >
            Explore Collections
          </Link>
        </div>

        <button
          data-testid="nav-mobile-toggle"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden text-[#2b2823] p-2"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden bg-[#f8f6f2]/95 backdrop-blur-xl border-b border-[#2b2823]/10"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  data-testid={`nav-mobile-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="font-serif text-3xl text-[#2b2823]"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/collections"
                className="mt-2 inline-block text-center border border-[#2b2823] text-[#2b2823] px-7 py-3 rounded-full"
              >
                Explore Collections
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
