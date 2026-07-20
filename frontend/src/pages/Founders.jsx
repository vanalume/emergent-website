import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal, MaskLine, Kicker } from "@/components/Motion";
import { FOUNDERS, IMAGES } from "@/lib/data";

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.22]);

  return (
    <section ref={ref} className="relative h-[90svh] min-h-[560px] overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src={IMAGES.productFeature} alt="Vanalume craft" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2b2823]/80 via-[#2b2823]/30 to-[#2b2823]/40" />
      </motion.div>
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col justify-end pb-16 md:pb-24">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }}>
          <Kicker className="text-[#f8f6f2]/80">Founder Story</Kicker>
        </motion.div>
        <h1 className="mt-6 font-serif text-[#f8f6f2] text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight max-w-4xl">
          <MaskLine delay={0.3}>Built with patience, purpose</MaskLine>
          <MaskLine delay={0.45}>and a belief that everyday rituals</MaskLine>
          <MaskLine delay={0.6}>deserve beautiful design.</MaskLine>
        </h1>
      </div>
    </section>
  );
}

export default function Founders() {
  return (
    <div data-testid="founders-page">
      <Hero />

      <section className="py-24 md:py-36">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <Reveal className="lg:col-span-4">
            <Kicker>The Beginning</Kicker>
          </Reveal>
          <div className="lg:col-span-8 space-y-8 text-[#2b2823]/85 text-lg md:text-xl leading-relaxed">
            <Reveal>
              <p>
                Vanalume was founded with a simple belief: the spaces we live in shape the way we feel. What began as an exploration of fragrance has grown into a vision for a lifestyle brand centred around intentional living.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p>
                Every product is created with care, balancing thoughtful design, quality craftsmanship and sensory experiences. Rather than following trends, Vanalume seeks to create timeless pieces that become part of everyday rituals.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p>
                This journey is being built by founders who believe luxury is defined not by excess, but by meaning, simplicity and lasting experiences.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-[#f5f1ea]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <Reveal><Kicker>The Founders</Kicker></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-12">
            {FOUNDERS.map((f, i) => (
              <Reveal key={f.name} delay={i * 0.1}>
                <div className="group" data-testid={`founder-${i}`}>
                  <div className="relative overflow-hidden rounded-sm">
                    <img src={f.img} alt={f.name} className="w-full aspect-[3/4] object-cover grayscale-[0.15] transition-all duration-[900ms] ease-out group-hover:scale-105 group-hover:grayscale-0" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-[#2b2823]/10" />
                  </div>
                  <h3 className="font-serif text-3xl mt-6">{f.name}</h3>
                  <p className="text-xs tracking-[0.2em] uppercase text-[#5c3e2b] mt-2">{f.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 md:py-48 bg-[#2b2823] text-[#f8f6f2]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
          <Reveal>
            <p className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.15] tracking-tight max-w-4xl mx-auto">
              &ldquo;We are not building products. We are creating rituals worth returning to.&rdquo;
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
