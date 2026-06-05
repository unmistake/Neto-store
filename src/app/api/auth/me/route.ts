import { getCustomerSession } from "@/lib/customer-session";
import { NextResponse } from "next/server";

export async function GET() {
  const customer = await getCustomerSession();

  if (!customer) {
    return NextResponse.json({ ok: false, error: "Nao autenticado." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, data: customer });
}
