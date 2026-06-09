import { InformationPage } from "@/components/InformationPage";

export const metadata = {
  title: "Entrega e frete | Neto Rodas",
  description: "Informações sobre entrega, retirada e cálculo de frete da Neto Rodas.",
};

export default function ShippingPage() {
  return (
    <InformationPage
      eyebrow="Pedidos"
      title="Entrega e frete"
      intro="O valor e o prazo de entrega são apresentados ao cliente antes da confirmação e do pagamento."
    >
      <h2>Como funciona</h2>
      <p>Após escolher o produto, informe o CEP e a quantidade desejada à nossa equipe. O orçamento final apresentará o valor dos produtos, o frete, a modalidade de entrega e o prazo estimado.</p>

      <h2>Retirada</h2>
      <p>Quando disponível, a retirada pode ser combinada em Feira de Santana - BA. Aguarde a confirmação de separação antes de se deslocar.</p>

      <h2>Prazo</h2>
      <p>O prazo começa após a confirmação do pagamento e pode variar conforme destino, transportadora, disponibilidade e características do produto. O prazo informado no fechamento do pedido integra a oferta.</p>

      <h2>Recebimento</h2>
      <p>Confira a embalagem e o produto no recebimento. Em caso de avaria aparente, registre fotos e entre em contato imediatamente pelo canal informado na página de contato.</p>
    </InformationPage>
  );
}
