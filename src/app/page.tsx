import { ProductCard } from "@/components/ProductCard";
import { StoreFilters } from "@/components/StoreFilters";
import { getProducts } from "@/lib/products";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const params = {
    q: firstParam(rawParams.q),
    category: firstParam(rawParams.category),
    brand: firstParam(rawParams.brand),
    rim: firstParam(rawParams.rim),
    car: firstParam(rawParams.car),
  };
  const products = await getProducts(rawParams);

  return (
    <main className="texture min-h-screen">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--night)] text-white card-shadow">
          <div className="relative grid gap-8 p-7 md:grid-cols-[1.2fr_0.8fr] md:p-10 lg:p-14">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[color:var(--brand)] opacity-30 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-[color:var(--olive)] opacity-30 blur-3xl" />
            <div className="relative">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-200">Neto Rodas Online</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/criar-conta"
                    className="w-fit rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[color:var(--brand-dark)]"
                  >
                    Criar conta
                  </Link>
                  <Link
                    href="/login"
                    className="w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/20"
                  >
                    Área do cliente
                  </Link>
                </div>
              </div>
              <h1 className="display-font max-w-4xl text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl">
                Pneus e rodas com estoque real da loja.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-stone-200">
                Escolha seus produtos e monte o pedido diretamente pelo carrinho. Esta vitrine mostra apenas itens com foto cadastrada no ERP.
              </p>
            </div>
            <div className="relative flex items-end justify-start md:justify-end">
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.22em] text-stone-300">Produtos na vitrine</p>
                <p className="display-font mt-2 text-6xl font-black">{products.pagination.total}</p>
                <p className="mt-2 text-sm text-stone-300">todos sincronizados pelo ERP</p>
              </div>
            </div>
          </div>
        </header>

        <StoreFilters filters={products.filters} params={params} />

        {products.data.length > 0 ? (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.data.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </section>
        ) : (
          <section className="mt-8 rounded-[2rem] border border-dashed border-[color:var(--line)] bg-white/55 p-10 text-center">
            <h2 className="display-font text-3xl font-black">Nenhum produto com foto encontrado</h2>
            <p className="mt-3 text-[color:var(--muted)]">Cadastre fotos no estoque do ERP para os produtos aparecerem aqui.</p>
          </section>
        )}
      </section>
    </main>
  );
}
