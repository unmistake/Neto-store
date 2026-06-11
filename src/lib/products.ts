export type StoreProduct = {
  id: number;
  name: string;
  sku?: string | null;
  description?: string | null;
  gtin?: string | null;
  mpn?: string | null;
  google_category?: string | null;
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

const productsApiUrl =
  process.env.NEXT_PUBLIC_ERP_API_URL || "https://erp-netorodas.online/api/public/products";

export async function getProducts(searchParams?: Record<string, string | string[] | undefined>): Promise<ProductsResponse> {
  const url = new URL(productsApiUrl);
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

export async function getProduct(id: number): Promise<StoreProduct | null> {
  if (!Number.isInteger(id) || id <= 0) return null;

  try {
    const response = await fetch(`${productsApiUrl.replace(/\/$/, "")}/${id}`, {
      next: { revalidate: 60 },
    });
    if (response.ok) {
      const payload = (await response.json()) as { ok: boolean; data?: StoreProduct | StoreProduct[] };
      if (payload.ok && payload.data && !Array.isArray(payload.data)) return payload.data;
    }
  } catch {
    // The list endpoint below keeps product pages available during staggered deploys.
  }

  const products = await getAllProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function getAllProducts(): Promise<StoreProduct[]> {
  const allProducts: StoreProduct[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= 20) {
    try {
      const url = new URL(productsApiUrl);
      url.searchParams.set("limit", "100");
      url.searchParams.set("page", String(page));
      const response = await fetch(url.toString(), { next: { revalidate: 300 } });
      if (!response.ok) break;
      const payload = (await response.json()) as ProductsResponse;
      if (!payload.ok) break;
      allProducts.push(...payload.data);
      hasNext = payload.pagination.has_next;
      page += 1;
    } catch {
      break;
    }
  }

  return allProducts;
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

export function productDescription(product: StoreProduct): string {
  if (product.description?.trim()) return product.description.trim();

  const category = product.category === "pneu" ? "Pneu" : "Roda";
  const condition = product.item_condition === "novo" ? "novo" : "usado";
  const identity = [product.brand, product.model].filter(Boolean).join(" ");
  const measure = productMeasure(product);
  const cars = Array.isArray(product.cars) ? product.cars : [];
  const compatibility =
    cars.length > 0 ? ` Compatível com ${cars.slice(0, 5).join(", ")}.` : "";

  return `${category} ${condition}${identity ? ` ${identity}` : ""}${measure ? `, ${measure}` : ""}.${compatibility}`;
}
