import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal, MaskLine, Kicker } from "@/components/Motion";
import ProductCard from "@/components/ProductCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Shop() {
  const [data, setData] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("all");

  useEffect(() => {
    axios.get(`${API}/products`).then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const byCategory = useMemo(() => {
    const map = {};
    for (const c of data.categories) map[c.id] = data.products.filter((p) => p.category === c.id);
    return map;
  }, [data]);

  const visibleCats = active === "all" ? data.categories : data.categories.filter((c) => c.id === active);

  const scrollTo = (id) => {
    setActive(id);
    if (id === "all") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setTimeout(() => {
      const el = document.getElementById(`cat-${id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <div data-testid="shop-page">
      <section className="pt-40 md:pt-52 pb-10 md:pb-14">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <Kicker>The Shop</Kicker>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl mt-5 tracking-tight leading-none">
            <MaskLine delay={0.15}>Candles &amp; Rituals</MaskLine>
          </h1>
          <Reveal delay={0.35}>
            <p className="mt-8 max-w-xl text-[#5c3e2b]/90 text-lg leading-relaxed">
              Every piece is thoughtfully designed to bring fragrance, craftsmanship and quiet luxury into everyday spaces.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Category filter bar */}
      <div className="sticky top-20 z-30 bg-[#f8f6f2]/85 backdrop-blur-xl border-y border-[#2b2320]/10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-4 flex gap-2 overflow-x-auto vl-hide-scrollbar">
          {[{ id: "all", title: "All" }, ...data.categories].map((c) => (
            <button
              key={c.id}
              data-testid={`filter-${c.id}`}
              onClick={() => scrollTo(c.id)}
              className={`shrink-0 text-sm px-5 py-2 rounded-full border transition-colors duration-300 ${
                active === c.id ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/20 text-[#2b2320]/70 hover:border-[#2b2320]"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 text-center text-[#2b2320]/50 font-display text-2xl">Curating the collection…</div>
      ) : (
        visibleCats.map((cat, ci) => (
          <section key={cat.id} id={`cat-${cat.id}`} data-testid={`category-${cat.id}`} className={`py-16 md:py-24 scroll-mt-36 ${ci % 2 === 1 ? "bg-[#f2ebdd]" : ""}`}>
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
              <Reveal className="mb-10 md:mb-14">
                <Kicker>{String(ci + 1).padStart(2, "0")}</Kicker>
                <h2 className="font-display text-4xl md:text-6xl mt-3 tracking-tight">{cat.title}</h2>
                <p className="text-[#5c3e2b]/85 mt-3 max-w-xl">{cat.tagline}</p>
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14">
                {byCategory[cat.id]?.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 4) * 0.06}>
                    <ProductCard product={p} index={i} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ))
      )}

      <section className="py-28 md:py-40 bg-[#2b2320] text-[#f8f6f2]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
          <Reveal><Kicker className="text-[#e6b980]">Partnerships & Gifting</Kicker></Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display text-4xl md:text-6xl mt-6 max-w-3xl mx-auto tracking-tight">
              Interested in custom gifting or bulk orders?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              to="/contact"
              data-testid="shop-cta-btn"
              className="group mt-10 inline-flex items-center gap-2 bg-[#f8f6f2] text-[#2b2320] px-9 py-4 rounded-full text-sm tracking-wide hover:bg-[#e6b980] transition-colors duration-300"
            >
              Contact Us
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
