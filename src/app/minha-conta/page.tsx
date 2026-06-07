import { LogoutButton } from "@/components/LogoutButton";
import { getCustomerSession } from "@/lib/customer-session";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Minha conta | Neto Rodas",
};
export const dynamic = "force-dynamic";

export default async function MinhaContaPage() {
  const customer = await getCustomerSession();
  if (!customer) {
    redirect("/login");
  }

  return (
    <main className="texture min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto max-w-6xl">
        <header className="overflow-hidden rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--night)] p-7 text-white card-shadow sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link href="/" className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">
                Neto Rodas Online
              </Link>
              <h1 className="display-font mt-8 text-5xl font-black leading-none sm:text-6xl">
                Olá, {customer.first_name}.
              </h1>
              <p className="mt-4 max-w-2xl text-stone-200">
                Esta é sua área do cliente. Aos poucos vamos trazer pedidos, histórico de compras, orçamentos e acompanhamento de atendimento por aqui.
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--card)] p-6 card-shadow">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--brand)]">Cadastro</p>
            <h2 className="display-font mt-3 text-3xl font-black">{customer.full_name}</h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="rounded-2xl bg-white/70 p-4">
                <dt className="font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">CPF/CNPJ</dt>
                <dd className="mt-1 text-lg font-extrabold">{customer.tax_id_masked}</dd>
              </div>
              <div className="rounded-2xl bg-white/70 p-4">
                <dt className="font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">Telefone</dt>
                <dd className="mt-1 text-lg font-extrabold">{customer.phone_masked}</dd>
              </div>
              {customer.email ? (
                <div className="rounded-2xl bg-white/70 p-4">
                  <dt className="font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">E-mail</dt>
                  <dd className="mt-1 break-words text-lg font-extrabold">{customer.email}</dd>
                </div>
              ) : null}
              {customer.car ? (
                <div className="rounded-2xl bg-white/70 p-4">
                  <dt className="font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">Carro</dt>
                  <dd className="mt-1 text-lg font-extrabold">{customer.car}</dd>
                </div>
              ) : null}
            </dl>
          </article>

          <section className="grid gap-5 sm:grid-cols-2">
            <article className="rounded-[2rem] border border-[color:var(--line)] bg-white/70 p-6 card-shadow">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Em breve</p>
              <h2 className="display-font mt-3 text-3xl font-black">Meus pedidos</h2>
              <p className="mt-3 text-sm font-semibold text-[color:var(--muted)]">
                Vamos conectar aqui o histórico de vendas e orçamentos do ERP para o cliente acompanhar tudo em um só lugar.
              </p>
            </article>
            <article className="rounded-[2rem] border border-[color:var(--line)] bg-white/70 p-6 card-shadow">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Em breve</p>
              <h2 className="display-font mt-3 text-3xl font-black">Favoritos</h2>
              <p className="mt-3 text-sm font-semibold text-[color:var(--muted)]">
                Espaço reservado para salvar pneus e rodas de interesse antes de chamar a equipe no WhatsApp.
              </p>
            </article>
            <article className="rounded-[2rem] border border-[color:var(--line)] bg-white/70 p-6 card-shadow sm:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Atendimento</p>
              <h2 className="display-font mt-3 text-3xl font-black">Precisa alterar seus dados?</h2>
              <p className="mt-3 text-sm font-semibold text-[color:var(--muted)]">
                Por enquanto, alterações cadastrais continuam sendo feitas pela equipe da loja para manter o CRM consistente.
              </p>
              <Link
                href="https://wa.me/5575991665469?text=Ol%C3%A1%2C%20quero%20atualizar%20meu%20cadastro%20na%20Neto%20Rodas."
                target="_blank"
                className="mt-5 inline-flex rounded-2xl bg-[color:var(--brand)] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[color:var(--brand-dark)]"
              >
                Falar no WhatsApp
              </Link>
            </article>
          </section>
        </section>
      </section>
    </main>
  );
}
