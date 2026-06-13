-- SECURITY: prevent authenticated users from updating their own MFA fields via RLS.
-- The existing permissive "Users can update own profile" policy allows UPDATE on
-- every column; this RESTRICTIVE policy is AND-combined and blocks any UPDATE
-- where the MFA columns are being changed by a non-service_role caller.
DROP POLICY IF EXISTS "Block MFA self-modification" ON public.profiles;
CREATE POLICY "Block MFA self-modification"
ON public.profiles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
  auth.role() = 'service_role'
  OR (
    mfa_enabled IS NOT DISTINCT FROM (SELECT p.mfa_enabled FROM public.profiles p WHERE p.user_id = profiles.user_id)
    AND mfa_secret IS NOT DISTINCT FROM (SELECT p.mfa_secret FROM public.profiles p WHERE p.user_id = profiles.user_id)
  )
)
WITH CHECK (
  auth.role() = 'service_role'
  OR (
    mfa_enabled IS NOT DISTINCT FROM (SELECT p.mfa_enabled FROM public.profiles p WHERE p.user_id = profiles.user_id)
    AND mfa_secret IS NOT DISTINCT FROM (SELECT p.mfa_secret FROM public.profiles p WHERE p.user_id = profiles.user_id)
  )
);