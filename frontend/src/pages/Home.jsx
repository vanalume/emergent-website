import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal, Kicker } from "@/components/Motion";
import { IMAGES, FRAGRANCES } from "@/lib/data";

const SLIDES = [
  { id: "candles", src: "/hero/candles.jpg", alt: "Vanalume scented candles collection", to: "/shop#group-jar-candles" },
  { id: "stones",  src: "/hero/stones.jpg",  alt: "Vanalume aroma stones",                to: "/shop#group-aroma-stones" },
  { id: "oils",    src: "/hero/oils.jpg",    alt: "Vanalume aroma oils, inspired by the elements", to: "/shop#group-aroma-oils" },
];

function HeroSlideshow() {
  const [idx, setIdx] = useState(0);
  const total = SLIDES.length;
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total]);
  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total]);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[idx];

  return (
    <section data-testid="hero-slideshow" className="relative w-full bg-[#f2ebdd]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="relative w-full aspect-[3/2] max-h-[68vh] overflow-hidden rounded-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Link to={slide.to} data-testid={`hero-slide-${slide.id}`} className="block h-full w-full">
                <img src={slide.src} alt={slide.alt} className="h-full w-full object-contain md:object-cover" />
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
            {SLIDES.map((s, i) => (
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

function FragranceStrip() {
  return (
    <section className="pt-28 md:pt-32 pb-12 md:pb-16 bg-[#e8ddc9] overflow-hidden">
      <Reveal className="max-w-[1440px] mx-auto px-6 md:px-12 mb-8"><Kicker>The Fragrance Library</Kicker></Reveal>
      <Marquee speed={40} gradient gradientColor="#e8ddc9" gradientWidth={120} pauseOnHover>
        {FRAGRANCES.map((f) => (
          <div key={f} className="group flex items-center gap-8 md:gap-12 px-8 md:px-12">
            <span className="font-display italic text-4xl md:text-7xl text-[#5c3e2b]/85 group-hover:text-[#395439] transition-colors duration-500">{f}</span>
            <span className="h-2 w-2 rounded-full bg-[#5c3e2b]/40" />
          </div>
        ))}
      </Marquee>
    </section>
  );
}

function Belief() {
  return (
    <section className="py-28 md:py-40 bg-[#f2ebdd]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <Reveal><Kicker>Our Belief</Kicker></Reveal>
        <Reveal delay={0.05}>
          <p className="mt-8 max-w-3xl font-read italic text-3xl md:text-4xl lg:text-5xl leading-[1.3] tracking-tight text-[#2b2823]">
            Luxury isn&rsquo;t loud, it is the quiet confidence of a thoughtfully lit candle, and rituals that slow everyday life
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative py-32 md:py-48 overflow-hidden bg-[#241a10]">
      <div className="absolute inset-0">
        <img src={IMAGES.rituals} alt="A calm ritual moment" className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-[#241a10]/65" />
      </div>
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 text-center">
        <Reveal><h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-[#f8f6f2] tracking-tight">Experience Composed Living</h2></Reveal>
        <Reveal delay={0.1}>
          <Link to="/shop" data-testid="cta-explore-btn" className="group mt-10 inline-flex items-center gap-2 bg-[#f8f6f2] text-[#2b2823] px-9 py-4 rounded-full text-sm tracking-wide hover:bg-[#d4a574] transition-colors duration-300">
            Explore Products <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div data-testid="home-page">
      <FragranceStrip />
      <HeroSlideshow />
      <Belief />
      <CTA />
    </div>
  );
}
