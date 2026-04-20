-- =====================================================
-- OptiStrat - Database Export (Schema + Seed)
-- Gerado para PostgreSQL standalone (KingHost / EasyPanel)
-- =====================================================
-- Este arquivo eh um superset de supabase-migration.sql:
--   1. Cria as tabelas do schema public usadas pela aplicacao
--   2. Cria o schema/auth minimo para compatibilidade
--   3. Insere dados iniciais (vazio por padrao - popule via /admin)
-- =====================================================

\i supabase-migration.sql

-- =====================================================
-- SCHEMA auth (compatibilidade com codigo legado)
-- =====================================================
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email_confirmed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS auth.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS auth.identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  identity_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- DADOS INICIAIS (placeholders - popule via painel /admin)
-- =====================================================
-- INSERT INTO products (name, category, description, active) VALUES
--   ('Consultoria de TI', 'solution', 'Servicos de consultoria', true);

-- INSERT INTO carousel_images (image_url, alt_text, display_order, active) VALUES
--   ('/uploads/exemplo.jpg', 'Banner exemplo', 1, true);

-- =====================================================
-- FIM
-- =====================================================
