import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, Check, ArrowRight, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart, formatINR } from "@/context/CartContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Shiprocket rejects sequences like 9999999999 — enforce a realistic Indian mobile.
const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^\d{6}$/;

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
  { name: "name", label: "Full name", col: "md:col-span-2", placeholder: "Priya Sharma" },
  { name: "email", label: "Email", col: "", placeholder: "you@example.com" },
  { name: "phone", label: "Phone (10-digit mobile)", col: "", placeholder: "9876543210" },
  { name: "address", label: "Address", col: "md:col-span-2", placeholder: "Flat / building, street" },
  { name: "city", label: "City", col: "", placeholder: "Auto-detected", auto: true },
  { name: "state", label: "State", col: "", placeholder: "Auto-detected", auto: true },
  { name: "pincode", label: "Pincode", col: "", placeholder: "110001" },
];

export default function CartDrawer() {
  const {
    items, open, setOpen, setQty, remove, subtotal, shipping, total, clear,
    buyNowFlag, consumeBuyNow,
  } = useCart();

  const [view, setView] = useState("cart");
  const [c, setC] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null); // { order_id, amount, shipment }
  const [pinStatus, setPinStatus] = useState("idle"); // idle | loading | done | error

  useEffect(() => { if (open) window.__lenis?.stop(); else window.__lenis?.start(); }, [open]);

  // Reset when the drawer opens
  useEffect(() => {
    if (!open) return;
    if (buyNowFlag && items.length > 0) {
      setView("checkout");
      consumeBuyNow();
    } else if (view === "done" && items.length > 0) {
      setView("cart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (k, v) => {
    setC(p => ({ ...p, [k]: v }));
    setErr(e => ({ ...e, [k]: undefined }));
  };

  const detectPincode = async (pin) => {
    setPinStatus("loading");
    try {
      const { data } = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
      const postOffice = data?.[0]?.PostOffice?.[0];
      if (data?.[0]?.Status === "Success" && postOffice) {
        setC(p => ({ ...p, city: postOffice.District || postOffice.Name || "", state: postOffice.State || "" }));
        setPinStatus("done");
      } else {
        setPinStatus("error");
      }
    } catch {
      setPinStatus("error");
    }
  };

  const handlePincode = (value) => {
    const pin = value.replace(/\D/g, "").slice(0, 6);
    set("pincode", pin);
    setC(p => ({ ...p, city: "", state: "" }));
    setPinStatus("idle");
    if (pin.length === 6) detectPincode(pin);
  };

  const validate = () => {
    const e = {};
    if (!c.name.trim()) e.name = "Required";
    if (!EMAIL_RE.test(c.email.trim())) e.email = "Valid email required";
    const phone = c.phone.replace(/\D/g, "").replace(/^91/, "");
    if (!INDIAN_MOBILE_RE.test(phone)) e.phone = "10-digit Indian mobile required";
    if (!c.address.trim() || c.address.trim().length < 6) e.address = "A little more detail, please";
    if (!PINCODE_RE.test(c.pincode.trim())) e.pincode = "6-digit pincode";
    else if (!c.city.trim() || !c.state.trim()) e.pincode = "Could not detect your city/state — check the pincode";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const place = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...c, phone: c.phone.replace(/\D/g, "").replace(/^91/, "") };
      const { data } = await axios.post(`${API}/orders`, {
        items: items.map(i => ({ product_id: i.id, quantity: i.qty, variant: i.variant || null, size: i.size || null })),
        customer: payload,
      });

      if (data.payment_configured && data.razorpay_order_id) {
        const ok = await loadRazorpay();
        if (!ok) { toast.error("Could not load payment. Please retry."); setLoading(false); return; }
        const rzp = new window.Razorpay({
          key: data.razorpay_key_id,
          amount: data.amount * 100,
          currency: "INR",
          name: "Vanalume",
          description: "Composed Living",
          order_id: data.razorpay_order_id,
          prefill: { name: payload.name, email: payload.email, contact: payload.phone },
          notes: { order_id: data.order_id },
          theme: { color: "#395439" },
          handler: async (r) => {
            try {
              const verify = await axios.post(`${API}/orders/verify`, {
                order_id: data.order_id,
                razorpay_order_id: r.razorpay_order_id,
                razorpay_payment_id: r.razorpay_payment_id,
                razorpay_signature: r.razorpay_signature,
              });
              setDone({ order_id: data.order_id, amount: data.amount, shipment: verify.data.shipment });
              clear();
              setView("done");
              toast.success("Payment successful.");
            } catch (err) {
              toast.error(err?.response?.data?.detail || "Payment could not be verified.");
            } finally { setLoading(false); }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              toast("Payment cancelled. Your cart is safe.");
            },
          },
        });
        rzp.on("payment.failed", (resp) => {
          toast.error(resp?.error?.description || "Payment failed.");
          setLoading(false);
        });
        rzp.open();
      } else {
        setDone({ order_id: data.order_id, amount: data.amount, shipment: null });
        clear();
        setView("done");
        toast.success("Order received. Payment will be arranged shortly.");
        setLoading(false);
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Something went wrong.");
      setLoading(false);
    }
  };

  const header = view === "checkout" ? "Checkout" : view === "done" ? "Thank you" : "Your Cart";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-[#2b2320]/40 backdrop-blur-sm" />
          <motion.aside data-testid="cart-drawer"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 z-[61] h-full w-full sm:w-[480px] bg-[#f8f6f2] flex flex-col">
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#2b2320]/10">
              <span data-testid="cart-title" className="font-display text-2xl">{header}</span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2"><X size={20} /></button>
            </div>

            {view === "done" ? (
              <div data-testid="cart-done" className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                <div className="h-16 w-16 rounded-full bg-[#395439] flex items-center justify-center"><Check className="text-[#f8f6f2]" size={30} /></div>
                <h3 className="font-display text-3xl mt-6">Order placed</h3>
                {done?.order_id && (
                  <p className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b]/70 mt-4">
                    Order ID · <span className="normal-case tracking-normal text-[#2b2320] font-mono text-[13px]">{done.order_id.slice(0, 8)}</span>
                  </p>
                )}
                {done?.amount && (
                  <p className="text-sm text-[#2b2320]/70 mt-1">Paid {formatINR(done.amount)}</p>
                )}
                {done?.shipment?.shipment_id && (
                  <div className="mt-5 flex items-center gap-2 text-sm text-[#395439]">
                    <Truck size={16} />
                    <span>Shipment queued · #{done.shipment.shipment_id}</span>
                  </div>
                )}
                <p className="text-[#2b2320]/70 mt-6 text-sm leading-relaxed max-w-xs">
                  A confirmation is on its way to your email. We'll share tracking as soon as it ships.
                </p>
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
                        <div key={`${i.id}-${i.variant}-${i.size}`} className="flex gap-4">
                          <div className="h-20 w-20 rounded-sm overflow-hidden bg-[#e6dfd3] shrink-0">
                            <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-display text-lg leading-tight truncate">{i.name}</p>
                                {(i.variant || i.size) && (
                                  <p className="text-xs text-[#5c3e2b] mt-0.5 truncate">
                                    {[i.size, i.variant].filter(Boolean).join(" · ")}
                                  </p>
                                )}
                              </div>
                              <button onClick={() => remove(i.id, i.variant, i.size)} aria-label="Remove" className="text-[#2b2320]/40 hover:text-[#9a3b2e]"><Trash2 size={16} /></button>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center border border-[#2b2320]/20 rounded-full">
                                <button onClick={() => setQty(i.id, i.variant, i.size, i.qty - 1)} className="p-2"><Minus size={13} /></button>
                                <span className="w-7 text-center text-sm">{i.qty}</span>
                                <button onClick={() => setQty(i.id, i.variant, i.size, i.qty + 1)} className="p-2"><Plus size={13} /></button>
                              </div>
                              <span className="text-sm">{formatINR(i.price * i.qty)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {FIELDS.map(f => (
                        <div key={f.name} className={f.col}>
                          <label className="text-xs tracking-[0.14em] uppercase text-[#5c3e2b]">{f.label} *</label>
                          <input
                            data-testid={`checkout-${f.name}`}
                            value={c[f.name]}
                            onChange={e => f.name === "pincode" ? handlePincode(e.target.value) : set(f.name, e.target.value)}
                            placeholder={f.placeholder}
                            disabled={f.auto}
                            className="w-full mt-1.5 bg-transparent border-b border-[#2b2320]/25 focus:border-[#2b2320] outline-none py-2 text-base placeholder:text-[#2b2320]/25 disabled:text-[#2b2320]/60 disabled:cursor-not-allowed disabled:border-[#2b2320]/10"
                          />
                          {err[f.name] && <p className="text-xs text-[#9a3b2e] mt-1">{err[f.name]}</p>}
                        </div>
                      ))}
                    </div>

                    {pinStatus === "loading" && (
                      <p className="text-xs text-[#5c3e2b]/70 mt-3 flex items-center gap-2">
                        <Loader2 size={13} className="animate-spin" /> Detecting your city & state…
                      </p>
                    )}
                    {pinStatus === "error" && (
                      <p className="text-xs text-[#9a3b2e] mt-3">Could not detect city/state for this pincode. Please check it and try again.</p>
                    )}
                    </>
                  )}
                </div>

                <div className="border-t border-[#2b2320]/10 px-6 py-5">
                  <div className="text-sm space-y-1 mb-3">
                    <div className="flex justify-between text-[#2b2320]/70"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
                    <div className="flex justify-between text-[#2b2320]/70"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
                    {shipping > 0 && (
                      <div className="text-[11px] text-[#5c3e2b]/80 pt-1">
                        Add {formatINR(2000 - subtotal)} more for free shipping
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-sm text-[#2b2320]/70">Total</span>
                    <span data-testid="cart-total" className="font-display text-2xl">{formatINR(total)}</span>
                  </div>
                  {view === "cart" ? (
                    <button
                      data-testid="checkout-btn"
                      onClick={() => setView("checkout")}
                      className="group w-full bg-[#2b2320] text-[#f8f6f2] rounded-full py-4 text-sm tracking-wide hover:bg-[#395439] flex items-center justify-center gap-2"
                    >
                      Checkout <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button
                      data-testid="place-order-btn"
                      onClick={place}
                      disabled={loading}
                      className="group w-full bg-[#2b2320] text-[#f8f6f2] rounded-full py-4 text-sm tracking-wide hover:bg-[#395439] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <><Loader2 size={15} className="animate-spin" /> Processing…</> : <>Pay {formatINR(total)} <ArrowRight size={15} /></>}
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
