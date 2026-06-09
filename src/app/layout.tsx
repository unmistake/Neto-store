import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const googleAnalyticsId = "G-WW7VD063ZQ";

export const metadata: Metadata = {
  title: "Neto Rodas | Pneus e Rodas",
  description: "Loja online da Neto Rodas com pneus e rodas selecionados do estoque real.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}');
          `}
        </Script>
      </body>
    </html>
  );
}
