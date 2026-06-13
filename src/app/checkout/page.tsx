import { CheckoutFlow } from "@/components/CheckoutFlow";
import type { CheckoutAddress, CheckoutCustomer } from "@/lib/checkout";
import { getCustomerSession } from "@/lib/customer-session";

export const dynamic = "force-dynamic";

type ErpCustomerResponse = {
  ok?: boolean;
  data?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    tax_id?: string;
    address_street?: string;
    address_number?: string;
    address_district?: string;
    address_city?: string;
    address_state?: string;
    address_zip?: string;
  };
};

async function getCheckoutProfile(customerId: number) {
  const token = process.env.ERP_API_TOKEN;
  const baseUrl = (
    process.env.ERP_API_BASE_URL || "https://erp-netorodas.online/api"
  ).replace(/\/$/, "");

  if (!token || customerId <= 0) return null;

  try {
    const response = await fetch(`${baseUrl}/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as ErpCustomerResponse;
    return payload.ok ? payload.data || null : null;
  } catch {
    return null;
  }
}

export default async function CheckoutPage() {
  const customer = await getCustomerSession();
  const erpCustomer = customer ? await getCheckoutProfile(customer.id) : null;

  const initialCustomer: CheckoutCustomer = {
    first_name: erpCustomer?.first_name || customer?.first_name || "",
    last_name: erpCustomer?.last_name || customer?.last_name || "",
    email: erpCustomer?.email || customer?.email || "",
    phone: erpCustomer?.phone || "",
    tax_id: erpCustomer?.tax_id || "",
  };
  const initialAddress: CheckoutAddress = {
    zip: erpCustomer?.address_zip || "",
    street: erpCustomer?.address_street || "",
    number: erpCustomer?.address_number || "",
    complement: "",
    district: erpCustomer?.address_district || "",
    city: erpCustomer?.address_city || "",
    state: erpCustomer?.address_state || "",
  };

  return (
    <CheckoutFlow
      initialCustomer={initialCustomer}
      initialAddress={initialAddress}
      isAuthenticated={Boolean(customer)}
    />
  );
}
