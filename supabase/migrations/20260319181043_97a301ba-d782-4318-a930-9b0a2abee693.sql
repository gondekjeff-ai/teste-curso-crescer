
-- Create a secure view that excludes mfa_secret
CREATE OR REPLACE VIEW public.profiles_safe AS
SELECT id, user_id, mfa_enabled, created_at, updated_at
FROM public.profiles;

-- Grant access to the safe view
GRANT SELECT ON public.profiles_safe TO authenticated;
GRANT SELECT ON public.profiles_safe TO anon;

-- Revoke direct SELECT on profiles from non-service roles
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.profiles FROM authenticated;

-- Keep INSERT/UPDATE for authenticated (edge functions use service_role anyway)
REVOKE INSERT ON public.profiles FROM anon;
REVOKE UPDATE ON public.profiles FROM anon;
