import { InformationPage } from "@/components/InformationPage";

export const metadata = {
  title: "Termos de uso | Neto Rodas",
  description: "Condições de uso da loja online Neto Rodas.",
};

export default function TermsPage() {
  return (
    <InformationPage
      eyebrow="Condições"
      title="Termos de uso"
      intro="Ao navegar ou criar uma conta, você concorda em utilizar a loja de forma legítima e fornecer informações verdadeiras."
    >
      <h2>Catálogo e estoque</h2>
      <p>O catálogo é sincronizado com o ERP. Preços, fotos e disponibilidade podem ser atualizados. A confirmação definitiva ocorre no fechamento do pedido.</p>

      <h2>Compatibilidade</h2>
      <p>Informações sobre veículos compatíveis servem como referência. Antes da compra, confirme medidas, especificações técnicas e aplicação com nossa equipe ou com um profissional qualificado.</p>

      <h2>Formação do pedido</h2>
      <p>O carrinho permite selecionar produtos e quantidades. O pedido será formado após a apresentação e aceitação das condições finais, incluindo preço, frete, prazo, endereço e forma de pagamento.</p>

      <h2>Responsabilidades do usuário</h2>
      <p>O usuário deve fornecer dados corretos, proteger sua senha e não tentar comprometer a segurança ou disponibilidade da plataforma.</p>

      <h2>Atendimento</h2>
      <p>Dúvidas e solicitações podem ser encaminhadas pelo telefone (75) 99166-5469.</p>
    </InformationPage>
  );
}
