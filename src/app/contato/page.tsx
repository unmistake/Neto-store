import { InformationPage } from "@/components/InformationPage";
import Link from "next/link";

export const metadata = {
  title: "Contato | Neto Rodas",
  description: "Canais de atendimento e identificação da Neto Rodas.",
};

export default function ContactPage() {
  return (
    <InformationPage
      eyebrow="Atendimento"
      title="Fale com a Neto Rodas"
      intro="Nossa equipe ajuda na compatibilidade, disponibilidade, entrega e condições do pedido."
    >
      <h2>Dados da empresa</h2>
      <p><strong>Razão social:</strong> Elias de Freitas Santos Neto</p>
      <p><strong>CNPJ:</strong> 35.732.524/0001-51</p>
      <p><strong>Endereço:</strong> Rua Voluntários da Pátria, 275, Centro, Feira de Santana - BA</p>

      <h2>Canais de atendimento</h2>
      <p><strong>Telefone e WhatsApp:</strong> (75) 99166-5469</p>
      <p>O atendimento é realizado pela equipe comercial, que informa disponibilidade, prazo e frete antes da confirmação do pedido.</p>
      <Link
        href="https://wa.me/5575991665469?text=Ol%C3%A1%2C%20preciso%20de%20atendimento%20da%20Neto%20Rodas."
        target="_blank"
        className="mt-3 inline-flex rounded-2xl bg-[color:var(--brand)] px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white"
      >
        Abrir WhatsApp
      </Link>
    </InformationPage>
  );
}
