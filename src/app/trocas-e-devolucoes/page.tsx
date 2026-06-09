import { InformationPage } from "@/components/InformationPage";

export const metadata = {
  title: "Trocas e devoluções | Neto Rodas",
  description: "Política de trocas, devoluções e garantia legal da Neto Rodas.",
};

export default function ReturnsPage() {
  return (
    <InformationPage
      eyebrow="Pós-venda"
      title="Trocas e devoluções"
      intro="Atendemos às regras do Código de Defesa do Consumidor e buscamos resolver cada solicitação de forma clara."
    >
      <h2>Direito de arrependimento</h2>
      <p>Em compras concluídas fora do estabelecimento comercial, o consumidor pode solicitar o cancelamento em até 7 dias corridos após o recebimento, sem necessidade de justificativa e sem custos adicionais, conforme o artigo 49 do Código de Defesa do Consumidor.</p>

      <h2>Como solicitar</h2>
      <p>Entre em contato pelo WhatsApp (75) 99166-5469, informe o número do pedido ou nota fiscal e envie fotos do produto. A equipe fornecerá as orientações de coleta ou postagem.</p>

      <h2>Condições de devolução</h2>
      <p>O produto deve ser preservado e acompanhado de seus acessórios e documentos. A análise não limita direitos legais e não será exigida embalagem inviolada para o exercício regular do direito de arrependimento.</p>

      <h2>Defeitos e garantia</h2>
      <p>Pneus e rodas são produtos duráveis e possuem garantia legal de 90 dias para vícios aparentes ou de fácil constatação, sem prejuízo de eventual garantia adicional do fabricante. Para vícios ocultos, o prazo começa quando o problema fica evidenciado.</p>

      <h2>Reembolso</h2>
      <p>Após o recebimento e processamento da devolução, o estorno será realizado pelo meio compatível com o pagamento original, observados os prazos da instituição financeira.</p>
    </InformationPage>
  );
}
