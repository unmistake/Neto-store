import { RegisterForm } from "@/components/RegisterForm";
import { getCustomerSession } from "@/lib/customer-session";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Criar conta | Neto Rodas",
};
export const dynamic = "force-dynamic";

export default async function CriarContaPage() {
  const customer = await getCustomerSession();
  if (customer) {
    redirect("/minha-conta");
  }

  return (
    <main className="texture min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="overflow-hidden rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--night)] p-8 text-white card-shadow lg:p-10">
          <Link href="/" className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">
            Neto Rodas Online
          </Link>
          <h1 className="display-font mt-12 text-5xl font-black leading-none sm:text-6xl">
            Crie sua conta na loja.
          </h1>
          <p className="mt-6 text-lg text-stone-200">
            Seu acesso fica protegido pelo Supabase e seus dados comerciais continuam sincronizados com o CRM da Neto Rodas.
          </p>
          <div className="mt-10 rounded-[2rem] border border-white/15 bg-white/10 p-5">
            <p className="text-sm font-bold text-stone-200">
              A localizacao inicial e preenchida pelo IP quando disponivel. Se precisar de precisao para NF-e ou entrega, informe o CEP.
            </p>
          </div>
        </aside>

        <section className="rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--card)] p-6 card-shadow sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[color:var(--brand)]">Cadastro</p>
          <h2 className="display-font mt-3 text-4xl font-black">Dados do cliente</h2>
          <p className="mb-8 mt-3 text-[color:var(--muted)]">
            Preencha os dados principais. O campo carro fica de fora, como pedido, e pode ser tratado depois pela equipe.
          </p>
          <RegisterForm />
          <p className="mt-6 text-center text-sm font-semibold text-[color:var(--muted)]">
            Ja tem conta?{" "}
            <Link href="/login" className="font-black text-[color:var(--brand)]">
              Entrar na area do cliente
            </Link>
            .
          </p>
        </section>
      </section>
    </main>
  );
}
