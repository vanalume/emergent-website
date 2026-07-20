import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const CartContext = createContext(null);
const KEY = "vanalume_cart";

const lineKey = (id, variant) => `${id}::${variant || ""}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((product, variant = null, qty = 1) => {
    setItems((prev) => {
      const key = lineKey(product.id, variant);
      const found = prev.find((i) => lineKey(i.id, i.variant) === key);
      if (found) {
        return prev.map((i) => (lineKey(i.id, i.variant) === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        { id: product.id, name: product.name, collection: product.collection, price: product.price, image: product.image, variant, qty },
      ];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((id, variant) => {
    setItems((prev) => prev.filter((i) => lineKey(i.id, i.variant) !== lineKey(id, variant)));
  }, []);

  const setQty = useCallback((id, variant, qty) => {
    setItems((prev) =>
      prev
        .map((i) => (lineKey(i.id, i.variant) === lineKey(id, variant) ? { ...i, qty: Math.max(1, qty) } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + (i.price || 0) * i.qty, 0), [items]);

  const value = { items, add, remove, setQty, clear, count, subtotal, open, setOpen };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
