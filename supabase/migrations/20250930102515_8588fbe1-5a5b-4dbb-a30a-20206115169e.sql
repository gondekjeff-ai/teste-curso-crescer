-- Remove the SECURITY DEFINER view that was flagged by the linter
DROP VIEW IF EXISTS public.admin_contacts;

-- The security fix is already complete with the RLS policy
-- The contacts table now has proper access control:
-- 1. Only admin users can SELECT contact data
-- 2. Anyone can still INSERT contacts (contact form submissions work)
-- 3. No unauthorized access to sensitive customer data

-- Optional: Create a function for admins to safely query contacts if needed
CREATE OR REPLACE FUNCTION public.get_contacts_for_admin()
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.name,
    c.email,
    c.message,
    c.created_at
  FROM public.contacts c
  WHERE public.has_role(auth.uid(), 'admin');
$$;