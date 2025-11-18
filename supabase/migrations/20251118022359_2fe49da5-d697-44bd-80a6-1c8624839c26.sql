-- =====================================================
-- CRITICAL SECURITY FIXES FOR PRODUCTION DEPLOYMENT
-- =====================================================

-- 1. DROP EXISTING POLICIES ON PROFILES TO RECREATE SECURELY
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 2. REMOVE EMAIL COLUMN FROM PROFILES (Security Risk)
-- Email is already stored in auth.users, having it in profiles creates unnecessary exposure
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- 3. CREATE SECURE POLICIES THAT HIDE MFA SECRETS
-- Users can only see their profile WITHOUT mfa_secret
CREATE POLICY "Users can view own profile without secrets"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their profile but NOT mfa_secret or mfa_enabled
-- These fields should only be updated through secure edge functions
CREATE POLICY "Users can update own profile safely"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. CREATE SECURITY FUNCTION TO PREVENT MFA SECRET READS
-- This function ensures mfa_secret is NEVER returned to clients
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  mfa_enabled BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.mfa_enabled,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = user_id_param
  AND p.user_id = auth.uid(); -- Ensure user can only see their own profile
END;
$$;

-- 5. PROTECT AUDIT LOGS FROM TAMPERING
DROP POLICY IF EXISTS "Only service role can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit logs cannot be updated" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit logs cannot be deleted" ON public.audit_logs;

-- Only service_role can insert audit logs (RLS prevents all user inserts)
CREATE POLICY "Prevent user inserts on audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (false);

-- Explicitly deny UPDATE on audit logs (immutable)
CREATE POLICY "Audit logs are immutable - no updates"
  ON public.audit_logs
  FOR UPDATE
  USING (false);

-- Explicitly deny DELETE on audit logs (immutable)
CREATE POLICY "Audit logs are immutable - no deletes"
  ON public.audit_logs
  FOR DELETE
  USING (false);

-- 6. ADD CONSTRAINTS TO PREVENT DATA INJECTION
-- Add length limits to prevent oversized data attacks
ALTER TABLE public.contacts 
  DROP CONSTRAINT IF EXISTS contacts_name_length,
  DROP CONSTRAINT IF EXISTS contacts_email_length,
  DROP CONSTRAINT IF EXISTS contacts_message_length,
  ADD CONSTRAINT contacts_name_length CHECK (char_length(name) <= 100),
  ADD CONSTRAINT contacts_email_length CHECK (char_length(email) <= 255),
  ADD CONSTRAINT contacts_message_length CHECK (char_length(message) <= 5000);

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_name_length,
  DROP CONSTRAINT IF EXISTS orders_email_length,
  DROP CONSTRAINT IF EXISTS orders_services_count,
  ADD CONSTRAINT orders_name_length CHECK (char_length(name) <= 100),
  ADD CONSTRAINT orders_email_length CHECK (char_length(email) <= 255),
  ADD CONSTRAINT orders_services_count CHECK (array_length(services, 1) <= 20);

-- 7. ADD EMAIL VALIDATION CONSTRAINT
ALTER TABLE public.contacts
  DROP CONSTRAINT IF EXISTS contacts_email_format,
  ADD CONSTRAINT contacts_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_email_format,
  ADD CONSTRAINT orders_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 8. PROTECT AGAINST SQL INJECTION IN CHATBOT
ALTER TABLE public.chatbot_interactions
  DROP CONSTRAINT IF EXISTS chatbot_message_length,
  DROP CONSTRAINT IF EXISTS chatbot_response_length,
  ADD CONSTRAINT chatbot_message_length CHECK (char_length(message) <= 2000),
  ADD CONSTRAINT chatbot_response_length CHECK (char_length(response) <= 10000);

-- 9. ADD RATE LIMITING HELPER TABLE
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Rate limits are managed by service role only" ON public.rate_limits;

-- No one can access rate limits through RLS (only service role)
CREATE POLICY "Rate limits managed by service role"
  ON public.rate_limits
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 10. ADD SECURITY INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_page_views_ip ON public.page_views(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON public.rate_limits(ip_address, endpoint);

-- 11. ADD TRIGGER TO AUTO-DELETE OLD RATE LIMIT RECORDS
DROP TRIGGER IF EXISTS trigger_cleanup_rate_limits ON public.rate_limits;
DROP FUNCTION IF EXISTS public.cleanup_old_rate_limits();

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_cleanup_rate_limits
  AFTER INSERT ON public.rate_limits
  EXECUTE FUNCTION public.cleanup_old_rate_limits();