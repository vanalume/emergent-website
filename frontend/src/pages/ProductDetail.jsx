import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ChevronRight, ArrowRight, Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart, formatINR } from "@/context/CartContext";
import { Reveal, Kicker } from "@/components/Motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add, buyNow } = useCart();

  const [data, setData] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [variant, setVariant] = useState(null);
  const [size, setSize] = useState(null);

  useEffect(() => {
    axios.get(`${API}/products`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { setImgIdx(0); }, [id]);
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const product = useMemo(() => data.products.find(p => p.id === id), [data.products, id]);
  const category = useMemo(
    () => product ? data.categories.find(c => c.id === product.category) : null,
    [data.categories, product]
  );

  useEffect(() => {
    if (!product) return;
    setVariant(product.variants?.[0]?.label ?? null);
    setSize(product.sizes?.[0]?.label ?? null);
  }, [product]);

  const chosenVariant = product?.variants?.find(v => v.label === variant) || null;
  const chosenSize = product?.sizes?.find(s => s.label === size) || null;

  const images = useMemo(() => {
    if (!product) return [];
    const base = product.images || [];
    const primary = chosenSize?.image || chosenVariant?.image;
    if (primary) return [primary, ...base.filter(x => x !== primary)];
    return base;
  }, [product, chosenVariant, chosenSize]);

  const imageCrops = product?.image_crops || [];
  const currentCrop = imageCrops[imgIdx] || null;
  const cropStyle = currentCrop
    ? { height: "200%", top: currentCrop === "top" ? 0 : "auto", bottom: currentCrop === "bottom" ? 0 : "auto", left: 0, right: 0, position: "absolute", objectFit: "cover", width: "100%" }
    : null;

  const sp = chosenSize?.sp ?? chosenVariant?.sp ?? product?.sp ?? 0;
  const mrp = chosenSize?.mrp ?? chosenVariant?.mrp ?? product?.mrp ?? 0;
  const save = mrp > sp ? Math.round(((mrp - sp) / mrp) * 100) : 0;
  const desc = chosenSize?.desc || product?.long_desc || product?.desc;

  const related = useMemo(
    () => product ? data.products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4) : [],
    [data.products, product]
  );

  if (loading) return <div className="pt-40 text-center text-[#5c3e2b]/60 font-display text-2xl">Loading…</div>;
  if (!product) return (
    <div className="pt-40 pb-20 text-center">
      <p className="font-display text-3xl">Product not found.</p>
      <Link to="/shop" className="inline-block mt-6 border border-[#2b2320] rounded-full px-8 py-3 text-sm">Back to Shop</Link>
    </div>
  );

  const doAdd = () => { add(product, { variant, size, qty: 1 }); };
  const doBuyNow = () => { buyNow(product, { variant, size, qty: 1 }); toast.success("Redirecting to checkout"); };

  const prev = () => setImgIdx((imgIdx - 1 + images.length) % images.length);
  const next = () => setImgIdx((imgIdx + 1) % images.length);

  return (
    <div data-testid="product-detail-page" className="pt-32 md:pt-36 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Breadcrumb */}
        <nav className="text-xs tracking-[0.16em] uppercase text-[#5c3e2b]/80 flex gap-2 items-center mb-8">
          <Link to="/" className="hover:text-[#2b2320]">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#2b2320]">Shop</Link>
          {category && (<><span>/</span><span className="text-[#2b2320]">{category.title}</span></>)}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
          {/* --------- Gallery --------- */}
          <div>
            <div className="relative overflow-hidden rounded-sm bg-[#ece3d4] aspect-[4/5]">
              {currentCrop ? (
                <img
                  key={images[imgIdx]}
                  src={images[imgIdx]}
                  alt={product.name}
                  style={cropStyle}
                />
              ) : (
                <img
                  key={images[imgIdx]}
                  src={images[imgIdx]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              )}
              {images.length > 1 && (
                <>
                  <button data-testid="pdp-prev" onClick={prev} aria-label="Previous image"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[#f8f6f2]/90 text-[#2b2320] flex items-center justify-center hover:bg-[#f8f6f2]">
                    <ChevronLeft size={18} />
                  </button>
                  <button data-testid="pdp-next" onClick={next} aria-label="Next image"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[#f8f6f2]/90 text-[#2b2320] flex items-center justify-center hover:bg-[#f8f6f2]">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {images.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setImgIdx(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`h-20 w-20 rounded-sm overflow-hidden bg-[#ece3d4] transition-opacity ${
                      i === imgIdx ? "opacity-100 ring-1 ring-[#2b2320]" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --------- Details --------- */}
          <div>
            <Kicker>{category?.title || product.collection}</Kicker>
            <h1 data-testid="pdp-name" className="font-display text-5xl md:text-6xl tracking-tight mt-4 leading-none">{product.name}</h1>

            {product.fragrances?.length > 0 && (
              <p className="text-sm text-[#5c3e2b] mt-4 tracking-wide">{product.fragrances.join(" · ")}</p>
            )}

            <div className="flex items-baseline gap-4 mt-7">
              <span data-testid="pdp-sp" className="font-display text-4xl">{formatINR(sp)}</span>
              {mrp > sp && (
                <>
                  <span className="text-xl text-[#2b2320]/40 line-through">{formatINR(mrp)}</span>
                  <span className="text-xs tracking-[0.12em] uppercase text-[#395439]">Save {save}%</span>
                </>
              )}
            </div>

            {desc && (
              <p className="text-base text-[#2b2320]/75 mt-6 leading-relaxed">{desc}</p>
            )}

            {/* Size */}
            {product.sizes?.length > 0 && (
              <div className="mt-7">
                <p className="text-[10px] tracking-[0.18em] uppercase text-[#5c3e2b] mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button
                      key={s.label}
                      onClick={() => setSize(s.label)}
                      data-testid={`pdp-size-${s.label.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}`}
                      className={`text-sm px-4 py-2 rounded-full border transition-colors duration-300 ${
                        size === s.label ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/25 text-[#2b2320]/75 hover:border-[#2b2320]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colour / Variant */}
            {product.variants?.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] tracking-[0.18em] uppercase text-[#5c3e2b] mb-2">
                  {product.sizes?.length > 0 ? "Colour" : "Choose fragrance"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.label}
                      onClick={() => setVariant(v.label)}
                      className={`text-sm px-4 py-2 rounded-full border transition-colors duration-300 ${
                        variant === v.label ? "bg-[#2b2320] text-[#f8f6f2] border-[#2b2320]" : "border-[#2b2320]/25 text-[#2b2320]/75 hover:border-[#2b2320]"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-9">
              <button
                onClick={doAdd}
                data-testid="pdp-add-to-cart"
                className="group inline-flex items-center justify-center gap-2 bg-[#2b2320] text-[#f8f6f2] rounded-full px-8 py-4 text-sm tracking-wide hover:bg-[#395439] transition-colors duration-300 flex-1"
              >
                Add to Cart <Plus size={15} className="transition-transform duration-300 group-hover:rotate-90" />
              </button>
              <button
                onClick={doBuyNow}
                data-testid="pdp-buy-now"
                className="group inline-flex items-center justify-center gap-2 border border-[#2b2320] text-[#2b2320] rounded-full px-8 py-4 text-sm tracking-wide hover:bg-[#2b2320] hover:text-[#f8f6f2] transition-colors duration-300 flex-1"
              >
                Buy Now <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            {/* Includes */}
            {product.includes?.length > 0 && (
              <div className="mt-10 border-t border-[#2b2320]/10 pt-7">
                <p className="text-[10px] tracking-[0.18em] uppercase text-[#5c3e2b] mb-3">What's inside</p>
                <ul className="space-y-2">
                  {product.includes.map((line, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#2b2320]/80">
                      <Check size={16} className="mt-0.5 text-[#395439] shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ship promise */}
            <div className="mt-8 text-xs text-[#5c3e2b]/85 tracking-wide">
              ₹100 flat shipping within India. Free above ₹2,000.
            </div>
          </div>
        </div>

        {/* --------- Ritual --------- */}
        {product.ritual && (
          <section data-testid="pdp-ritual" className="mt-24 md:mt-32 bg-[#2b2320] text-[#f8f6f2] rounded-sm px-6 md:px-16 py-16 md:py-20">
            <Reveal>
              <Kicker className="text-[#e6b980]">The Ritual</Kicker>
              <h2 className="font-display text-3xl md:text-5xl mt-4 leading-tight max-w-2xl">{product.ritual.title}</h2>
            </Reveal>
            <ol className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-8 max-w-4xl">
              {product.ritual.steps.map((step, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <li className="flex gap-5">
                    <span className="font-display text-3xl text-[#e6b980] shrink-0 leading-none">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-[15px] leading-relaxed text-[#f8f6f2]/85">{step}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </section>
        )}

        {/* --------- Related --------- */}
        {related.length > 0 && (
          <section className="mt-24 md:mt-32">
            <Reveal><Kicker>You may also like</Kicker></Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-display text-3xl md:text-5xl tracking-tight mt-3">More from {category?.title}</h2>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-10">
              {related.map(r => (
                <Link key={r.id} to={`/product/${r.id}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden rounded-sm bg-[#ece3d4]">
                    <img src={r.images?.[0]} alt={r.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-3">
                    <p className="font-display text-lg leading-tight">{r.name}</p>
                    <p className="text-sm shrink-0">{formatINR(r.sp)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
