import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal, Kicker } from "@/components/Motion";
import ProductCard from "@/components/ProductCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Display-only groups (built from existing catalog data — backend untouched).
 * Each group has one or more sub-sections; the products come from category filters or explicit id sets.
 */
const GROUPS = [
  {
    id: "jar-candles",
    title: "Jar Candles",
    tagline: "Every fragrance we make, cast in glass or metal.",
    subs: [
      { key: "duet",             title: "Duet Collection",        tagline: "Two fragrances, one ritual.",                filter: (p) => p.category === "duet" },
      { key: "single",           title: "Individual Candles",     tagline: "Every Duet fragrance available on its own.",  filter: (p) => p.category === "single" },
      { key: "ensemble-tin",     title: "Ensemble · Tin",         tagline: "Three curated fragrances in the signature tin.", filter: (p) => p.id === "ensemble-celebrate-tin" || p.id === "ensemble-presence-tin" },
      { key: "ensemble-metal",   title: "Ensemble · Metallic Jar",tagline: "Three curated fragrances in a premium 220cc metallic jar.", filter: (p) => p.id === "ensemble-celebrate-metallic" || p.id === "ensemble-presence-metallic" },
      { key: "library",          title: "Perfumer's Library",     tagline: "Six fragrances. The complete discovery experience.", filter: (p) => p.category === "library" },
      { key: "ceramic",          title: "Ceramic Jars",           tagline: "Coming soon.",                                filter: () => false, comingSoon: true },
    ],
  },
  {
    id: "aroma-stones",
    title: "Aroma Stones",
    tagline: "Objects for a quiet, sensory home.",
    subs: [
      { key: "aroma-stones", title: "Aroma Stones",              tagline: "Amber jar with small stones, and a sculptural centrepiece with dish.", filter: (p) => p.category === "aroma-stones" },
    ],
  },
  {
    id: "aroma-oils",
    title: "Aroma Oils",
    tagline: "Signature oils, inspired by the five elements.",
    subs: [
      { key: "aroma-oils", title: "Aroma Oils", tagline: "Pure aroma oils. Use with any Vanalume aroma stone or diffuser.", filter: (p) => p.category === "aroma-oils" },
    ],
  },
  {
    id: "pillar",
    title: "Pillar Candles",
    tagline: "Rustic-finish pillars in three heights, or as a set of three.",
    subs: [
      { key: "pillar", title: "Pillar Candles", tagline: "Four colour-fragrance pairings. Four heights to choose from.", filter: (p) => p.category === "pillar" },
    ],
  },
  {
    id: "taper",
    title: "Taper Candles",
    tagline: "Sculptural tapers, in a set of three.",
    subs: [
      { key: "taper", title: "Taper Candles", tagline: "Mulberry, Oudh and Basil, together.", filter: (p) => p.category === "taper" },
    ],
  },
  {
    id: "wax",
    title: "Wax Bars",
    tagline: "Handcrafted wax melts, in a set of two.",
    subs: [
      { key: "wax", title: "Wax Bars", tagline: "Clove × Cinnamon and Rose × Jasmine.", filter: (p) => p.category === "wax" },
    ],
  },
];

export default function Shop() {
  const [data, setData] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState("all");
  const { hash } = useLocation();

  useEffect(() => {
    axios.get(`${API}/products`).then((r) => setData(r.data)).finally(() => setLoading(false));
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

  const groupData = useMemo(() => {
    return GROUPS.map((g) => ({
      ...g,
      subs: g.subs.map((s) => ({ ...s, products: data.products.filter(s.filter) })),
    }));
  }, [data.products]);

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
          {[{ id: "all", title: "All" }, ...GROUPS].map((g) => (
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
        visibleGroups.map((g, gi) => (
          <section
            key={g.id}
            id={`group-${g.id}`}
            data-testid={`group-${g.id}`}
            className={`py-20 md:py-28 scroll-mt-36 ${gi % 2 === 1 ? "bg-[#f2ebdd]" : ""}`}
          >
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
              {/* Group header */}
              <Reveal className="mb-14 md:mb-20">
                <Kicker>{String(gi + 1).padStart(2, "0")}</Kicker>
                <h2 className="font-display text-5xl md:text-7xl mt-3 tracking-tight leading-[1.05]">{g.title}</h2>
                <p className="text-[#5c3e2b]/85 mt-4 max-w-xl text-lg">{g.tagline}</p>
              </Reveal>

              {/* Sub-sections */}
              <div className="space-y-20 md:space-y-28">
                {g.subs.map((s) => (
                  <div key={s.key} id={`sub-${s.key}`} className="scroll-mt-40">
                    <Reveal className="mb-8 md:mb-10 flex items-end justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="font-display text-3xl md:text-4xl tracking-tight">{s.title}</h3>
                        <p className="text-[#5c3e2b]/80 mt-2 max-w-xl">{s.tagline}</p>
                      </div>
                      <span className="text-xs tracking-[0.16em] uppercase text-[#5c3e2b]/70">
                        {s.comingSoon ? "Coming soon" : `${s.products.length} ${s.products.length === 1 ? "product" : "products"}`}
                      </span>
                    </Reveal>

                    {s.comingSoon ? (
                      <div className="rounded-sm border border-dashed border-[#5c3e2b]/25 p-16 text-center bg-[#f8f6f2]/40">
                        <p className="font-display text-2xl md:text-3xl text-[#5c3e2b]/80">A new format is on its way.</p>
                        <p className="text-sm mt-3 text-[#5c3e2b]/60 max-w-md mx-auto">
                          Our ceramic jar range is being crafted. Sign up to be the first to know when it launches.
                        </p>
                        <Link
                          to="/contact"
                          className="inline-flex mt-6 items-center gap-2 border border-[#2b2320] rounded-full px-6 py-2.5 text-sm hover:bg-[#2b2320] hover:text-[#f8f6f2] transition-colors duration-300"
                        >
                          Notify me
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14">
                        {s.products.map((p, i) => (
                          <Reveal key={p.id} delay={(i % 4) * 0.06}>
                            <ProductCard product={p} index={i} />
                          </Reveal>
                        ))}
                      </div>
                    )}
                  </div>
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
