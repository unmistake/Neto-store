import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const CUSTOMER_SESSION_COOKIE = "nr_customer_session";

export type CustomerSession = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_masked: string;
  tax_id_masked: string;
  car?: string | null;
  created_at?: string | null;
};

function sessionSecret(): string {
  return process.env.CUSTOMER_SESSION_SECRET || "dev-customer-session-secret-change-me";
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createCustomerSession(customer: CustomerSession): string {
  const payload = base64UrlEncode(JSON.stringify(customer));
  return `${payload}.${signPayload(payload)}`;
}

export function verifyCustomerSession(token?: string): CustomerSession | null {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [payload, signature] = token.split(".");
  const expected = signPayload(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(payload)) as CustomerSession;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  return verifyCustomerSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
}
