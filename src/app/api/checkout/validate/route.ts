import type {
  CheckoutCartInput,
  CheckoutValidation,
  ValidatedCheckoutItem,
} from "@/lib/checkout";
import type { StoreProduct } from "@/lib/products";
import { NextResponse } from "next/server";

type ProductResponse = {
  ok?: boolean;
  data?: StoreProduct;
};

const productsApiUrl =
  process.env.NEXT_PUBLIC_ERP_API_URL ||
  "https://erp-netorodas.online/api/public/products";

async function fetchCurrentProduct(productId: number): Promise<StoreProduct | null> {
  try {
    const response = await fetch(
      `${productsApiUrl.replace(/\/$/, "")}/${productId}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;

    const payload = (await response.json()) as ProductResponse;
    return payload.ok && payload.data ? payload.data : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawItems = Array.isArray(body?.items) ? body.items : [];

  const items: CheckoutCartInput[] = rawItems
    .map(
      (item: CheckoutCartInput): CheckoutCartInput => ({
        product_id: Number(item?.product_id || 0),
        quantity: Number(item?.quantity || 0),
      }),
    )
    .filter(
      (item: CheckoutCartInput) =>
        Number.isInteger(item.product_id) &&
        item.product_id > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    )
    .slice(0, 50);

  if (items.length === 0) {
    return NextResponse.json(
      { ok: false, items: [], subtotal: 0, issues: ["Seu carrinho está vazio."] },
      { status: 422 },
    );
  }

  const uniqueItems = Array.from(
    items.reduce<Map<number, CheckoutCartInput>>((map, item) => {
      map.set(item.product_id, {
        product_id: item.product_id,
        quantity: (map.get(item.product_id)?.quantity || 0) + item.quantity,
      });
      return map;
    }, new Map<number, CheckoutCartInput>()).values(),
  );

  const currentProducts = await Promise.all(
    uniqueItems.map(async (item) => ({
      input: item,
      product: await fetchCurrentProduct(item.product_id),
    })),
  );

  const validatedItems: ValidatedCheckoutItem[] = [];
  const issues: string[] = [];

  for (const { input, product } of currentProducts) {
    if (!product) {
      issues.push("Um produto do carrinho não está mais disponível.");
      continue;
    }

    const currentPrice = Number(product.price || 0);
    const currentStock = Math.max(0, Number(product.stock_qty || 0));

    if (!product.available || currentStock <= 0 || currentPrice <= 0) {
      issues.push(`${product.name} está indisponível no momento.`);
      continue;
    }

    if (input.quantity > currentStock) {
      issues.push(
        `${product.name}: há ${currentStock} unidade(s) disponível(is), mas ${input.quantity} foram solicitadas.`,
      );
      continue;
    }

    validatedItems.push({
      product,
      quantity: input.quantity,
      unit_price: currentPrice,
      line_total: currentPrice * input.quantity,
    });
  }

  const result: CheckoutValidation = {
    ok: issues.length === 0 && validatedItems.length === uniqueItems.length,
    items: validatedItems,
    subtotal: validatedItems.reduce((total, item) => total + item.line_total, 0),
    issues,
  };

  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}
