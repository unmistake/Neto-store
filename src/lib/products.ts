export type StoreProduct = {
  id: number;
  name: string;
  category: "pneu" | "roda";
  item_condition: "novo" | "usado";
  used_tire_condition?: string | null;
  brand?: string | null;
  model?: string | null;
  width?: string | null;
  profile?: string | null;
  rim?: string | null;
  location?: string | null;
  price: number;
  stock_qty: number;
  available: boolean;
  image_url: string;
  cars: string[];
};

export type ProductFilters = {
  brands: string[];
  rims: string[];
  cars: string[];
};

export type ProductsResponse = {
  ok: boolean;
  data: StoreProduct[];
  filters: ProductFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

const fallback: ProductsResponse = {
  ok: true,
  data: [],
  filters: { brands: [], rims: [], cars: [] },
  pagination: { page: 1, limit: 24, total: 0, total_pages: 1, has_next: false, has_prev: false },
};

export async function getProducts(searchParams?: Record<string, string | string[] | undefined>): Promise<ProductsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_ERP_API_URL || "https://erp-netorodas.online/api/public/products";
  const url = new URL(baseUrl);
  url.searchParams.set("limit", "48");

  for (const [key, value] of Object.entries(searchParams || {})) {
    if (Array.isArray(value)) {
      if (value[0]) url.searchParams.set(key, value[0]);
    } else if (value) {
      url.searchParams.set(key, value);
    }
  }

  try {
    const response = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!response.ok) return fallback;
    const payload = (await response.json()) as ProductsResponse;
    return payload.ok ? payload : fallback;
  } catch {
    return fallback;
  }
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

export function productMeasure(product: StoreProduct): string {
  if (product.category === "pneu") {
    const width = product.width || "";
    const profile = product.profile || "";
    const rim = product.rim ? `R${product.rim}` : "";
    return [width && profile ? `${width}/${profile}` : width || profile, rim].filter(Boolean).join(" ");
  }
  return product.rim ? `Aro ${product.rim}` : "Roda";
}

export function whatsappLink(product: StoreProduct): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5575991665469";
  const message = `Olá! Tenho interesse no produto: ${product.name} - ${productMeasure(product)} (${formatMoney(product.price)}). Pode me passar mais informações?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
