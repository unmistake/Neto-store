import { getAllProducts } from "@/lib/products";
import type { MetadataRoute } from "next";

const storeUrl = "https://www.netorodas.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const staticPages = [
    "",
    "/contato",
    "/entrega",
    "/trocas-e-devolucoes",
    "/privacidade",
    "/termos",
    "/carrinho",
    "/login",
    "/criar-conta",
  ];

  return [
    ...staticPages.map((path) => ({
      url: `${storeUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? ("daily" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.5,
    })),
    ...products.map((product) => ({
      url: `${storeUrl}/produto/${product.id}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
      images: [product.image_url],
    })),
  ];
}
