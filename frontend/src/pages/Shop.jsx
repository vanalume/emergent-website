import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Reveal, Kicker } from "@/components/Motion";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import ScrollCarousel from "@/components/ScrollCarousel";
import ResetLink from "@/components/ResetLink";
import useContent from "@/hooks/useContent";
import usePageState from "@/hooks/usePageState";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Shop() {
  const [data, setData] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(true);
  // Filters are persisted per-route: restored when navigating back (breadcrumbs,
  // related product links, browser back) and cleared when arriving via the
  // navbar or a CTA.
  const [{ activeGroup, selectedSub }, setFilters, restored] = usePageState({ activeGroup: "all", selectedSub: {} });
  const { pathname, hash } = useLocation();
  const { value } = useContent("shop");

  const patchFilters = useCallback((patch) => setFilters((f) => ({ ...f, ...patch })), [setFilters]);

  const partnershipTitle = value("partnership_title", "Partnerships & Gifting");
  const partnershipText = value("partnership_text", "Interested in custom gifting or bulk orders?");
  const partnershipButton = value("partnership_button_label", "Contact Us");

  const categoriesKicker = value("categories_kicker", "Collections");
  const categoriesTitle = value("categories_title", "Shop by Category");
  const categoriesTagline = value("categories_tagline", "Each collection is composed around a distinct ritual — choose where to begin.");

  useEffect(() => {
    axios.get(`${API}/products`).then((r) => {
      setData(r.data)
  }).finally(() => setLoading(false));
  }, []);

  // Deep-link: /shop#group-<id> from the Home hero slideshow. Only on a cold or
  // reset arrival — when we're restoring a previous visit we keep the user's
  // state and scroll instead of jumping to the hash target.
  useEffect(() => {
    if (loading || !hash || restored) return;
    const m = /^#group-([a-z0-9-]+)$/.exec(hash);
    if (m) {
      const id = m[1];
      patchFilters({ activeGroup: id });
      setTimeout(() => {
        const el = document.getElementById(`group-${id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [hash, loading, restored, patchFilters]);

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

  // One card per top-level category for the "All" rail. The cover image is the
  // first product shown when opening that category — i.e. the first product of
  // its first sub-section (sub-category order is respected; sub-categories are
  // otherwise irrelevant here).
  const categoryCards = useMemo(
    () =>
      groupData.map((g) => {
        const first = g.subs.flatMap((s) => s.products)[0];
        return {
          id: g.id,
          title: g.title,
          count: g.subs.reduce((n, s) => n + s.products.length, 0),
          image: first?.images?.[0] || first?.image || null,
        };
      }),
    [groupData],
  );

  const visibleGroups = activeGroup === "all" ? groupData : groupData.filter((g) => g.id === activeGroup);

  const goToGroup = (id) => {
    patchFilters({ activeGroup: id });
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
              className={`shrink-0 fs-filter_chip px-5 py-2 rounded-full border transition-colors duration-300 ${
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
      ) : activeGroup === "all" ? (
        <section data-testid="shop-all" className="py-20 md:py-28">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <Reveal className="mb-14 md:mb-20">
              <Kicker>{categoriesKicker}</Kicker>
              <h2 className="font-display fs-category_title mt-3 tracking-tight leading-[1.05]">{categoriesTitle}</h2>
              <p className="text-[#5c3e2b]/85 mt-4 max-w-xl fs-category_tagline">{categoriesTagline}</p>
            </Reveal>

            <ScrollCarousel
              restoreKey={`${pathname}::categories`}
              prevLabel="Scroll categories left"
              nextLabel="Scroll categories right"
              prevTestId="categories-prev"
              nextTestId="categories-next"
              trackClassName="gap-6 md:gap-8"
            >
              {categoryCards.map((c) => (
                <CategoryCard
                  key={c.id}
                  category={c}
                  onSelect={goToGroup}
                  className="shrink-0 snap-start w-[calc(50%-0.75rem)] md:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
                />
              ))}
            </ScrollCarousel>
          </div>
        </section>
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
                  <h2 className="font-display fs-category_title mt-3 tracking-tight leading-[1.05]">{g.title}</h2>
                  <p className="text-[#5c3e2b]/85 mt-4 max-w-xl fs-category_tagline">{g.tagline}</p>
                </Reveal>

                {g.hasSubs && (
                  <div className="mb-10 md:mb-14 flex items-center gap-3">
                    <span className="text-xs tracking-[0.16em] uppercase text-[#5c3e2b]/70">Browse</span>
                    <div className="relative">
                      <select
                        value={activeSubId}
                        onChange={(e) => setFilters((f) => ({ ...f, selectedSub: { ...f.selectedSub, [g.id]: e.target.value } }))}
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
                      {g.hasSubs && (
                        <Reveal className="mb-8 md:mb-10 flex items-end justify-between flex-wrap gap-3">
                        <div>
                          <h3 className="font-display fs-subcategory_title tracking-tight">{s.title}</h3>
                          <p className="text-[#5c3e2b]/80 mt-2 max-w-xl fs-subcategory_tagline">{s.tagline}</p>
                        </div>
                        <span className="text-xs tracking-[0.16em] uppercase text-[#5c3e2b]/70">
                          {`${s.products.length} ${s.products.length === 1 ? "product" : "products"}`}
                        </span>
                      </Reveal>
                      )}
                      

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
          <Reveal><Kicker className="text-[#e6b980]">{partnershipTitle}</Kicker></Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display fs-section_heading mt-6 max-w-3xl mx-auto tracking-tight">
              {partnershipText}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <ResetLink
              to="/contact"
              data-testid="shop-cta-btn"
              className="group mt-10 inline-flex items-center gap-2 bg-[#f8f6f2] text-[#2b2320] px-9 py-4 rounded-full text-sm tracking-wide hover:bg-[#e6b980] transition-colors duration-300"
            >
              {partnershipButton}
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </ResetLink>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
