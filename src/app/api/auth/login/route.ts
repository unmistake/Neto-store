import { profileToCustomerSession } from "@/lib/customer-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identifier = String(body?.identifier || "").trim();
  const password = String(body?.password || "");

  if (!identifier || !password) {
    return NextResponse.json({ ok: false, error: "Informe e-mail/CPF e senha." }, { status: 422 });
  }

  try {
    const admin = createAdminClient();
    let email = identifier.toLowerCase();

    if (!identifier.includes("@")) {
      const taxIdNormalized = onlyDigits(identifier);
      const { data: profile } = await admin
        .from("customer_profiles")
        .select("email")
        .eq("tax_id_normalized", taxIdNormalized)
        .maybeSingle<{ email: string }>();

      if (!profile?.email) {
        return NextResponse.json({ ok: false, error: "E-mail/CPF ou senha invalidos." }, { status: 401 });
      }
      email = profile.email;
    }

    const supabase = await createClient();
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !authData.user) {
      return NextResponse.json({ ok: false, error: "E-mail/CPF ou senha invalidos." }, { status: 401 });
    }

    const { data: profile } = await admin
      .from("customer_profiles")
      .select("id, erp_customer_id, first_name, last_name, email, phone_masked, tax_id_masked, car, created_at")
      .eq("id", authData.user.id)
      .maybeSingle();

    const customer = profile ? profileToCustomerSession(profile) : null;
    if (!customer) {
      await supabase.auth.signOut();
      return NextResponse.json({ ok: false, error: "Conta sem vinculo com o ERP. Fale com a equipe." }, { status: 409 });
    }

    return NextResponse.json({ ok: true, data: customer });
  } catch {
    return NextResponse.json({ ok: false, error: "Login temporariamente indisponivel." }, { status: 500 });
  }
}
