CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    erp_customer_id BIGINT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_masked TEXT NOT NULL,
    tax_id_normalized TEXT NOT NULL UNIQUE,
    tax_id_masked TEXT NOT NULL,
    car TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customer reads own profile" ON public.customer_profiles;
CREATE POLICY "Customer reads own profile"
ON public.customer_profiles
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

REVOKE INSERT, UPDATE, DELETE ON public.customer_profiles FROM anon, authenticated;
GRANT SELECT ON public.customer_profiles TO authenticated;
