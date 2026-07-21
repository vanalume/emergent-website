import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Hand, Flower2, Eye, Leaf, AudioLines } from "lucide-react";
import { Reveal, MaskLine, Kicker } from "@/components/Motion";
import { SENSES, FOUNDERS, IMAGES } from "@/lib/data";

const ICONS = { Hand, Flower2, Eye, Leaf, AudioLines };

function Senses() {
  const [active, setActive] = useState(0);
  const ActiveIcon = ICONS[SENSES[active].icon];
  return (
    <section className="py-28 md:py-40 bg-[#2b2320] text-[#f8f6f2] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <Reveal className="text-center">
          <Kicker className="text-[#e6b980]">A Sensory Philosophy</Kicker>
          <h2 className="font-display text-4xl md:text-6xl mt-5 tracking-tight">The Five Senses</h2>
        </Reveal>
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-64 w-64 md:h-80 md:w-80">
              {[0, 1, 2].map((r) => (
                <motion.span key={r} className="absolute inset-0 rounded-full border border-[#e6b980]/30"
                  animate={{ scale: [0.7, 1.8], opacity: [0.5, 0] }}
                  transition={{ duration: 4, delay: r * 1.3, repeat: Infinity, ease: "easeOut" }} />
              ))}
            </div>
            <div className="relative h-56 w-56 md:h-72 md:w-72 rounded-full overflow-hidden ring-1 ring-[#e6b980]/40">
              <img src={IMAGES.philosophyNature} alt="Calming nature" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[#2b2320]/30" />
              <motion.div key={active} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="absolute inset-0 flex items-center justify-center">
                <ActiveIcon size={44} className="text-[#f8f6f2]" strokeWidth={1.2} />
              </motion.div>
            </div>
          </div>
          <div className="divide-y divide-[#f8f6f2]/12 border-t border-[#f8f6f2]/12">
            {SENSES.map((s, i) => {
              const Icon = ICONS[s.icon];
              const on = active === i;
              return (
                <button key={s.key} data-testid={`sense-${s.key.toLowerCase()}`} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)} className="w-full text-left py-6">
                  <div className="flex items-center gap-5">
                    <Icon size={22} strokeWidth={1.3} className={`transition-colors duration-300 ${on ? "text-[#e6b980]" : "text-[#f8f6f2]/50"}`} />
                    <span className={`font-display text-3xl md:text-4xl transition-colors duration-300 ${on ? "text-[#f8f6f2]" : "text-[#f8f6f2]/45"}`}>{s.key}</span>
                  </div>
                  <motion.div initial={false} animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }} className="overflow-hidden">
                    <p className="text-[#f8f6f2]/60 text-sm md:text-base leading-relaxed pl-11 pt-3">{s.desc}</p>
                  </motion.div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderHero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <section ref={ref} className="relative h-[70vh] min-h-[440px] overflow-hidden">
      <motion.div style={{ y: y }} className="absolute inset-0 -top-[8%] -bottom-[8%]">
        <img src={IMAGES.warmInterior} alt="Vanalume ambiance" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#2b2320]/55" />
      </motion.div>
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col justify-end pb-14 md:pb-20">
        <Kicker className="text-[#f8f6f2]/80">Founder Story</Kicker>
        <h2 className="mt-5 font-display text-[#f8f6f2] text-3xl md:text-5xl lg:text-6xl leading-[1.08] tracking-tight max-w-4xl">
          Built with patience, purpose and a belief that everyday rituals deserve beautiful design.
        </h2>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <div data-testid="about-page">
      <section className="pt-40 md:pt-56 pb-20 md:pb-28">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <Kicker>About Us</Kicker>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl mt-6 tracking-tight leading-[1.02] max-w-4xl">
            <MaskLine delay={0.15}>Luxury should be</MaskLine>
            <MaskLine delay={0.32}><span className="italic text-[#395439]">lived,</span> not displayed.</MaskLine>
          </h1>
        </div>
      </section>

      <section className="pb-24 md:pb-32 bg-[#f2ebdd] pt-24 md:pt-32">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <Reveal className="lg:col-span-4"><Kicker>What is Vanalume</Kicker></Reveal>
          <div className="lg:col-span-8 space-y-6 text-[#2b2320]/85 text-xl md:text-2xl leading-relaxed font-display">
            <Reveal><p>Vanalume makes fragrance and objects for people who want to notice their own life. We started with candles. We won&rsquo;t stop there.</p></Reveal>
            <Reveal delay={0.05}><p className="italic text-[#5c3e2b]">Quiet, warm, restrained. No neon, no glitter, no floral candle clichés.</p></Reveal>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16">
          <Reveal>
            <Kicker>Mission</Kicker>
            <p className="font-display text-3xl md:text-4xl mt-6 leading-tight tracking-tight">To create thoughtfully crafted fragrance experiences that inspire slower, calmer and more intentional living.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <Kicker>Vision</Kicker>
            <p className="font-display text-3xl md:text-4xl mt-6 leading-tight tracking-tight">To build a global lifestyle brand where fragrance, design and ritual come together to transform everyday spaces into meaningful experiences.</p>
          </Reveal>
        </div>
      </section>

      <Senses />

      <FounderHero />

      <section className="py-24 md:py-36">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <Reveal className="lg:col-span-4"><Kicker>The Beginning</Kicker></Reveal>
          <div className="lg:col-span-8 space-y-8 text-[#2b2320]/85 text-lg md:text-xl leading-relaxed">
            <Reveal><p>Vanalume was founded with a simple belief: the spaces we live in shape the way we feel. What began as an exploration of fragrance has grown into a vision for a lifestyle brand centred around intentional living.</p></Reveal>
            <Reveal delay={0.05}><p>Every product is created with care, balancing thoughtful design, quality craftsmanship and sensory experiences. Rather than following trends, Vanalume seeks to create timeless pieces that become part of everyday rituals.</p></Reveal>
            <Reveal delay={0.1}><p>This journey is being built by founders who believe luxury is defined not by excess, but by meaning, simplicity and lasting experiences.</p></Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-[#f2ebdd]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <Reveal><Kicker>The Founders</Kicker></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-12">
            {FOUNDERS.map((f, i) => (
              <Reveal key={f.name} delay={i * 0.1}>
                <div className="group" data-testid={`founder-${i}`}>
                  <div className="relative overflow-hidden rounded-sm">
                    <img src={f.img} alt={f.name} className="w-full aspect-[3/4] object-cover grayscale-[0.15] transition-all duration-[900ms] ease-out group-hover:scale-105 group-hover:grayscale-0" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-[#2b2320]/10" />
                  </div>
                  <h3 className="font-display text-3xl mt-6">{f.name}</h3>
                  <p className="text-xs tracking-[0.2em] uppercase text-[#5c3e2b] mt-2">{f.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 md:py-48 bg-[#2b2320] text-[#f8f6f2]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
          <Reveal>
            <p className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.15] tracking-tight max-w-4xl mx-auto">
              &ldquo;We are not building products. We are creating rituals worth returning to.&rdquo;
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
