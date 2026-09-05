import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Reveal, Kicker } from "@/components/Motion";
import ProductCard from "@/components/ProductCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Shop() {
  const [data, setData] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState("all");
  const [selectedSub, setSelectedSub] = useState({});
  const { hash } = useLocation();

  useEffect(() => {
    axios.get(`${API}/products`).then((r) => {
      setData(r.data)
  }).finally(() => setLoading(false));
  }, []);

  // Deep-link: /shop#group-<id> from the Home hero slideshow
  useEffect(() => {
    if (loading || !hash) return;
    const m = /^#group-([a-z0-9-]+)$/.exec(hash);
    if (m) {
      const id = m[1];
      setActiveGroup(id);
      setTimeout(() => {
        const el = document.getElementById(`group-${id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [hash, loading]);

  // Groups and sub-sections are derived entirely from the schema: each category
  // may define subcategories; otherwise it renders as a single section.
  const groupData = useMemo(() => {
    return data.categories.map((cat) => {
      const hasSubs = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;
      const subs = hasSubs ? cat.subcategories : [{ id: cat.id, title: cat.title, tagline: cat.tagline }];
      return {
        id: cat.id,
        title: cat.title,
        tagline: cat.tagline,
        hasSubs,
        subs: subs.map((sub) => ({
          ...sub,
          products: hasSubs
            ? data.products.filter((p) => p.subcategory === sub.id)
            : data.products.filter((p) => p.category === cat.id),
        })),
      };
    });
  }, [data.products, data.categories]);

  const visibleGroups = activeGroup === "all" ? groupData : groupData.filter((g) => g.id === activeGroup);

  const goToGroup = (id) => {
    setActiveGroup(id);
    if (id === "all") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setTimeout(() => {
      const el = document.getElementById(`group-${id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <div data-testid="shop-page">
      <div className="pt-28 md:pt-36" />

      {/* Group filter bar */}
      <div className="sticky top-20 z-30 bg-[#f8f6f2]/85 backdrop-blur-xl border-y border-[#2b2320]/10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-4 flex gap-2 overflow-x-auto vl-hide-scrollbar">
          {[{ id: "all", title: "All" }, ...groupData].map((g) => (
            <button
              key={g.id}
              data-testid={`filter-${g.id}`}
              onClick={() => goToGroup(g.id)}
              className={`shrink-0 text-sm px-5 py-2 rounded-full border transition-colors duration-300 ${
                activeGroup === g.id ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/20 text-[#2b2320]/70 hover:border-[#2b2320]"
              }`}
            >
              {g.title}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 text-center text-[#2b2320]/50 font-display text-2xl">Curating the collection…</div>
      ) : (
        visibleGroups.map((g, gi) => {
          const activeSubId = selectedSub[g.id] || (g.subs[0]?.id ?? null);
          const visibleSubs = g.hasSubs ? g.subs.filter((s) => s.id === activeSubId) : g.subs;
          return (
            <section
              key={g.id}
              id={`group-${g.id}`}
              data-testid={`group-${g.id}`}
              className={`py-20 md:py-28 scroll-mt-36 ${gi % 2 === 1 ? "bg-[#f2ebdd]" : ""}`}
            >
              <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                {/* Group header */}
                <Reveal className="mb-14 md:mb-20">
                  <h2 className="font-display text-5xl md:text-7xl mt-3 tracking-tight leading-[1.05]">{g.title}</h2>
                  <p className="text-[#5c3e2b]/85 mt-4 max-w-xl text-lg">{g.tagline}</p>
                </Reveal>

                {g.hasSubs && (
                  <div className="mb-10 md:mb-14 flex items-center gap-3">
                    <span className="text-xs tracking-[0.16em] uppercase text-[#5c3e2b]/70">Browse</span>
                    <div className="relative">
                      <select
                        value={activeSubId}
                        onChange={(e) => setSelectedSub((prev) => ({ ...prev, [g.id]: e.target.value }))}
                        aria-label={`${g.title} sub-category`}
                        className="appearance-none bg-transparent border border-[#2b2320]/25 rounded-full pl-5 pr-10 py-2.5 text-sm text-[#2b2320] cursor-pointer hover:border-[#2b2320] focus:outline-none focus:border-[#2b2320] transition-colors duration-300"
                      >
                        {g.subs.map((s) => (
                          <option key={s.id} value={s.id} className="bg-[#f8f6f2] text-[#2b2320]">{s.title}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2b2320]/60" />
                    </div>
                  </div>
                )}

                {/* Sub-sections */}
                <div className="space-y-20 md:space-y-28">
                  {visibleSubs.map((s) => (
                    <div key={s.id} id={`sub-${s.id}`} className="scroll-mt-40">
                      <Reveal className="mb-8 md:mb-10 flex items-end justify-between flex-wrap gap-3">
                        <div>
                          <h3 className="font-display text-3xl md:text-4xl tracking-tight">{s.title}</h3>
                          <p className="text-[#5c3e2b]/80 mt-2 max-w-xl">{s.tagline}</p>
                        </div>
                        <span className="text-xs tracking-[0.16em] uppercase text-[#5c3e2b]/70">
                          {`${s.products.length} ${s.products.length === 1 ? "product" : "products"}`}
                        </span>
                      </Reveal>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14">
                        {s.products.map((p, i) => (
                          <Reveal key={p.id} delay={(i % 4) * 0.06}>
                            <ProductCard product={p} index={i} />
                          </Reveal>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })
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
