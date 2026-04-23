-- Revoke column-level INSERT/UPDATE on mfa_secret from end users.
-- Only service_role (backend) can write this column going forward.
REVOKE INSERT (mfa_secret), UPDATE (mfa_secret)
  ON public.profiles FROM anon, authenticated, PUBLIC;

-- Re-grant the non-sensitive columns users legitimately need to write
-- when creating/updating their own profile row (RLS still restricts to own row).
GRANT INSERT (id, user_id, mfa_enabled, created_at, updated_at),
      UPDATE (mfa_enabled, updated_at)
  ON public.profiles TO authenticated;

-- Service role retains full access (bypasses RLS and column grants anyway,
-- but make intent explicit).
GRANT ALL ON public.profiles TO service_role;