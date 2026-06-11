"use client";

import { useCart } from "@/components/CartProvider";
import type { StoreProduct } from "@/lib/products";
import { useState } from "react";

export function AddToCartButton({ product }: { product: StoreProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!product.available || product.price <= 0}
      className="mt-6 w-full rounded-2xl bg-[color:var(--brand)] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[color:var(--brand-dark)] disabled:cursor-not-allowed disabled:bg-stone-400"
    >
      {added
        ? "Produto adicionado"
        : product.available && product.price > 0
          ? "Adicionar ao carrinho"
          : "Produto indisponível"}
    </button>
  );
}
