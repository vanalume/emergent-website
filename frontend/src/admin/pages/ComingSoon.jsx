/** Placeholder — real page ships in its dedicated phase. */
export default function ComingSoon({ kicker, title, description }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.24em] uppercase text-[#5c3e2b]">{kicker}</p>
      <h1 className="font-display text-5xl md:text-6xl mt-2 leading-none">{title}</h1>
      <p className="text-[#5c3e2b]/80 mt-4 max-w-xl">{description}</p>
      <div className="mt-14 border border-dashed border-[#2b2320]/25 rounded-sm p-16 text-center bg-[#faf7f1]">
        <p className="font-display text-2xl text-[#5c3e2b]/75">Being built out.</p>
        <p className="text-sm text-[#5c3e2b]/60 mt-2">The shell &amp; primitives are ready — this screen is next.</p>
      </div>
    </div>
  );
}
