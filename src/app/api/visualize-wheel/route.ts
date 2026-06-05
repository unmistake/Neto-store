import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type PublicProduct = {
  id: number;
  name: string;
  brand?: string | null;
  model?: string | null;
  rim?: string | null;
  image_url?: string | null;
};

type PublicProductsResponse = {
  ok: boolean;
  data: PublicProduct[];
};

async function fetchProduct(productId: number): Promise<PublicProduct | null> {
  const baseUrl = process.env.NEXT_PUBLIC_ERP_API_URL || "https://erp-netorodas.online/api/public/products";
  const url = new URL(baseUrl);
  url.searchParams.set("limit", "100");

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as PublicProductsResponse;
  return payload.data.find((product) => Number(product.id) === productId) || null;
}

function safeFileName(value: string, fallback: string): string {
  return (value || fallback)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "OPENAI_API_KEY nao configurada." }, { status: 500 });
  }

  const form = await request.formData();
  const productId = Number(form.get("productId") || 0);
  const carImage = form.get("carImage");

  if (!productId || !(carImage instanceof File)) {
    return NextResponse.json({ ok: false, error: "Envie a foto do carro e a roda escolhida." }, { status: 422 });
  }

  if (carImage.size > 8 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "A foto do carro deve ter no maximo 8MB." }, { status: 422 });
  }

  const product = await fetchProduct(productId);
  if (!product || !product.image_url) {
    return NextResponse.json({ ok: false, error: "Roda nao encontrada ou sem imagem no ERP." }, { status: 404 });
  }

  const wheelResponse = await fetch(product.image_url, { cache: "no-store" });
  if (!wheelResponse.ok) {
    return NextResponse.json({ ok: false, error: "Nao foi possivel baixar a imagem da roda." }, { status: 400 });
  }

  const carBuffer = Buffer.from(await carImage.arrayBuffer());
  const wheelBuffer = Buffer.from(await wheelResponse.arrayBuffer());
  const carFile = await toFile(carBuffer, safeFileName(carImage.name, "carro") + ".jpg", { type: carImage.type || "image/jpeg" });
  const wheelFile = await toFile(wheelBuffer, safeFileName(product.name, "roda") + ".jpg", {
    type: wheelResponse.headers.get("content-type") || "image/jpeg",
  });

  const openai = new OpenAI({ apiKey });
  const prompt = [
    "Edite a foto do carro enviada pelo cliente.",
    "Substitua visualmente as rodas atuais do carro pela roda de referencia da loja.",
    "Mantenha o mesmo carro, cor, ambiente, perspectiva, iluminacao e fundo.",
    "Aplique a roda nova nas quatro posicoes visiveis quando possivel, respeitando angulo, escala, sombra e profundidade.",
    "Nao altere placa, carroceria, farois, vidros, cor do carro ou cenario.",
    `Roda escolhida: ${product.name}${product.rim ? ` aro ${product.rim}` : ""}.`,
    "Resultado deve parecer uma simulacao fotografica realista para loja de rodas.",
  ].join(" ");

  try {
    const result = await openai.images.edit({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      image: [carFile, wheelFile],
      prompt,
      size: "1024x1024",
    });

    const first = result.data?.[0];
    const imageBase64 = first?.b64_json;
    const imageUrl = first?.url;

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json({ ok: false, error: "A OpenAI nao retornou uma imagem." }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      product: { id: product.id, name: product.name, image_url: product.image_url },
      image: imageBase64 ? `data:image/png;base64,${imageBase64}` : imageUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gerar visualizacao.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
