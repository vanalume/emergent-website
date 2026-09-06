import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal, Kicker } from "@/components/Motion";
import { IMAGES, FRAGRANCES } from "@/lib/data";
import useContent from "@/hooks/useContent";

const DEFAULT_SLIDES = [
  { id: "candles", image: "/hero/candles.png", link: "/shop#group-jar-candles", alt: "Vanalume scented candles collection" },
  { id: "stones", image: "/hero/stones.png", link: "/shop#group-aroma-stones", alt: "Vanalume aroma stones" },
  { id: "oils", image: "/hero/oils.png", link: "/shop#group-aroma-oils", alt: "Vanalume aroma oils, inspired by the elements" },
];

function HeroSlideshow({ slides }) {
  const [idx, setIdx] = useState(0);
  const total = slides.length;
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total]);
  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total]);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const slide = slides[idx];

  return (
    <section data-testid="hero-slideshow" className="relative w-full bg-[#f2ebdd]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">
        <div className="relative w-full aspect-[3/2] overflow-hidden rounded-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1.02 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Link to={slide.link} data-testid={`hero-slide-${slide.id}`} className="block h-full w-full">
                <img src={slide.image} alt={slide.alt} className="h-full w-full object-contain md:object-cover" />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next */}
          <button
            onClick={prev}
            data-testid="hero-prev"
            aria-label="Previous slide"
            className="absolute right-20 md:right-24 bottom-4 md:bottom-6 h-10 w-10 md:h-12 md:w-12 rounded-full border border-[#2b2320]/40 bg-[#f8f6f2]/70 hover:bg-[#f8f6f2] backdrop-blur-sm text-[#2b2320] flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            data-testid="hero-next"
            aria-label="Next slide"
            className="absolute right-4 md:right-6 bottom-4 md:bottom-6 h-10 w-10 md:h-12 md:w-12 rounded-full border border-[#2b2320]/40 bg-[#f8f6f2]/70 hover:bg-[#f8f6f2] backdrop-blur-sm text-[#2b2320] flex items-center justify-center transition-colors"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dots */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 md:bottom-6 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIdx(i)}
                data-testid={`hero-dot-${s.id}`}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "bg-[#2b2320] w-8" : "bg-[#2b2320]/30 w-3 hover:bg-[#2b2320]/60"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FragranceStrip({ fragrances }) {
  return (
    <section className="pt-24 md:pt-28 pb-4 md:pb-6 bg-[#e8ddc9] overflow-hidden">
      <Marquee speed={40} gradient gradientColor="#e8ddc9" gradientWidth={80} pauseOnHover>
        {fragrances.map((f) => (
          <div key={f} className="group flex items-center gap-6 md:gap-8 px-6 md:px-8">
            <span className="font-display italic text-lg md:text-2xl text-[#5c3e2b]/85 group-hover:text-[#395439] transition-colors duration-500">{f}</span>
            <span className="h-1 w-1 rounded-full bg-[#5c3e2b]/40" />
          </div>
        ))}
      </Marquee>
    </section>
  );
}

function Belief({ body }) {
  return (
    <section className="py-28 md:py-40 bg-[#f2ebdd]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <Reveal><Kicker>Our Belief</Kicker></Reveal>
        <Reveal delay={0.05}>
          <p className="mt-8 max-w-3xl font-read italic text-3xl md:text-4xl lg:text-5xl leading-[1.3] tracking-tight text-[#2b2823]">
            {body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function CTA({ headline, buttonLabel }) {
  return (
    <section className="relative py-32 md:py-48 overflow-hidden bg-[#241a10]">
      <div className="absolute inset-0">
        <img src={IMAGES.rituals} alt="A calm ritual moment" className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-[#241a10]/65" />
      </div>
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 text-center">
        <Reveal><h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-[#f8f6f2] tracking-tight">{headline}</h2></Reveal>
        <Reveal delay={0.1}>
          <Link to="/shop" data-testid="cta-explore-btn" className="group mt-10 inline-flex items-center gap-2 bg-[#f8f6f2] text-[#2b2823] px-9 py-4 rounded-full text-sm tracking-wide hover:bg-[#d4a574] transition-colors duration-300">
            {buttonLabel} <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  const { value } = useContent("home");
  const slides = value("hero_slides", DEFAULT_SLIDES);
  const showStrip = value("fragrance_strip_enabled", false);
  const fragrances = value("fragrances", FRAGRANCES);
  const beliefBody = value("belief_body", "Luxury isn't loud, it is the quiet confidence of a thoughtfully lit candle, and rituals that slow everyday life");
  const ctaHeadline = value("cta_headline", "Experience Composed Living");
  const ctaButton = value("cta_button_label", "Explore Products");

  return (
    <div className="my-24" data-testid="home-page">
      {showStrip && <FragranceStrip fragrances={fragrances} />}
      <HeroSlideshow slides={slides} />
      <Belief body={beliefBody} />
      <CTA headline={ctaHeadline} buttonLabel={ctaButton} />
    </div>
  );
}
