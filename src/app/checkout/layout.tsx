import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Neto Rodas",
  description: "Revise seus dados, entrega e forma de pagamento.",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
