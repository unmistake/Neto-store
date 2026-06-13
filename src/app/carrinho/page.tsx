"use client";

import { useCart } from "@/components/CartProvider";
import { formatMoney, productMeasure } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <main className="texture min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[color:var(--brand)]">
              Sua seleção
            </p>
            <h1 className="display-font mt-2 text-5xl font-black sm:text-6xl">Carrinho</h1>
          </div>
          {items.length > 0 ? (
            <button
              type="button"
              onClick={clearCart}
              className="rounded-full border border-[color:var(--line)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] hover:bg-white/70"
            >
              Limpar carrinho
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--card)] p-10 text-center card-shadow sm:p-16">
            <p className="display-font text-3xl font-black">Seu carrinho está vazio.</p>
            <p className="mx-auto mt-3 max-w-md text-[color:var(--muted)]">
              Explore o estoque e adicione pneus ou rodas para montar seu pedido.
            </p>
            <Link
              href="/"
              className="mt-7 inline-block rounded-2xl bg-[color:var(--brand)] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map(({ product, quantity }) => (
                <article
                  key={product.id}
                  className="grid gap-4 rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--card)] p-4 card-shadow sm:grid-cols-[150px_1fr]"
                >
                  <Link
                    href={`/produto/${product.id}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-200 sm:aspect-square"
                  >
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-col justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--brand)]">
                        {[product.brand, product.model].filter(Boolean).join(" / ") || "Neto Rodas"}
                      </p>
                      <Link
                        href={`/produto/${product.id}`}
                        className="display-font mt-1 block text-2xl font-black leading-tight hover:text-[color:var(--brand)]"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm font-bold text-[color:var(--muted)]">
                        {productMeasure(product)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center rounded-full border border-[color:var(--line)] bg-white/65 p-1">
                        <button
                          type="button"
                          aria-label={`Diminuir quantidade de ${product.name}`}
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-black hover:bg-[color:var(--paper)]"
                        >
                          −
                        </button>
                        <span className="min-w-10 text-center font-black">{quantity}</span>
                        <button
                          type="button"
                          aria-label={`Aumentar quantidade de ${product.name}`}
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= Math.max(1, product.stock_qty)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-black hover:bg-[color:var(--paper)] disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="display-font text-2xl font-black">
                          {formatMoney(product.price * quantity)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--brand)]"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-[2rem] bg-[color:var(--night)] p-6 text-white card-shadow lg:sticky lg:top-24">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">
                Resumo
              </p>
              <div className="mt-6 flex items-center justify-between border-b border-white/15 pb-5">
                <span className="text-stone-300">Subtotal</span>
                <strong className="display-font text-3xl">{formatMoney(subtotal)}</strong>
              </div>
              <p className="mt-5 text-sm leading-6 text-stone-300">
                Frete, endereço de entrega e pagamento serão adicionados na próxima etapa do checkout.
              </p>
              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-2xl bg-[color:var(--brand)] px-5 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[color:var(--brand-dark)]"
              >
                Ir para o checkout
              </Link>
              <Link
                href="/"
                className="mt-3 block text-center text-xs font-black uppercase tracking-[0.14em] text-orange-200"
              >
                Continuar comprando
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
