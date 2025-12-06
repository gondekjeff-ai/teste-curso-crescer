-- Fix rate_limits RLS policy to allow service role operations
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Rate limits managed by service role" ON public.rate_limits;

-- Create new policies that allow service role to manage rate limits
-- Note: service_role bypasses RLS by default, but we need to allow the edge functions 
-- to insert/update/select through the client

-- Allow service role full access (this is the default behavior, but explicit is better)
-- For edge functions using service_role key, RLS is bypassed

-- Create a policy for cleanup operations (service role uses SECURITY DEFINER function)
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Note: This policy allows all operations, but the table should only be accessed
-- by edge functions using the service_role key or via the cleanup trigger.
-- Regular anon/authenticated users cannot access this table directly 
-- because they don't have GRANT permissions on the table.

-- Ensure only service role can actually use this table by revoking public access
REVOKE ALL ON public.rate_limits FROM anon, authenticated;
GRANT ALL ON public.rate_limits TO service_role;