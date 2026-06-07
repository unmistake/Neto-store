import { profileToCustomerSession, type CustomerSession } from "@/lib/customer-session";
import { resolveIpLocation } from "@/lib/ip-location";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ErpRegisterResponse = {
  ok: boolean;
  data?: CustomerSession;
  error?: string;
};

function erpApiBaseUrl(): string {
  return (process.env.ERP_API_BASE_URL || "https://erp-netorodas.online/api").replace(/\/$/, "");
}

function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const erpToken = process.env.ERP_API_TOKEN;

  if (!erpToken) {
    return NextResponse.json({ ok: false, error: "Cadastro indisponivel. Configure ERP_API_TOKEN na loja." }, { status: 500 });
  }

  const firstName = String(body?.first_name || "").trim();
  const lastName = String(body?.last_name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const phone = String(body?.phone || "").trim();
  const taxId = String(body?.tax_id || "").trim();
  const taxIdNormalized = onlyDigits(taxId);

  if (!firstName || !lastName || !email || !password || !phone || !taxId) {
    return NextResponse.json({ ok: false, error: "Informe nome, sobrenome, e-mail, senha, telefone e CPF/CNPJ." }, { status: 422 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: "A senha deve ter pelo menos 6 caracteres." }, { status: 422 });
  }
  if (![11, 14].includes(taxIdNormalized.length)) {
    return NextResponse.json({ ok: false, error: "CPF/CNPJ invalido." }, { status: 422 });
  }

  const location = await resolveIpLocation(request);
  const addressCity = String(body?.address_city || location.city || "").trim();
  const addressState = String(body?.address_state || location.state || "").trim().slice(0, 2).toUpperCase();
  const addressCountry = String(body?.address_country || location.country || "Brasil").trim();

  try {
    const admin = createAdminClient();
    const [{ data: taxProfile }, { data: emailProfile }] = await Promise.all([
      admin.from("customer_profiles").select("id").eq("tax_id_normalized", taxIdNormalized).maybeSingle(),
      admin.from("customer_profiles").select("id").eq("email", email).maybeSingle(),
    ]);

    if (taxProfile || emailProfile) {
      return NextResponse.json({ ok: false, error: "Este e-mail ou CPF/CNPJ ja possui uma conta. Use o login." }, { status: 409 });
    }

    const { data: createdAuth, error: createAuthError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (createAuthError || !createdAuth.user) {
      return NextResponse.json({ ok: false, error: createAuthError?.message || "Nao foi possivel criar o acesso." }, { status: 409 });
    }

    const authUserId = createdAuth.user.id;
    const erpResponse = await fetch(`${erpApiBaseUrl()}/store-customers/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${erpToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_auth_id: authUserId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        tax_id: taxId,
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

    const erpPayload = (await erpResponse.json().catch(() => ({ ok: false }))) as ErpRegisterResponse;
    if (!erpResponse.ok || !erpPayload.ok || !erpPayload.data) {
      await admin.auth.admin.deleteUser(authUserId);
      return NextResponse.json(
        { ok: false, error: erpPayload.error || "Nao foi possivel vincular sua conta ao cadastro da loja." },
        { status: erpResponse.status || 409 },
      );
    }

    const profile = {
      id: authUserId,
      erp_customer_id: erpPayload.data.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone_masked: erpPayload.data.phone_masked,
      tax_id_normalized: taxIdNormalized,
      tax_id_masked: erpPayload.data.tax_id_masked,
      car: erpPayload.data.car || null,
      created_at: erpPayload.data.created_at || new Date().toISOString(),
    };
    const { error: profileError } = await admin.from("customer_profiles").insert(profile);

    if (profileError) {
      return NextResponse.json(
        { ok: false, error: "Conta criada, mas o perfil precisa ser sincronizado pela equipe." },
        { status: 500 },
      );
    }

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      return NextResponse.json({ ok: true, requires_login: true });
    }

    const session = profileToCustomerSession(profile);
    return NextResponse.json({
      ok: true,
      data: session,
      location: { city: addressCity, state: addressState, country: addressCountry },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Nao foi possivel criar sua conta agora." }, { status: 500 });
  }
}
