import { getAllProducts, productDescription } from "@/lib/products";

const storeUrl = "https://www.netorodas.com.br";

function xmlEscape(value: string | number): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const products = (await getAllProducts()).filter(
    (product) => product.image_url && Number(product.price) > 0,
  );

  const items = products
    .map((product) => {
      const hasManufacturerIdentifiers = Boolean(product.gtin || (product.brand && product.mpn));
      const attributes = [
        `<g:id>${xmlEscape(product.sku || `ERP-${product.id}`)}</g:id>`,
        `<g:title>${xmlEscape(product.name)}</g:title>`,
        `<g:description>${xmlEscape(productDescription(product))}</g:description>`,
        `<g:link>${xmlEscape(`${storeUrl}/produto/${product.id}`)}</g:link>`,
        `<g:image_link>${xmlEscape(product.image_url)}</g:image_link>`,
        `<g:price>${product.price.toFixed(2)} BRL</g:price>`,
        `<g:availability>${product.available ? "in_stock" : "out_of_stock"}</g:availability>`,
        `<g:condition>${product.item_condition === "novo" ? "new" : "used"}</g:condition>`,
        product.brand ? `<g:brand>${xmlEscape(product.brand)}</g:brand>` : "",
        product.gtin ? `<g:gtin>${xmlEscape(product.gtin)}</g:gtin>` : "",
        product.mpn ? `<g:mpn>${xmlEscape(product.mpn)}</g:mpn>` : "",
        !hasManufacturerIdentifiers ? "<g:identifier_exists>no</g:identifier_exists>" : "",
        product.google_category
          ? `<g:google_product_category>${xmlEscape(product.google_category)}</g:google_product_category>`
          : "",
        `<g:product_type>${product.category === "pneu" ? "Pneus" : "Rodas"}</g:product_type>`,
      ].filter(Boolean);

      return `<item>${attributes.join("")}</item>`;
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">` +
    `<channel>` +
    `<title>Neto Rodas</title>` +
    `<link>${storeUrl}</link>` +
    `<description>Catálogo de pneus e rodas da Neto Rodas</description>` +
    items +
    `</channel>` +
    `</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
