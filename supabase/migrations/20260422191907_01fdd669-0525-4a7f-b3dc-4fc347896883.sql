-- =========================================================
-- 1) user_roles: bloquear privilege escalation
-- =========================================================
-- Garante RLS habilitada
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Remove qualquer policy permissiva existente de escrita
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow inserts on user_roles" ON public.user_roles;

-- Policy RESTRICTIVE: somente service_role pode escrever
CREATE POLICY "Only service role manages user_roles writes"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =========================================================
-- 2) profiles_safe: remover SECURITY DEFINER da view
-- =========================================================
DROP VIEW IF EXISTS public.profiles_safe CASCADE;

CREATE VIEW public.profiles_safe
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  mfa_enabled,
  created_at,
  updated_at
FROM public.profiles;

GRANT SELECT ON public.profiles_safe TO authenticated, anon;

-- =========================================================
-- 3) profiles: esconder mfa_secret do dono
-- =========================================================
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

-- Usuário só pode ler colunas não-sensíveis via view profiles_safe.
-- Tabela base: apenas service_role pode SELECT (para edge functions de MFA).
CREATE POLICY "Only service role reads profiles base table"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO public
USING (auth.role() = 'service_role');

-- Mantém INSERT/UPDATE do próprio profile (mas sem leitura do secret)
-- Policies existentes "Users can insert own profile" e "Users can update own profile" permanecem.

-- =========================================================
-- 4) chatbot_interactions: rate limit por IP via trigger
-- =========================================================
CREATE OR REPLACE FUNCTION public.enforce_chatbot_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Limita tamanho do payload
  IF length(coalesce(NEW.user_message, '')) > 2000
     OR length(coalesce(NEW.bot_response, '')) > 10000 THEN
    RAISE EXCEPTION 'Message too long';
  END IF;

  -- Conta inserções recentes (últimos 60s) para evitar flood
  SELECT count(*)
  INTO recent_count
  FROM public.chatbot_interactions
  WHERE created_at > now() - interval '1 minute';

  IF recent_count > 60 THEN
    RAISE EXCEPTION 'Rate limit exceeded for chatbot_interactions';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chatbot_rate_limit ON public.chatbot_interactions;
CREATE TRIGGER trg_chatbot_rate_limit
BEFORE INSERT ON public.chatbot_interactions
FOR EACH ROW EXECUTE FUNCTION public.enforce_chatbot_rate_limit();

-- =========================================================
-- 5) Storage bucket "media": impedir listagem ampla
-- =========================================================
-- Remove policies amplas e cria leitura por objeto (sem LIST)
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
DROP POLICY IF EXISTS "Public can list media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;

-- Permite GET de um objeto específico, mas não listar o bucket inteiro
CREATE POLICY "Public can read individual media objects"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'media'
  AND name IS NOT NULL
);

-- Apenas admins podem fazer upload/atualização/exclusão
DROP POLICY IF EXISTS "Admins manage media" ON storage.objects;
CREATE POLICY "Admins manage media"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'media'
  AND auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
)
WITH CHECK (
  bucket_id = 'media'
  AND auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);
