
-- 1) Revoke EXECUTE on SECURITY DEFINER trigger function from public roles
REVOKE EXECUTE ON FUNCTION public.enforce_chatbot_rate_limit() FROM PUBLIC, anon, authenticated;

-- 2) Remove broad listing policy on storage.objects for media bucket;
-- keep "Public can read individual media objects" which requires name IS NOT NULL.
DROP POLICY IF EXISTS "Public can read media" ON storage.objects;

-- 3) Protect MFA fields on profiles: enforce via trigger that non-service_role
-- cannot change mfa_secret or mfa_enabled.
CREATE OR REPLACE FUNCTION public.prevent_mfa_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    IF NEW.mfa_secret IS DISTINCT FROM OLD.mfa_secret
       OR NEW.mfa_enabled IS DISTINCT FROM OLD.mfa_enabled THEN
      RAISE EXCEPTION 'MFA fields can only be modified by the server';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_mfa_self_update() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS profiles_prevent_mfa_self_update ON public.profiles;
CREATE TRIGGER profiles_prevent_mfa_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_mfa_self_update();

-- 4) Prevent public clients from inserting a bot_response value into chatbot_interactions.
DROP POLICY IF EXISTS "Public can insert valid chatbot interactions" ON public.chatbot_interactions;
CREATE POLICY "Public can insert valid chatbot interactions"
ON public.chatbot_interactions
FOR INSERT
TO public
WITH CHECK (
  ((user_message IS NULL) OR (length(user_message) <= 2000))
  AND (
    auth.role() = 'service_role'
    OR bot_response IS NULL
  )
);
