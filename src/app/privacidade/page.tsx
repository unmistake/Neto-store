import { InformationPage } from "@/components/InformationPage";

export const metadata = {
  title: "Política de privacidade | Neto Rodas",
  description: "Como a Neto Rodas trata dados pessoais na loja online.",
};

export default function PrivacyPage() {
  return (
    <InformationPage
      eyebrow="Seus dados"
      title="Política de privacidade"
      intro="Utilizamos apenas os dados necessários para cadastro, atendimento, segurança e evolução da loja."
    >
      <h2>Dados tratados</h2>
      <p>Podemos tratar nome, sobrenome, e-mail, telefone, CPF ou CNPJ, endereço, dados de acesso, produtos consultados e informações técnicas básicas do dispositivo e da conexão.</p>

      <h2>Finalidades</h2>
      <p>Os dados são usados para criar e proteger sua conta, vincular seu cadastro ao CRM, atender solicitações, preparar pedidos, cumprir obrigações legais, prevenir fraudes e medir o desempenho da loja.</p>

      <h2>Serviços utilizados</h2>
      <p>A loja utiliza Vercel para hospedagem, Supabase para autenticação, o ERP da Neto Rodas para dados comerciais e Google Tag Manager para gestão de métricas. Esses fornecedores podem processar dados conforme suas próprias políticas e contratos.</p>

      <h2>Compartilhamento</h2>
      <p>Não comercializamos dados pessoais. O compartilhamento ocorre quando necessário para operar a loja, atender obrigações legais ou proteger direitos.</p>

      <h2>Seus direitos</h2>
      <p>Você pode solicitar confirmação, acesso, correção ou outras providências previstas na legislação aplicável pelo WhatsApp (75) 99166-5469.</p>
    </InformationPage>
  );
}
