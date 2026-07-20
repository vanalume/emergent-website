import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal, MaskLine, Kicker } from "@/components/Motion";
import { IMAGES, FRAGRANCES } from "@/lib/data";

const EASE = [0.16, 1, 0.3, 1];

const DUETS = [
  { name: "Awaken", scents: "Lemongrass · Cedarwood", img: IMAGES.heroAwaken },
  { name: "Intimacy", scents: "Lavender · Mogra", img: IMAGES.heroIntimacy },
  { name: "Bloom", scents: "Rose · Jasmine", img: IMAGES.heroBloom },
  { name: "Clarity", scents: "White Sage · Aqua", img: IMAGES.heroClarity },
  { name: "Equilibrium", scents: "Tea Tree · Sandalwood", img: IMAGES.heroEquilibrium },
];

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 14 }).map((_, i) => {
        const left = (i * 67) % 100;
        const size = 3 + ((i * 7) % 5);
        const dur = 9 + ((i * 5) % 8);
        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#d4a574]/50"
            style={{ left: `${left}%`, bottom: "-10%", width: size, height: size }}
            animate={{ y: ["0%", "-1100%"], opacity: [0, 0.9, 0] }}
            transition={{ duration: dur, delay: (i % 6) * 1.3, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.06, 1.18]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);

  return (
    <section ref={ref} data-testid="hero" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[#2b2823]">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src={IMAGES.heroAwaken} alt="Vanalume Awaken candles in warm morning light" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2b2823]/85 via-[#2b2823]/45 to-[#2b2823]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2b2823]/70 via-transparent to-[#2b2823]/30" />
      </motion.div>

      <Particles />
      <div className="absolute left-[18%] top-[55%] h-52 w-52 rounded-full bg-[#d4a574]/25 blur-3xl vl-glow" />

      <motion.div style={{ y: textY }} className="relative z-10 h-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }}>
          <Kicker className="text-[#d4a574]">Aromatic Candles · Soy–Coconut Wax</Kicker>
        </motion.div>

        <h1 className="mt-5 text-[#f8f6f2] font-display font-light leading-[0.88] text-[20vw] md:text-[15vw] lg:text-[12rem] tracking-tight">
          <MaskLine delay={0.35}>Vanalume</MaskLine>
        </h1>
        <div className="mt-1 md:mt-3 font-display italic text-[#f8f6f2]/90 text-3xl md:text-5xl">
          <MaskLine delay={0.6}>Composed Living</MaskLine>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 1, ease: EASE }}
          className="mt-8 max-w-lg text-[#f8f6f2]/80 text-base md:text-lg leading-relaxed"
        >
          Hand-poured candles, aroma stones and rituals — crafted to make everyday spaces feel calm, intentional and beautifully lived in.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 1, ease: EASE }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link to="/shop" data-testid="hero-shop-btn" className="group inline-flex items-center gap-2 bg-[#f8f6f2] text-[#2b2823] px-8 py-4 rounded-full text-sm tracking-wide hover:bg-[#d4a574] transition-colors duration-300">
            Shop Candles <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link to="/about" data-testid="hero-about-btn" className="inline-flex items-center gap-2 border border-[#f8f6f2]/60 text-[#f8f6f2] px-8 py-4 rounded-full text-sm tracking-wide hover:bg-[#f8f6f2] hover:text-[#2b2823] transition-colors duration-300">
            Our Story
          </Link>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[#f8f6f2]/70">
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="h-8 w-px bg-[#f8f6f2]/50" />
      </motion.div>
    </section>
  );
}

function Belief() {
  return (
    <section className="py-28 md:py-40 bg-[#f5f1ea]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <Reveal><Kicker>Our Belief</Kicker></Reveal>
        <Reveal delay={0.05}>
          <p className="mt-8 max-w-4xl font-display text-3xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight">
            Luxury isn&rsquo;t loud. It is the quiet confidence of a thoughtfully lit candle, the comfort of familiar fragrance, and rituals that slow everyday life.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function DuetShowcase() {
  return (
    <section className="py-28 md:py-40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <Kicker>The Duet Collection</Kicker>
            <h2 className="font-display text-4xl md:text-6xl mt-4 tracking-tight">Two fragrances, one ritual</h2>
          </div>
          <Link to="/shop" className="group inline-flex items-center gap-2 text-sm tracking-wide vl-link-underline w-max">
            Shop all candles <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
          {DUETS.map((d, i) => (
            <Reveal key={d.name} delay={i * 0.06}>
              <Link to="/shop" data-testid={`home-duet-${d.name.toLowerCase()}`} className="group block">
                <div className="relative overflow-hidden rounded-sm aspect-[4/5] bg-[#e6dfd3]">
                  <img src={d.img} alt={`${d.name} candles`} className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105" />
                </div>
                <h3 className="font-display text-2xl mt-3">{d.name}</h3>
                <p className="text-xs text-[#5c3e2b] mt-0.5">{d.scents}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Why() {
  const items = [
    { n: "01", title: "Premium ingredients", desc: "A clean soy–coconut wax blend and considered fragrance oils, selected for depth and a long, even burn." },
    { n: "02", title: "Designed collections", desc: "Frosted colour jars, wooden lids and ritual cards — objects that stay a quiet presence long after the flame." },
    { n: "03", title: "Made for ritual", desc: "Not trends. Timeless pieces that become part of the moments you return to." },
  ];
  return (
    <section className="py-28 md:py-40 bg-[#2b2823] text-[#f8f6f2]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <Reveal><Kicker className="text-[#d4a574]">Why Vanalume</Kicker></Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-14 gap-x-12 mt-14">
          {items.map((w, i) => (
            <Reveal key={w.n} delay={i * 0.1}>
              <div className="border-t border-[#f8f6f2]/15 pt-8">
                <span className="font-display text-5xl text-[#d4a574]">{w.n}</span>
                <h3 className="font-display text-2xl md:text-3xl mt-6">{w.title}</h3>
                <p className="text-[#f8f6f2]/60 text-sm md:text-base mt-4 leading-relaxed">{w.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FragranceStrip() {
  return (
    <section className="py-20 md:py-28 bg-[#e6dfd3] overflow-hidden">
      <Reveal className="max-w-[1440px] mx-auto px-6 md:px-12 mb-10"><Kicker>The Fragrance Library</Kicker></Reveal>
      <Marquee speed={40} gradient gradientColor="#e6dfd3" gradientWidth={120} pauseOnHover>
        {FRAGRANCES.map((f) => (
          <div key={f} className="group flex items-center gap-8 md:gap-12 px-8 md:px-12">
            <span className="font-display italic text-4xl md:text-7xl text-[#2b2823]/80 group-hover:text-[#395439] transition-colors duration-500">{f}</span>
            <span className="h-2 w-2 rounded-full bg-[#5c3e2b]/40" />
          </div>
        ))}
      </Marquee>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative py-32 md:py-48 overflow-hidden bg-[#2b2823]">
      <div className="absolute inset-0">
        <img src={IMAGES.heroIntimacy} alt="Vanalume ritual" className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-[#2b2823]/60" />
      </div>
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 text-center">
        <Reveal><h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-[#f8f6f2] tracking-tight">Experience Composed Living</h2></Reveal>
        <Reveal delay={0.1}>
          <Link to="/shop" data-testid="cta-shop-btn" className="group mt-10 inline-flex items-center gap-2 bg-[#f8f6f2] text-[#2b2823] px-9 py-4 rounded-full text-sm tracking-wide hover:bg-[#d4a574] transition-colors duration-300">
            Explore the Shop <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div data-testid="home-page">
      <Hero />
      <Belief />
      <DuetShowcase />
      <Why />
      <FragranceStrip />
      <CTA />
    </div>
  );
}
