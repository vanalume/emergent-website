import { useMemo, useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart, formatINR } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const [variant, setVariant] = useState(hasVariants ? product.variants[0].label : null);

  const chosenVariant = useMemo(
    () => hasVariants ? product.variants.find(v => v.label === variant) : null,
    [hasVariants, product.variants, variant]
  );

  const images = useMemo(() => {
    const base = product.images || (product.image ? [product.image] : []);
    if (chosenVariant?.image) return [chosenVariant.image, ...base.filter(x => x !== chosenVariant.image)];
    return base;
  }, [product.images, product.image, chosenVariant]);

  const [idx, setIdx] = useState(0);
  const total = images.length;
  const next = (e) => { e.preventDefault(); e.stopPropagation(); setIdx((idx + 1) % total); };
  const prev = (e) => { e.preventDefault(); e.stopPropagation(); setIdx((idx - 1 + total) % total); };

  const sp = chosenVariant?.sp ?? product.sp;
  const mrp = chosenVariant?.mrp ?? product.mrp;
  const enquire = product.enquire;

  const onAdd = (e) => { e.preventDefault(); e.stopPropagation(); add(product, variant, 1); };

  return (
    <div data-testid={`product-${product.id}`} className="group flex flex-col">
      <div className="relative overflow-hidden rounded-sm bg-[#ece3d4] aspect-[4/5]">
        <img
          key={images[idx]}
          src={images[idx]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-[#5c3e2b]/12" />
        {total > 1 && (
          <>
            <button onClick={prev} aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#f8f6f2]/85 text-[#2b2320] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={16} />
            </button>
            <button onClick={next} aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[#f8f6f2]/85 text-[#2b2320] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <span key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${i === idx ? "bg-[#f8f6f2]" : "bg-[#f8f6f2]/40"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-2xl leading-tight">{product.name}</h3>
            {product.fragrances?.length > 0 && (
              <p className="text-xs text-[#5c3e2b] mt-1 tracking-wide">{product.fragrances.join(" · ")}</p>
            )}
          </div>
          {!enquire && (
            <div className="text-right shrink-0 pt-1">
              <div className="text-sm">{formatINR(sp)}</div>
              {mrp > sp && <div className="text-xs text-[#2b2320]/40 line-through">{formatINR(mrp)}</div>}
            </div>
          )}
        </div>

        {product.desc && <p className="text-sm text-[#2b2320]/55 mt-2 leading-relaxed">{product.desc}</p>}

        {hasVariants && (
          <div className="flex flex-wrap gap-2 mt-4">
            {product.variants.map(v => (
              <button
                key={v.label}
                onClick={() => setVariant(v.label)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors duration-300 ${
                  variant === v.label ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/25 text-[#2b2320]/70 hover:border-[#2b2320]"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5">
          {enquire ? (
            <a href="/contact" className="inline-flex items-center gap-2 text-sm border border-[#2b2320] rounded-full px-6 py-2.5">Enquire</a>
          ) : (
            <button
              onClick={onAdd}
              data-testid={`add-${product.id}`}
              className="group/btn inline-flex items-center gap-2 text-sm bg-[#2b2320] text-[#f8f6f2] rounded-full px-6 py-2.5 hover:bg-[#395439] transition-colors duration-300"
            >
              Add to Cart
              <Plus size={14} className="transition-transform duration-300 group-hover/btn:rotate-90" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
