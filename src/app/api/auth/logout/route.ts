import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Logout remains idempotent when Supabase is unavailable.
  }

  return NextResponse.json({ ok: true });
}
