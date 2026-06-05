import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neto Rodas | Pneus e Rodas",
  description: "Loja online da Neto Rodas com pneus e rodas selecionados do estoque real.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
