import Link from "next/link";

const links = [
  { href: "/contato", label: "Contato" },
  { href: "/entrega", label: "Entrega e frete" },
  { href: "/trocas-e-devolucoes", label: "Trocas e devoluções" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos de uso" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--night)] text-stone-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1.2fr] lg:px-8">
        <div>
          <Link href="/" className="display-font text-2xl font-black text-white">
            Neto Rodas
          </Link>
          <p className="mt-3 max-w-lg text-sm leading-6 text-stone-300">
            Pneus e rodas com estoque sincronizado ao ERP. Atendimento em Feira de Santana, Bahia.
          </p>
          <p className="mt-4 text-sm font-semibold">CNPJ 35.732.524/0001-51</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold transition hover:border-white/30 hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
