import { createClient } from "@/lib/supabase/server";

export type CustomerSession = {
  id: number;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  full_name: string;
  phone_masked: string;
  tax_id_masked: string;
  car?: string | null;
  created_at?: string | null;
};

type CustomerProfile = {
  id: string;
  erp_customer_id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone_masked: string;
  tax_id_masked: string;
  car: string | null;
  created_at: string;
};

export function profileToCustomerSession(profile: CustomerProfile): CustomerSession | null {
  if (!profile.erp_customer_id) {
    return null;
  }

  return {
    id: Number(profile.erp_customer_id),
    auth_user_id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    full_name: `${profile.first_name} ${profile.last_name}`.trim(),
    phone_masked: profile.phone_masked,
    tax_id_masked: profile.tax_id_masked,
    car: profile.car,
    created_at: profile.created_at,
  };
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("customer_profiles")
      .select("id, erp_customer_id, first_name, last_name, email, phone_masked, tax_id_masked, car, created_at")
      .eq("id", user.id)
      .maybeSingle<CustomerProfile>();

    return profile ? profileToCustomerSession(profile) : null;
  } catch {
    return null;
  }
}
