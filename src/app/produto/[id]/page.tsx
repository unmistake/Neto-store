import { formatMoney, getProduct, productDescription, productMeasure, whatsappLink } from "@/lib/products";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) return { title: "Produto não encontrado | Neto Rodas" };

  return {
    title: `${product.name} | Neto Rodas`,
    description: productDescription(product),
    alternates: { canonical: `/produto/${product.id}` },
    openGraph: {
      title: product.name,
      description: productDescription(product),
      images: [product.image_url],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) notFound();

  const description = productDescription(product);
  const cars = Array.isArray(product.cars) ? product.cars : [];
  const productUrl = `https://www.netorodas.com.br/produto/${product.id}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    image: [product.image_url],
    sku: product.sku || `ERP-${product.id}`,
    ...(product.gtin ? { gtin: product.gtin } : {}),
    ...(product.mpn ? { mpn: product.mpn } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    itemCondition:
      product.item_condition === "novo"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "BRL",
      price: product.price.toFixed(2),
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Neto Rodas" },
    },
  };

  return (
    <main className="texture min-h-screen px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <section className="mx-auto max-w-7xl">
        <nav className="mb-5 text-sm font-bold text-[color:var(--muted)]">
          <Link href="/" className="hover:text-[color:var(--brand)]">Loja</Link>
          <span className="px-2">/</span>
          <span>{product.name}</span>
        </nav>

        <article className="grid overflow-hidden rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--card)] card-shadow lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[360px] bg-stone-200 sm:min-h-[520px]">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[color:var(--brand)]">
              {[product.brand, product.model].filter(Boolean).join(" / ") || "Neto Rodas"}
            </p>
            <h1 className="display-font mt-3 text-4xl font-black leading-none sm:text-6xl">{product.name}</h1>
            <p className="mt-4 text-lg font-bold text-[color:var(--muted)]">{productMeasure(product)}</p>
            <p className="mt-6 leading-7 text-[color:var(--muted)]">{description}</p>

            <div className="mt-7 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/70 p-4">
                <p className="font-black uppercase tracking-[0.14em] text-[color:var(--muted)]">Condição</p>
                <p className="mt-1 text-lg font-black">{product.item_condition === "novo" ? "Novo" : "Usado"}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4">
                <p className="font-black uppercase tracking-[0.14em] text-[color:var(--muted)]">Disponibilidade</p>
                <p className="mt-1 text-lg font-black">{product.available ? "Em estoque" : "Fora de estoque"}</p>
              </div>
            </div>

            {cars.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">Compatibilidade cadastrada</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {cars.map((car) => (
                    <span key={car} className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs font-bold">
                      {car}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 border-t border-[color:var(--line)] pt-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">Preço</p>
              <p className="display-font mt-1 text-4xl font-black">{formatMoney(product.price)}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">Frete e prazo são informados antes da confirmação do pedido.</p>
            </div>

            <Link
              href={whatsappLink(product)}
              target="_blank"
              className="mt-6 rounded-2xl bg-[color:var(--brand)] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[color:var(--brand-dark)]"
            >
              Comprar pelo WhatsApp
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
