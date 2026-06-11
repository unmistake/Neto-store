"use client";

import type { StoreProduct } from "@/lib/products";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  product: StoreProduct;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: StoreProduct, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "neto-rodas-cart";
const CartContext = createContext<CartContextValue | null>(null);

function maxQuantity(product: StoreProduct): number {
  return Math.max(1, Number(product.stock_qty) || 1);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as CartItem[];
      if (Array.isArray(parsed)) {
        setItems(
          parsed.filter(
            (item) =>
              item &&
              Number.isInteger(item.product?.id) &&
              item.product.id > 0 &&
              Number.isInteger(item.quantity) &&
              item.quantity > 0,
          ),
        );
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (product: StoreProduct, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => item.product.id === product.id);
        const nextQuantity = Math.min(
          (existing?.quantity ?? 0) + Math.max(1, quantity),
          maxQuantity(product),
        );

        if (existing) {
          return current.map((item) =>
            item.product.id === product.id
              ? { product, quantity: nextQuantity }
              : item,
          );
        }

        return [...current, { product, quantity: nextQuantity }];
      });
    };

    const updateQuantity = (productId: number, quantity: number) => {
      setItems((current) =>
        current
          .map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity: Math.min(Math.max(0, quantity), maxQuantity(item.product)),
                }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
    };

    return {
      items,
      totalItems: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + Number(item.product.price || 0) * item.quantity,
        0,
      ),
      addItem,
      updateQuantity,
      removeItem: (productId) =>
        setItems((current) => current.filter((item) => item.product.id !== productId)),
      clearCart: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de CartProvider.");
  return context;
}
