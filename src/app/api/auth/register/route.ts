import { CUSTOMER_SESSION_COOKIE, CustomerSession, createCustomerSession } from "@/lib/customer-session";
import { resolveIpLocation } from "@/lib/ip-location";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type ErpRegisterResponse = {
  ok: boolean;
  data?: CustomerSession;
  error?: string;
};

function erpApiBaseUrl(): string {
  return (process.env.ERP_API_BASE_URL || "https://erp-netorodas.online/api").replace(/\/$/, "");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = process.env.ERP_API_TOKEN;

  if (!token) {
    return NextResponse.json({ ok: false, error: "Cadastro indisponivel. Configure ERP_API_TOKEN na loja." }, { status: 500 });
  }

  const firstName = String(body?.first_name || "").trim();
  const lastName = String(body?.last_name || "").trim();
  const phone = String(body?.phone || "").trim();
  const taxId = String(body?.tax_id || "").trim();

  if (!firstName || !lastName || !phone || !taxId) {
    return NextResponse.json({ ok: false, error: "Informe nome, sobrenome, telefone e CPF/CNPJ." }, { status: 422 });
  }

  const location = await resolveIpLocation(request);
  const addressCity = String(body?.address_city || location.city || "").trim();
  const addressState = String(body?.address_state || location.state || "").trim().slice(0, 2).toUpperCase();
  const addressCountry = String(body?.address_country || location.country || "Brasil").trim();

  const response = await fetch(`${erpApiBaseUrl()}/customer-auth/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      phone,
      tax_id: taxId,
      notes: String(body?.notes || "").trim(),
      address_street: String(body?.address_street || "").trim(),
      address_number: String(body?.address_number || "").trim(),
      address_district: String(body?.address_district || "").trim(),
      address_city: addressCity,
      address_state: addressState,
      address_zip: String(body?.address_zip || "").trim(),
      address_country: addressCountry,
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({ ok: false }))) as ErpRegisterResponse;

  if (!response.ok || !payload.ok || !payload.data) {
    return NextResponse.json(
      { ok: false, error: payload.error || "Nao foi possivel criar sua conta." },
      { status: response.status || 400 },
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

  return NextResponse.json({ ok: true, data: payload.data, location: { city: addressCity, state: addressState, country: addressCountry } });
}
