import { LoginForm } from "@/components/LoginForm";
import { getCustomerSession } from "@/lib/customer-session";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login do cliente | Neto Rodas",
};

export default async function LoginPage() {
  const customer = await getCustomerSession();
  if (customer) {
    redirect("/minha-conta");
  }

  return (
    <main className="texture min-h-screen px-4 py-8 sm:px-6">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="overflow-hidden rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--night)] p-8 text-white card-shadow lg:p-10">
          <Link href="/" className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">
            Neto Rodas Online
          </Link>
          <h1 className="display-font mt-12 text-5xl font-black leading-none sm:text-6xl">
            Área do cliente, sem complicação.
          </h1>
          <p className="mt-6 text-lg text-stone-200">
            Entre com os dados cadastrados no ERP para acessar sua conta e acompanhar os próximos recursos da loja.
          </p>
          <div className="mt-10 rounded-[2rem] border border-white/15 bg-white/10 p-5">
            <p className="text-sm font-bold text-stone-200">
              Por segurança, validamos CPF/CNPJ e telefone juntos. Se algum dado estiver diferente do cadastro, fale com a equipe pelo WhatsApp.
            </p>
          </div>
        </aside>

        <section className="rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--card)] p-6 card-shadow sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[color:var(--brand)]">Entrar</p>
          <h2 className="display-font mt-3 text-4xl font-black">Acesse sua conta</h2>
          <p className="mb-8 mt-3 text-[color:var(--muted)]">
            Use o CPF/CNPJ e telefone que estão cadastrados no CRM da Neto Rodas.
          </p>
          <LoginForm />
          <p className="mt-6 text-center text-sm font-semibold text-[color:var(--muted)]">
            Ainda não tem cadastro?{" "}
            <Link href="/" className="font-black text-[color:var(--brand)]">
              Escolha um produto e fale conosco
            </Link>
            .
          </p>
        </section>
      </section>
    </main>
  );
}
