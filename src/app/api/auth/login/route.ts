import { CUSTOMER_SESSION_COOKIE, CustomerSession, createCustomerSession } from "@/lib/customer-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type ErpLoginResponse = {
  ok: boolean;
  data?: CustomerSession;
  error?: string;
};

function erpApiBaseUrl(): string {
  return (process.env.ERP_API_BASE_URL || "https://erp-netorodas.online/api").replace(/\/$/, "");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identifier = String(body?.identifier || "").trim();
  const password = String(body?.password || "");
  const token = process.env.ERP_API_TOKEN;

  if (!identifier || !password) {
    return NextResponse.json({ ok: false, error: "Informe e-mail/CPF e senha." }, { status: 422 });
  }

  if (!token) {
    return NextResponse.json({ ok: false, error: "Login indisponivel. Configure ERP_API_TOKEN na loja." }, { status: 500 });
  }

  const response = await fetch(`${erpApiBaseUrl()}/customer-auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, password }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({ ok: false }))) as ErpLoginResponse;

  if (!response.ok || !payload.ok || !payload.data) {
    return NextResponse.json(
      { ok: false, error: payload.error || "E-mail/CPF ou senha invalidos." },
      { status: response.status || 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE, createCustomerSession(payload.data), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true, data: payload.data });
}
