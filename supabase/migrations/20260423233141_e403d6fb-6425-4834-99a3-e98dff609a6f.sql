-- Fix Security Definer View: recreate profiles_safe with security_invoker so it
-- enforces RLS of the querying user instead of the view creator.
DROP VIEW IF EXISTS public.profiles_safe;

CREATE VIEW public.profiles_safe
WITH (security_invoker = true) AS
SELECT id, user_id, mfa_enabled, created_at, updated_at
FROM public.profiles;

-- The base profiles table already restricts SELECT to service_role only,
-- so the view alone won't expose data to end users. Grant explicit access
-- so the application (via service_role / authenticated where appropriate)
-- can still query it.
GRANT SELECT ON public.profiles_safe TO authenticated, service_role;

-- Harden user_roles: add explicit positive policies that block all writes
-- from authenticated/anon users (defense in depth on top of the existing
-- restrictive service_role policy). This makes intent unambiguous to
-- security scanners and prevents privilege escalation.
DROP POLICY IF EXISTS "No client inserts on user_roles" ON public.user_roles;
CREATE POLICY "No client inserts on user_roles"
ON public.user_roles
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

DROP POLICY IF EXISTS "No client updates on user_roles" ON public.user_roles;
CREATE POLICY "No client updates on user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated, anon
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "No client deletes on user_roles" ON public.user_roles;
CREATE POLICY "No client deletes on user_roles"
ON public.user_roles
FOR DELETE
TO authenticated, anon
USING (false);