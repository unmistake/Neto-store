import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrinho | Neto Rodas",
  description: "Revise os pneus e rodas selecionados para o seu pedido.",
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
