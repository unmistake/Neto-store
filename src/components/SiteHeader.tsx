"use client";

import { useCart } from "@/components/CartProvider";
import Link from "next/link";

export function SiteHeader() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[color:var(--paper)]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="display-font text-xl font-black tracking-tight sm:text-2xl">
          NETO <span className="text-[color:var(--brand)]">RODAS</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition hover:bg-white/70 sm:block"
          >
            Minha conta
          </Link>
          <Link
            href="/carrinho"
            className="flex items-center gap-2 rounded-full bg-[color:var(--night)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-[color:var(--brand)]"
          >
            Carrinho
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[color:var(--brand)] px-1 text-[11px] text-white">
              {totalItems}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
