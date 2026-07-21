import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function ProductCard({ product }) {
  const hasVariants = Array.isArray(product.sizes) && product.sizes.length > 0;

  return (
    <Link to="/contact" data-testid={`product-${product.id}`} className="group flex flex-col">
      <div className="relative overflow-hidden rounded-sm bg-[#ece3d4] aspect-[4/5]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-[#5c3e2b]/12" />
        <div className="absolute inset-0 bg-[#2b2823]/0 group-hover:bg-[#2b2823]/10 transition-colors duration-500" />
        <span className="absolute top-4 right-4 h-9 w-9 rounded-full bg-[#f5f1ea] text-[#2b2823] flex items-center justify-center opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <ArrowUpRight size={16} />
        </span>
      </div>

      <div className="mt-4 flex-1 flex flex-col">
        <h3 className="font-display text-2xl leading-tight group-hover:text-[#5c3e2b] transition-colors duration-300">{product.name}</h3>
        {product.fragrances?.length > 0 && (
          <p className="text-xs text-[#5c3e2b] mt-1 tracking-wide">{product.fragrances.join(" · ")}</p>
        )}
        {product.desc && <p className="text-sm text-[#2b2823]/55 mt-2 leading-relaxed">{product.desc}</p>}

        {hasVariants && (
          <div className="flex flex-wrap gap-2 mt-4">
            {product.sizes.map((s) => (
              <span key={s} className="text-xs px-3 py-1.5 rounded-full border border-[#5c3e2b]/25 text-[#5c3e2b]/80">{s}</span>
            ))}
          </div>
        )}

        <span className="mt-5 inline-flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase text-[#5c3e2b]">
          Enquire
          <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
