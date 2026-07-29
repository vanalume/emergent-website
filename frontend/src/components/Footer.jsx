import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { IMAGES } from "@/lib/data";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${API}/newsletter`, { email });
      toast.success("Welcome to Composed Living.", { description: "You're on the list." });
      setEmail("");
    } catch {
      toast.error("Please enter a valid email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer data-testid="footer" className="bg-[#2b2320] text-[#f8f6f2]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-14">
          <div className="md:col-span-5">
            <img src={IMAGES.logo} alt="Vanalume" className="h-9 w-auto object-contain" style={{ filter: "invert(1)" }} />
            <p className="font-display text-3xl md:text-4xl mt-6 text-[#f8f6f2]/90">Composed Living</p>
            <p className="text-sm text-[#f8f6f2]/55 mt-5 max-w-sm leading-relaxed">
              Fragrances, rituals and thoughtful designs for spaces that feel calm, intentional and beautifully lived in.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs tracking-[0.24em] uppercase text-[#e6b980]">Quick Links</p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                { to: "/shop", label: "Shop" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="vl-link-underline text-[#f8f6f2]/70 hover:text-[#f8f6f2] transition-colors duration-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-5">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-[#f8f6f2]/70 hover:text-[#e6b980] transition-colors"><Instagram size={19} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-[#f8f6f2]/70 hover:text-[#e6b980] transition-colors"><Linkedin size={19} /></a>
              <a href="mailto:hello@vanalume.com" aria-label="Email" className="text-[#f8f6f2]/70 hover:text-[#e6b980] transition-colors"><Mail size={19} /></a>
            </div>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs tracking-[0.24em] uppercase text-[#e6b980]">Newsletter</p>
            <p className="text-sm text-[#f8f6f2]/60 mt-6 leading-relaxed">Slow letters on fragrance, ritual and design. No noise.</p>
            <form onSubmit={subscribe} className="mt-5 flex items-center gap-3 border-b border-[#f8f6f2]/25 focus-within:border-[#e6b980] transition-colors">
              <input
                data-testid="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 bg-transparent py-3 text-sm text-[#f8f6f2] placeholder:text-[#f8f6f2]/35 outline-none"
              />
              <button
                data-testid="newsletter-submit"
                type="submit"
                disabled={loading}
                className="text-xs tracking-[0.2em] uppercase text-[#e6b980] hover:text-[#f8f6f2] transition-colors disabled:opacity-50"
              >
                {loading ? "…" : "Join"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-[#f8f6f2]/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#f8f6f2]/40 tracking-wide">
          <span>© {new Date().getFullYear()} VANALUME</span>
          <span className="tracking-[0.2em] uppercase">Composed Living</span>
        </div>
      </div>
    </footer>
  );
}
