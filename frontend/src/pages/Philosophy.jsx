import { useState } from "react";
import { motion } from "framer-motion";
import { Hand, Flower2, Eye, Leaf, AudioLines } from "lucide-react";
import { Reveal, MaskLine, Kicker } from "@/components/Motion";
import { SENSES, IMAGES } from "@/lib/data";

const ICONS = { Hand, Flower2, Eye, Leaf, AudioLines };

function Senses() {
  const [active, setActive] = useState(0);
  const ActiveIcon = ICONS[SENSES[active].icon];

  return (
    <section className="py-28 md:py-40 bg-[#2b2823] text-[#f8f6f2] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <Reveal className="text-center">
          <Kicker className="text-[#d4a574]">A Sensory Philosophy</Kicker>
          <h2 className="font-serif text-4xl md:text-6xl mt-5 tracking-tight">The Five Senses</h2>
        </Reveal>

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-64 w-64 md:h-80 md:w-80 rounded-full">
              {[0, 1, 2].map((r) => (
                <motion.span
                  key={r}
                  className="absolute inset-0 rounded-full border border-[#d4a574]/30"
                  animate={{ scale: [0.7, 1.8], opacity: [0.5, 0] }}
                  transition={{ duration: 4, delay: r * 1.3, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
            </div>
            <div className="relative h-56 w-56 md:h-72 md:w-72 rounded-full overflow-hidden ring-1 ring-[#d4a574]/40">
              <img src={IMAGES.philosophyNature} alt="Calming nature" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[#2b2823]/30" />
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <ActiveIcon size={44} className="text-[#f8f6f2]" strokeWidth={1.2} />
              </motion.div>
            </div>
          </div>

          <div className="divide-y divide-[#f8f6f2]/12 border-t border-[#f8f6f2]/12">
            {SENSES.map((s, i) => {
              const Icon = ICONS[s.icon];
              const on = active === i;
              return (
                <button
                  key={s.key}
                  data-testid={`sense-${s.key.toLowerCase()}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="w-full text-left py-6 group"
                >
                  <div className="flex items-center gap-5">
                    <Icon size={22} strokeWidth={1.3} className={`transition-colors duration-300 ${on ? "text-[#d4a574]" : "text-[#f8f6f2]/50"}`} />
                    <span className={`font-serif text-3xl md:text-4xl transition-colors duration-300 ${on ? "text-[#f8f6f2]" : "text-[#f8f6f2]/45"}`}>{s.key}</span>
                  </div>
                  <motion.p
                    initial={false}
                    animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }}
                    className="overflow-hidden text-[#f8f6f2]/60 text-sm md:text-base leading-relaxed pl-11"
                  >
                    <span className="block pt-3">{s.desc}</span>
                  </motion.p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Philosophy() {
  return (
    <div data-testid="philosophy-page">
      <section className="pt-40 md:pt-56 pb-20 md:pb-28">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <Kicker>Our Philosophy</Kicker>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mt-6 tracking-tight leading-[1.02] max-w-4xl">
            <MaskLine delay={0.15}>Luxury should be</MaskLine>
            <MaskLine delay={0.32}><span className="italic text-[#395439]">lived,</span> not displayed.</MaskLine>
          </h1>
        </div>
      </section>

      <section className="pb-24 md:pb-32 bg-[#f5f1ea] pt-24 md:pt-32">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16">
          <Reveal>
            <Kicker>Mission</Kicker>
            <p className="font-serif text-3xl md:text-4xl mt-6 leading-tight tracking-tight">
              To create thoughtfully crafted fragrance experiences that inspire slower, calmer and more intentional living.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Kicker>Vision</Kicker>
            <p className="font-serif text-3xl md:text-4xl mt-6 leading-tight tracking-tight">
              To build a global lifestyle brand where fragrance, design and ritual come together to transform everyday spaces into meaningful experiences.
            </p>
          </Reveal>
        </div>
      </section>

      <Senses />

      <section className="py-28 md:py-44">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <Reveal>
            <p className="font-serif text-3xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight max-w-5xl mx-auto text-center">
              At Vanalume, we believe home should engage every sense — creating moments that are remembered long after the fragrance fades.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
