import Image from "next/image";
import Link from "next/link";
import { formatMoney, productMeasure, StoreProduct } from "@/lib/products";
import { VisualizeWheelButton } from "@/components/VisualizeWheelButton";

export function ProductCard({ product, index }: { product: StoreProduct; index: number }) {
  const cars = Array.isArray(product.cars) ? product.cars : [];

  return (
    <article
      className="reveal group overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--card)] card-shadow"
      style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
        <Link href={`/produto/${product.id}`} aria-label={`Ver detalhes de ${product.name}`}>
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-black/75 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
            {product.category === "pneu" ? "Pneu" : "Roda"}
          </span>
          <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--ink)] backdrop-blur">
            {product.item_condition === "novo" ? "Novo" : "Usado"}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">
            {[product.brand, product.model].filter(Boolean).join(" / ") || "Neto Rodas"}
          </p>
          <h3 className="mt-2 min-h-16 text-2xl font-extrabold leading-tight display-font">
            <Link href={`/produto/${product.id}`} className="transition hover:text-[color:var(--brand)]">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">{productMeasure(product)}</p>
        </div>

        {cars.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {cars.slice(0, 3).map((car) => (
              <span key={car} className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
                {car}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex items-end justify-between gap-3 border-t border-[color:var(--line)] pt-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">Preço</p>
            <p className="text-2xl font-black text-[color:var(--ink)]">{formatMoney(product.price)}</p>
          </div>
          <p className={`rounded-full px-3 py-1 text-xs font-bold ${product.available ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
            {product.available ? "Disponível" : "Consultar"}
          </p>
        </div>

        <Link
          href={`/produto/${product.id}`}
          className="block rounded-2xl border border-[color:var(--line)] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] transition hover:bg-white"
        >
          Ver detalhes
        </Link>
        {product.category === "roda" ? <VisualizeWheelButton product={product} /> : null}
      </div>
    </article>
  );
}
