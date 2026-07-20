import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/data";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const CUSTOMER_FIELDS = [
  { name: "name", label: "Full name", required: true, col: "md:col-span-2" },
  { name: "email", label: "Email", required: true, col: "" },
  { name: "phone", label: "Phone", required: true, col: "" },
  { name: "address", label: "Address", required: true, col: "md:col-span-2" },
  { name: "city", label: "City", required: false, col: "" },
  { name: "pincode", label: "Pincode", required: false, col: "" },
];

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, clear } = useCart();
  const [view, setView] = useState("cart"); // cart | checkout | done
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "", city: "", pincode: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const close = () => { setOpen(false); };

  useEffect(() => {
    if (open && items.length > 0) setView("cart");
  }, [open, items.length]);

  const setField = (k, v) => { setCustomer((c) => ({ ...c, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!customer.name.trim()) e.name = "Required";
    if (!customer.email.trim() || !EMAIL_RE.test(customer.email)) e.email = "Valid email required";
    if (!customer.phone.trim()) e.phone = "Required";
    if (!customer.address.trim()) e.address = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ product_id: i.id, quantity: i.qty, variant: i.variant || null })),
        customer,
      };
      const { data } = await axios.post(`${API}/orders`, payload);

      if (data.payment_configured && data.razorpay_order_id) {
        const ok = await loadRazorpay();
        if (!ok) { toast.error("Could not load payment. Try again."); setLoading(false); return; }
        const rzp = new window.Razorpay({
          key: data.razorpay_key_id,
          amount: data.amount * 100,
          currency: "INR",
          name: "Vanalume",
          description: "Composed Living",
          order_id: data.razorpay_order_id,
          prefill: { name: customer.name, email: customer.email, contact: customer.phone },
          theme: { color: "#395439" },
          handler: async (resp) => {
            try {
              await axios.post(`${API}/orders/verify`, {
                order_id: data.order_id,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              });
              clear();
              setView("done");
              toast.success("Payment successful. Thank you.");
            } catch {
              toast.error("Payment could not be verified. We'll be in touch.");
            }
          },
          modal: { ondismiss: () => setLoading(false) },
        });
        rzp.open();
        setLoading(false);
      } else {
        // Payments not yet configured — order captured in DB
        clear();
        setView("done");
        toast.success("Order received — we'll reach out to confirm payment & delivery.");
        setLoading(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-[#2b2823]/40 backdrop-blur-sm"
          />
          <motion.aside
            data-testid="cart-drawer"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 z-[61] h-full w-full sm:w-[440px] bg-[#f8f6f2] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#2b2823]/10">
              <span className="font-display text-2xl">{view === "checkout" ? "Checkout" : view === "done" ? "Thank you" : "Your Cart"}</span>
              <button onClick={close} data-testid="cart-close" aria-label="Close cart" className="p-2"><X size={20} /></button>
            </div>

            {view === "done" ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center" data-testid="cart-done">
                <div className="h-16 w-16 rounded-full bg-[#395439] flex items-center justify-center"><Check className="text-[#f8f6f2]" size={30} /></div>
                <h3 className="font-display text-3xl mt-6">Order placed</h3>
                <p className="text-[#2b2823]/70 mt-3 text-sm leading-relaxed">A confirmation is on its way. Thank you for choosing a slower, more composed way of living.</p>
                <button onClick={close} className="mt-8 border border-[#2b2823] rounded-full px-8 py-3 text-sm hover:bg-[#2b2823] hover:text-[#f8f6f2] transition-colors">Continue browsing</button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center text-[#2b2823]/60">
                <ShoppingBag size={40} strokeWidth={1} />
                <p className="mt-4 font-display text-2xl text-[#2b2823]">Your cart is empty</p>
                <p className="text-sm mt-2">Discover candles made for ritual.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto vl-hide-scrollbar px-6 py-5">
                  {view === "cart" && (
                    <div className="space-y-6">
                      {items.map((i) => (
                        <div key={`${i.id}-${i.variant}`} data-testid={`cart-item-${i.id}`} className="flex gap-4">
                          <div className="h-20 w-20 rounded-sm overflow-hidden bg-[#e6dfd3] shrink-0">
                            <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-display text-lg leading-tight truncate">{i.name}</p>
                                {i.variant && <p className="text-xs text-[#5c3e2b] mt-0.5">{i.variant}</p>}
                              </div>
                              <button onClick={() => remove(i.id, i.variant)} data-testid={`cart-remove-${i.id}`} aria-label="Remove" className="text-[#2b2823]/40 hover:text-[#9a3b2e] transition-colors"><Trash2 size={16} /></button>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center border border-[#2b2823]/20 rounded-full">
                                <button onClick={() => setQty(i.id, i.variant, i.qty - 1)} data-testid={`cart-dec-${i.id}`} className="p-2"><Minus size={13} /></button>
                                <span className="w-7 text-center text-sm" data-testid={`cart-qty-${i.id}`}>{i.qty}</span>
                                <button onClick={() => setQty(i.id, i.variant, i.qty + 1)} data-testid={`cart-inc-${i.id}`} className="p-2"><Plus size={13} /></button>
                              </div>
                              <span className="text-sm">{formatINR(i.price * i.qty)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {view === "checkout" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {CUSTOMER_FIELDS.map((f) => (
                        <div key={f.name} className={f.col}>
                          <label className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b]">{f.label}{f.required && " *"}</label>
                          <input
                            data-testid={`checkout-${f.name}`}
                            value={customer[f.name]}
                            onChange={(e) => setField(f.name, e.target.value)}
                            className="w-full mt-1.5 bg-transparent border-b border-[#2b2823]/25 focus:border-[#2b2823] outline-none py-2 text-base transition-colors"
                          />
                          {errors[f.name] && <p className="text-xs text-[#9a3b2e] mt-1" data-testid={`checkout-error-${f.name}`}>{errors[f.name]}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-[#2b2823]/10 px-6 py-5">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-sm text-[#2b2823]/60">Subtotal</span>
                    <span className="font-display text-2xl" data-testid="cart-subtotal">{formatINR(subtotal)}</span>
                  </div>
                  {view === "cart" ? (
                    <button onClick={() => setView("checkout")} data-testid="cart-checkout-btn" className="group w-full bg-[#2b2823] text-[#f8f6f2] rounded-full py-4 text-sm tracking-wide hover:bg-[#395439] transition-colors flex items-center justify-center gap-2">
                      Checkout <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <button onClick={placeOrder} disabled={loading} data-testid="checkout-place-order" className="group w-full bg-[#2b2823] text-[#f8f6f2] rounded-full py-4 text-sm tracking-wide hover:bg-[#395439] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? "Processing…" : "Place Order"} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
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
