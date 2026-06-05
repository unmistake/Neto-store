import { resolveIpLocation } from "@/lib/ip-location";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const location = await resolveIpLocation(request);

  return NextResponse.json({ ok: true, data: location });
}
