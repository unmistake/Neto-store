import { CUSTOMER_SESSION_COOKIE } from "@/lib/customer-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);

  return NextResponse.json({ ok: true });
}
