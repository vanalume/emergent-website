import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/data";

export default function ProductCard({ product, index = 0 }) {
  const { add } = useCart();
  const hasVariants = Array.isArray(product.sizes) && product.sizes.length > 0;
  const [variant, setVariant] = useState(hasVariants ? product.sizes[0] : null);

  return (
    <div data-testid={`product-${product.id}`} className="group flex flex-col">
      <div className="relative overflow-hidden rounded-sm bg-[#e6dfd3] aspect-[4/5]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-[#2b2823]/10" />
      </div>

      <div className="mt-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-2xl leading-tight">{product.name}</h3>
            {product.fragrances?.length > 0 && (
              <p className="text-xs text-[#5c3e2b] mt-1 tracking-wide">{product.fragrances.join(" · ")}</p>
            )}
          </div>
          {product.price != null && <span className="text-sm shrink-0 pt-1">{formatINR(product.price)}</span>}
        </div>

        {product.desc && <p className="text-sm text-[#2b2823]/55 mt-2 leading-relaxed">{product.desc}</p>}

        {hasVariants && (
          <div className="flex flex-wrap gap-2 mt-4">
            {product.sizes.map((s) => (
              <button
                key={s}
                data-testid={`variant-${product.id}-${s.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                onClick={() => setVariant(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors duration-300 ${
                  variant === s ? "bg-[#2b2823] text-[#f8f6f2] border-[#2b2823]" : "border-[#2b2823]/25 text-[#2b2823]/70 hover:border-[#2b2823]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5">
          {product.enquire || product.price == null ? (
            <Link
              to="/contact"
              data-testid={`enquire-${product.id}`}
              className="inline-flex items-center gap-2 text-sm border border-[#2b2823] rounded-full px-6 py-2.5 hover:bg-[#2b2823] hover:text-[#f8f6f2] transition-colors duration-300"
            >
              Enquire · Priced by weight
            </Link>
          ) : (
            <button
              onClick={() => add(product, variant, 1)}
              data-testid={`add-${product.id}`}
              className="group/btn inline-flex items-center gap-2 text-sm bg-[#2b2823] text-[#f8f6f2] rounded-full px-6 py-2.5 hover:bg-[#395439] transition-colors duration-300"
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
