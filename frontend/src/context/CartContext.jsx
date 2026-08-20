import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const CartContext = createContext(null);
const KEY = "vanalume_cart_v2";
const lineKey = (id, variant) => `${id}::${variant || ""}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const add = useCallback((product, variant = null, qty = 1) => {
    const chosen = variant && product.variants ? product.variants.find(v => v.label === variant) : null;
    const price = chosen?.sp ?? product.sp;
    const image = chosen?.image ?? (product.images?.[0] || product.image);
    setItems(prev => {
      const k = lineKey(product.id, variant);
      const found = prev.find(i => lineKey(i.id, i.variant) === k);
      if (found) return prev.map(i => lineKey(i.id, i.variant) === k ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { id: product.id, name: product.name, collection: product.collection, price, image, variant, qty }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((id, variant) => {
    setItems(prev => prev.filter(i => lineKey(i.id, i.variant) !== lineKey(id, variant)));
  }, []);
  const setQty = useCallback((id, variant, qty) => {
    setItems(prev => prev.map(i => lineKey(i.id, i.variant) === lineKey(id, variant) ? { ...i, qty: Math.max(1, qty) } : i));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + (i.price || 0) * i.qty, 0), [items]);
  const shipping = subtotal === 0 ? 0 : (subtotal >= 2000 ? 0 : 100);
  const total = subtotal + shipping;

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, subtotal, shipping, total, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};

export const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
