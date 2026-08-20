import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCart, formatINR } from "@/context/CartContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function loadRazorpay() {
  return new Promise(res => {
    if (window.Razorpay) return res(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true); s.onerror = () => res(false);
    document.body.appendChild(s);
  });
}

const FIELDS = [
  { name: "name", label: "Full name", col: "md:col-span-2" },
  { name: "email", label: "Email", col: "" },
  { name: "phone", label: "Phone", col: "" },
  { name: "address", label: "Address", col: "md:col-span-2" },
  { name: "city", label: "City", col: "" },
  { name: "pincode", label: "Pincode", col: "" },
];

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, shipping, total, clear } = useCart();
  const [view, setView] = useState("cart");
  const [c, setC] = useState({ name: "", email: "", phone: "", address: "", city: "", pincode: "" });
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open) window.__lenis?.stop(); else window.__lenis?.start(); }, [open]);
  useEffect(() => { if (open && items.length > 0 && view === "done") setView("cart"); }, [open, items.length, view]);

  const set = (k, v) => { setC(p => ({ ...p, [k]: v })); setErr(e => ({ ...e, [k]: undefined })); };
  const validate = () => {
    const e = {};
    if (!c.name.trim()) e.name = "Required";
    if (!c.email.trim() || !EMAIL_RE.test(c.email)) e.email = "Valid email required";
    if (!c.phone.trim()) e.phone = "Required";
    if (!c.address.trim()) e.address = "Required";
    if (!c.city.trim()) e.city = "Required";
    if (!c.pincode.trim()) e.pincode = "Required";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const place = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/orders`, {
        items: items.map(i => ({ product_id: i.id, quantity: i.qty, variant: i.variant || null })),
        customer: c,
      });
      if (data.payment_configured && data.razorpay_order_id) {
        const ok = await loadRazorpay();
        if (!ok) { toast.error("Could not load payment."); setLoading(false); return; }
        const rzp = new window.Razorpay({
          key: data.razorpay_key_id, amount: data.amount * 100, currency: "INR",
          name: "Vanalume", description: "Composed Living",
          order_id: data.razorpay_order_id,
          prefill: { name: c.name, email: c.email, contact: c.phone },
          theme: { color: "#395439" },
          handler: async (r) => {
            try {
              await axios.post(`${API}/orders/verify`, {
                order_id: data.order_id, razorpay_order_id: r.razorpay_order_id,
                razorpay_payment_id: r.razorpay_payment_id, razorpay_signature: r.razorpay_signature,
              });
              clear(); setView("done"); toast.success("Payment successful.");
            } catch { toast.error("Payment could not be verified."); }
          },
          modal: { ondismiss: () => setLoading(false) },
        });
        rzp.open(); setLoading(false);
      } else {
        clear(); setView("done");
        toast.success("Order received. Payment will be arranged shortly.");
        setLoading(false);
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-[#2b2320]/40 backdrop-blur-sm" />
          <motion.aside data-testid="cart-drawer"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 z-[61] h-full w-full sm:w-[460px] bg-[#f8f6f2] flex flex-col">
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#2b2320]/10">
              <span className="font-display text-2xl">{view === "checkout" ? "Checkout" : view === "done" ? "Thank you" : "Your Cart"}</span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2"><X size={20} /></button>
            </div>

            {view === "done" ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                <div className="h-16 w-16 rounded-full bg-[#395439] flex items-center justify-center"><Check className="text-[#f8f6f2]" size={30} /></div>
                <h3 className="font-display text-3xl mt-6">Order placed</h3>
                <p className="text-[#2b2320]/70 mt-3 text-sm leading-relaxed">A confirmation is on its way to your email. Thank you.</p>
                <button onClick={() => setOpen(false)} className="mt-8 border border-[#2b2320] rounded-full px-8 py-3 text-sm hover:bg-[#2b2320] hover:text-[#f8f6f2] transition-colors">Continue browsing</button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#2b2320]/60 px-8 text-center">
                <ShoppingBag size={40} strokeWidth={1} />
                <p className="mt-4 font-display text-2xl text-[#2b2320]">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto vl-hide-scrollbar px-6 py-5" data-lenis-prevent>
                  {view === "cart" ? (
                    <div className="space-y-5">
                      {items.map(i => (
                        <div key={`${i.id}-${i.variant}`} className="flex gap-4">
                          <div className="h-20 w-20 rounded-sm overflow-hidden bg-[#e6dfd3] shrink-0">
                            <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-display text-lg leading-tight truncate">{i.name}</p>
                                {i.variant && <p className="text-xs text-[#5c3e2b] mt-0.5">{i.variant}</p>}
                              </div>
                              <button onClick={() => remove(i.id, i.variant)} aria-label="Remove" className="text-[#2b2320]/40 hover:text-[#9a3b2e]"><Trash2 size={16} /></button>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center border border-[#2b2320]/20 rounded-full">
                                <button onClick={() => setQty(i.id, i.variant, i.qty - 1)} className="p-2"><Minus size={13} /></button>
                                <span className="w-7 text-center text-sm">{i.qty}</span>
                                <button onClick={() => setQty(i.id, i.variant, i.qty + 1)} className="p-2"><Plus size={13} /></button>
                              </div>
                              <span className="text-sm">{formatINR(i.price * i.qty)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {FIELDS.map(f => (
                        <div key={f.name} className={f.col}>
                          <label className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b]">{f.label} *</label>
                          <input value={c[f.name]} onChange={e => set(f.name, e.target.value)}
                            className="w-full mt-1.5 bg-transparent border-b border-[#2b2320]/25 focus:border-[#2b2320] outline-none py-2 text-base" />
                          {err[f.name] && <p className="text-xs text-[#9a3b2e] mt-1">{err[f.name]}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-[#2b2320]/10 px-6 py-5">
                  <div className="text-sm space-y-1 mb-3">
                    <div className="flex justify-between text-[#2b2320]/70"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
                    <div className="flex justify-between text-[#2b2320]/70"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
                  </div>
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-sm text-[#2b2320]/70">Total</span>
                    <span className="font-display text-2xl">{formatINR(total)}</span>
                  </div>
                  {view === "cart" ? (
                    <button onClick={() => setView("checkout")} className="group w-full bg-[#2b2320] text-[#f8f6f2] rounded-full py-4 text-sm tracking-wide hover:bg-[#395439] flex items-center justify-center gap-2">
                      Checkout <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button onClick={place} disabled={loading} className="group w-full bg-[#2b2320] text-[#f8f6f2] rounded-full py-4 text-sm tracking-wide hover:bg-[#395439] disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? "Processing…" : "Place Order"} <ArrowRight size={15} />
                    </button>
                  )}
                  {view === "checkout" && (
                    <button onClick={() => setView("cart")} className="w-full text-center text-xs tracking-[0.14em] uppercase text-[#5c3e2b] mt-4">Back to cart</button>
                  )}
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
