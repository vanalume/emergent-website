import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const CartContext = createContext(null);
const KEY = "vanalume_cart_v2";
const lineKey = (id, variant, size) => `${id}::${variant || ""}::${size || ""}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const add = useCallback((product, { variant = null, size = null, qty = 1 } = {}) => {
    const chosenV = variant && product.variants ? product.variants.find(v => v.label === variant) : null;
    const chosenS = size && product.sizes ? product.sizes.find(s => s.label === size) : null;
    const price = chosenS?.sp ?? chosenV?.sp ?? product.sp;
    const image = chosenV?.image ?? (product.images?.[0] || product.image);
    setItems(prev => {
      const k = lineKey(product.id, variant, size);
      const found = prev.find(i => lineKey(i.id, i.variant, i.size) === k);
      if (found) return prev.map(i => lineKey(i.id, i.variant, i.size) === k ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { id: product.id, name: product.name, collection: product.collection, price, image, variant, size, qty }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((id, variant, size) => {
    setItems(prev => prev.filter(i => lineKey(i.id, i.variant, i.size) !== lineKey(id, variant, size)));
  }, []);
  const setQty = useCallback((id, variant, size, qty) => {
    setItems(prev => prev.map(i => lineKey(i.id, i.variant, i.size) === lineKey(id, variant, size) ? { ...i, qty: Math.max(1, qty) } : i));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  // Buy Now: add and open the drawer straight in checkout mode
  const [buyNowFlag, setBuyNowFlag] = useState(false);
  const buyNow = useCallback((product, opts = {}) => {
    add(product, opts);
    setBuyNowFlag(true);
    setOpen(true);
  }, [add]);
  const consumeBuyNow = useCallback(() => setBuyNowFlag(false), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + (i.price || 0) * i.qty, 0), [items]);
  const shipping = subtotal === 0 ? 0 : (subtotal >= 2000 ? 0 : 100);
  const total = subtotal + shipping;

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, subtotal, shipping, total, open, setOpen, buyNow, buyNowFlag, consumeBuyNow }}>
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
