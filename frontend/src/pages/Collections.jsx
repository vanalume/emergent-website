import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal, MaskLine, Kicker } from "@/components/Motion";
import { COLLECTIONS } from "@/lib/data";

function CollectionBlock({ c, index }) {
  const reversed = index % 2 === 1;
  return (
    <section id={c.id} data-testid={`collection-${c.id}`} className={`py-20 md:py-28 ${index % 2 === 1 ? "bg-[#f5f1ea]" : ""}`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reversed ? "lg:[&>*:first-child]:order-2" : ""}`}>
          <Reveal>
            <div className="relative overflow-hidden rounded-sm group">
              <img src={c.image} alt={c.title} className="w-full aspect-[4/5] object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105" />
              <div className="absolute inset-0 ring-1 ring-inset ring-[#2b2823]/10" />
            </div>
          </Reveal>

          <div>
            <Reveal><Kicker>{c.kicker}</Kicker></Reveal>
            <Reveal delay={0.05}><h2 className="font-serif text-4xl md:text-6xl mt-4 tracking-tight">{c.title}</h2></Reveal>
            <Reveal delay={0.1}><p className="text-[#5c3e2b]/90 text-base md:text-lg mt-5 max-w-md leading-relaxed">{c.intro}</p></Reveal>

            <div className="mt-10 divide-y divide-[#2b2823]/10 border-t border-[#2b2823]/10">
              {c.items.map((it, i) => (
                <Reveal key={it.name} delay={0.12 + i * 0.06}>
                  <div className="group py-6 flex items-start justify-between gap-6">
                    <div>
                      <h3 className="font-serif text-2xl md:text-3xl group-hover:text-[#395439] transition-colors duration-300">{it.name}</h3>
                      <p className="text-sm text-[#2b2823]/60 mt-2 max-w-sm leading-relaxed">{it.desc}</p>
                    </div>
                    <span className="shrink-0 text-xs tracking-[0.16em] uppercase text-[#5c3e2b] pt-2 text-right">{it.meta}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Collections() {
  return (
    <div data-testid="collections-page">
      <section className="pt-40 md:pt-52 pb-16 md:pb-24 bg-[#f8f6f2]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <Kicker>The Catalogue</Kicker>
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl mt-5 tracking-tight leading-none">
            <MaskLine delay={0.15}>Collections</MaskLine>
          </h1>
          <Reveal delay={0.4}>
            <p className="mt-8 max-w-xl text-[#5c3e2b]/90 text-lg leading-relaxed">
              Every collection is thoughtfully designed to bring fragrance, craftsmanship and quiet luxury into everyday spaces.
            </p>
          </Reveal>
        </div>
      </section>

      {COLLECTIONS.map((c, i) => (
        <CollectionBlock key={c.id} c={c} index={i} />
      ))}

      <section className="py-28 md:py-40 bg-[#2b2823] text-[#f8f6f2]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
          <Reveal><Kicker className="text-[#d4a574]">Partnerships</Kicker></Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-serif text-4xl md:text-6xl mt-6 max-w-3xl mx-auto tracking-tight">
              Interested in custom gifting or bulk orders?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              to="/contact"
              data-testid="collections-cta-btn"
              className="group mt-10 inline-flex items-center gap-2 bg-[#f8f6f2] text-[#2b2823] px-9 py-4 rounded-full text-sm tracking-wide hover:bg-[#d4a574] transition-colors duration-300"
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
