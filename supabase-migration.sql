-- =============================================
-- SCRIPT DE MIGRAÇÃO COMPLETO - OptiStrat
-- Execute este SQL no seu Supabase externo
-- =============================================

-- 1. TABELAS

CREATE TABLE IF NOT EXISTS public.carousel_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chatbot_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_message TEXT,
  bot_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.index_popup (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  text TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  services TEXT,
  implementation_deadline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  mfa_secret TEXT,
  mfa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  content JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ENABLE RLS ON ALL TABLES

ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.index_popup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES

-- carousel_images
CREATE POLICY "Admins can manage carousel images" ON public.carousel_images FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));
CREATE POLICY "Public can read active carousel images" ON public.carousel_images FOR SELECT
  USING (active = true);

-- chatbot_interactions
CREATE POLICY "Admins can read chatbot_interactions" ON public.chatbot_interactions FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));
CREATE POLICY "Allow anonymous inserts on chatbot_interactions" ON public.chatbot_interactions FOR INSERT
  WITH CHECK (true);

-- contacts
CREATE POLICY "Admins can read contacts" ON public.contacts FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));
CREATE POLICY "Allow anonymous inserts on contacts" ON public.contacts FOR INSERT
  WITH CHECK (true);

-- index_popup
CREATE POLICY "Admins can manage popups" ON public.index_popup FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));
CREATE POLICY "Public can read active popups" ON public.index_popup FOR SELECT
  USING (active = true);

-- news
CREATE POLICY "Admins can manage news" ON public.news FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));
CREATE POLICY "Public can read published news" ON public.news FOR SELECT
  USING (published = true);

-- orders
CREATE POLICY "Admins can read orders" ON public.orders FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));
CREATE POLICY "Allow anonymous inserts on orders" ON public.orders FOR INSERT
  WITH CHECK (true);

-- page_views
CREATE POLICY "Admins can read page_views" ON public.page_views FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));
CREATE POLICY "Allow anonymous inserts on page_views" ON public.page_views FOR INSERT
  WITH CHECK (true);

-- products
CREATE POLICY "Admins can manage products" ON public.products FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));
CREATE POLICY "Public can read active products" ON public.products FOR SELECT
  USING (active = true);

-- profiles
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- site_content
CREATE POLICY "Admins can manage site content" ON public.site_content FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));
CREATE POLICY "Public can read site content" ON public.site_content FOR SELECT
  USING (true);

-- user_roles
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- rate_limits (public insert/read for edge functions)
CREATE POLICY "Allow inserts on rate_limits" ON public.rate_limits FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Allow reads on rate_limits" ON public.rate_limits FOR SELECT
  USING (true);

-- =============================================
-- 4. UNIQUE CONSTRAINT para user_roles
-- =============================================
ALTER TABLE public.user_roles ADD CONSTRAINT unique_user_role UNIQUE (user_id, role);

-- =============================================
-- 5. TRIGGERS para updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 6. DADOS INICIAIS
-- =============================================

-- Conteúdo do Hero
INSERT INTO public.site_content (section, content)
VALUES ('hero', '{"title": "Otimize sua Infraestrutura de TI com Soluções Especializadas", "subtitle": "Gestão completa de TI que potencializa desempenho, fortalece segurança e acelera o crescimento do seu negócio.", "primaryButtonText": "Nossos Serviços", "secondaryButtonText": "Contatos"}')
ON CONFLICT DO NOTHING;

-- Produtos/Serviços iniciais
INSERT INTO public.products (name, description, category, active) VALUES
  ('Consultoria em TI', 'Planejamento estratégico e avaliação completa da sua infraestrutura de TI', 'service', true),
  ('Gerenciamento de Rede', 'Monitoramento e otimização de redes 24/7 para máxima performance', 'service', true),
  ('Segurança Cibernética', 'Proteção avançada contra ameaças digitais e auditorias de segurança', 'service', true),
  ('Cloud Computing', 'Migração e gerenciamento de infraestrutura em nuvem AWS, Azure e GCP', 'service', true),
  ('Backup Automático', 'Soluções de backup e recuperação de dados com redundância garantida', 'service', true),
  ('Suporte Técnico 24h', 'Equipe dedicada disponível 24/7 para resolver incidentes críticos', 'service', true),
  ('Infraestrutura Completa', 'Solução integrada de servidores, redes e sistemas para sua empresa', 'solution', true),
  ('Segurança 360°', 'Pacote completo de cibersegurança com monitoramento proativo', 'solution', true),
  ('Migração para Nuvem', 'Migração segura e planejada para ambientes cloud', 'solution', true),
  ('Gestão de TI Terceirizada', 'Gerenciamento completo da sua TI por especialistas dedicados', 'solution', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- 7. CRIAR ADMIN (executar após criar user via Auth)
-- =============================================
-- INSERT INTO public.user_roles (user_id, role) VALUES ('SEU-UUID', 'admin');
-- INSERT INTO public.profiles (user_id, mfa_enabled) VALUES ('SEU-UUID', false);
