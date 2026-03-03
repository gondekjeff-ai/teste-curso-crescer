# Deploy OptiStrat com Supabase Externo + EasyPanel

Guia completo para exportar o projeto do GitHub e deployar no EasyPanel com banco de dados Supabase externo.

## 📋 Arquitetura

```
┌─────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│   EasyPanel     │────▶│  Supabase Externo     │     │  Serviços        │
│   (Frontend)    │     │  (Auth, DB, Functions) │     │  Externos        │
│   Node.js       │     │                        │     │  - Resend (Email)│
│   Port 3000     │     │  URL: dm.aut8...       │     │  - Groq (AI)     │
└─────────────────┘     └──────────────────────┘     └──────────────────┘
```

## 🔧 Pré-requisitos

1. **Supabase Self-Hosted** rodando (ex: `https://dm.aut8.optistrat.com.br`)
2. **EasyPanel** v2.23.0+ com servidor VPS
3. **Repositório GitHub** com o código do projeto
4. **Contas**: Resend (email), Groq (chatbot AI)

---

## 1️⃣ Configurar Banco de Dados

### 1.1 Executar Migração SQL

No SQL Editor do seu Supabase externo, execute o arquivo `supabase-migration.sql` que contém:

- 12 tabelas (contacts, news, products, orders, carousel_images, index_popup, site_content, page_views, chatbot_interactions, profiles, user_roles, rate_limits)
- Políticas RLS para todas as tabelas
- Triggers de `updated_at`
- Dados iniciais do site

```bash
# Opção 1: Via SQL Editor do Supabase Dashboard
# Cole o conteúdo de supabase-migration.sql e execute

# Opção 2: Via psql (se tiver acesso direto)
psql -h SEU_HOST -U postgres -d postgres -f supabase-migration.sql
```

### 1.2 Criar Usuário Admin

1. No Supabase Dashboard → Authentication → Users → "Add User"
2. Crie um usuário com email/senha
3. Copie o UUID do usuário
4. Execute no SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU-USER-UUID', 'admin');

INSERT INTO public.profiles (user_id, mfa_enabled)
VALUES ('SEU-USER-UUID', false);
```

---

## 2️⃣ Variáveis de Ambiente (EasyPanel)

### Variáveis de Build (VITE_*)

⚠️ **IMPORTANTE**: Variáveis `VITE_*` são embutidas no bundle durante o build. Alterar depois exige REBUILD.

```env
# Obrigatórias - Frontend
VITE_SUPABASE_URL=https://dm.aut8.optistrat.com.br
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_ANON_KEY_AQUI
VITE_SUPABASE_PROJECT_ID=optistrat-external

# Servidor
NODE_ENV=production
PORT=3000
```

### Variáveis de Runtime (Edge Functions)

Estas devem ser configuradas como **Secrets** no Supabase:

| Secret | Descrição | Onde Obter |
|--------|-----------|------------|
| `SUPABASE_URL` | URL do Supabase | Seu domínio Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Chave anônima | Supabase Dashboard → Settings → API |
| `RESEND_API_KEY` | API Key do Resend | https://resend.com/api-keys |
| `GROQ_API_KEY` | API Key do Groq | https://console.groq.com |

---

## 3️⃣ Deploy das Edge Functions

As Edge Functions devem ser deployadas no seu Supabase externo. Os arquivos estão em `supabase/functions/`:

| Função | Descrição | Secrets Necessárias |
|--------|-----------|---------------------|
| `ai-chatbot` | Chatbot com IA (Groq) | GROQ_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| `send-contact-email` | Envio de emails de contato | RESEND_API_KEY |
| `send-order-email` | Envio de emails de orçamento | RESEND_API_KEY |
| `check-rate-limit` | Rate limiting server-side | Nenhuma |
| `fetch-tech-news` | Buscar notícias de tech | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| `setup-mfa` | Configurar 2FA | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| `verify-mfa` | Verificar código 2FA | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| `enable-mfa` | Ativar 2FA | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| `disable-mfa` | Desativar 2FA | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |

### Deploy via Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login (para self-hosted, configure o endpoint)
supabase login

# Linkar ao projeto
supabase link --project-ref SEU_PROJECT_REF

# Deploy de todas as functions
supabase functions deploy ai-chatbot --no-verify-jwt
supabase functions deploy send-contact-email --no-verify-jwt
supabase functions deploy send-order-email --no-verify-jwt
supabase functions deploy check-rate-limit --no-verify-jwt
supabase functions deploy fetch-tech-news --no-verify-jwt
supabase functions deploy setup-mfa --no-verify-jwt
supabase functions deploy verify-mfa --no-verify-jwt
supabase functions deploy enable-mfa --no-verify-jwt
supabase functions deploy disable-mfa --no-verify-jwt
```

### Configurar Secrets no Supabase

```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set GROQ_API_KEY=gsk_xxxxx
```

---

## 4️⃣ Deploy no EasyPanel

### 4.1 Criar Projeto

1. Login no EasyPanel → "Create Project"
2. Nome: `optistrat`
3. Tipo: Docker (Git Repository)
4. Conectar ao repositório GitHub

### 4.2 Configuração de Build

```yaml
Build Method: Dockerfile
Dockerfile Path: ./Dockerfile
Build Context: .
```

### 4.3 Variáveis de Ambiente

Adicione no EasyPanel → Environment Variables:

```
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=https://dm.aut8.optistrat.com.br
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_ANON_KEY
VITE_SUPABASE_PROJECT_ID=optistrat-external
```

### 4.4 Networking

```yaml
Container Port: 3000
Protocol: HTTP
Health Check Path: /health
Health Check Interval: 30s
```

### 4.5 Deploy

Clique em "Deploy" e aguarde o build (2-5 minutos).

---

## 5️⃣ Configurar Domínio

### DNS

```
Tipo: A    | Nome: @   | Valor: IP_DO_SERVIDOR
Tipo: CNAME | Nome: www | Valor: seu-dominio.com
```

### SSL

EasyPanel gera certificado Let's Encrypt automaticamente.

### Configurar URLs de Redirect no Supabase

No Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: https://seu-dominio.com
Redirect URLs:
  - https://seu-dominio.com/**
  - https://seu-dominio.com/admin/**
  - http://localhost:3000/** (para dev)
```

---

## 6️⃣ Conexão Frontend ↔ Supabase

O frontend conecta ao Supabase via variáveis de ambiente:

```typescript
// src/integrations/supabase/client.ts (NÃO EDITAR - gerado automaticamente)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { storage: localStorage, persistSession: true, autoRefreshToken: true }
});
```

### Chamadas às Edge Functions

O frontend invoca Edge Functions de duas formas:

```typescript
// 1. Via SDK (preferido)
const { data, error } = await supabase.functions.invoke('nome-funcao', {
  body: { ... }
});

// 2. Via fetch direto (para streaming - usado no chatbot)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const response = await fetch(`${supabaseUrl}/functions/v1/ai-chatbot`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseKey}`,
  },
  body: JSON.stringify({ message })
});
```

---

## 7️⃣ Funcionalidades e Dependências

| Funcionalidade | Tabelas | Edge Functions | Secrets |
|----------------|---------|----------------|---------|
| Site público | site_content, carousel_images, index_popup, page_views | - | - |
| Blog/Notícias | news | fetch-tech-news | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| Formulário de contato | contacts | send-contact-email | RESEND_API_KEY |
| Orçamento | orders | send-order-email | RESEND_API_KEY |
| Chatbot AI | chatbot_interactions | ai-chatbot | GROQ_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| Admin Login | user_roles, profiles | check-rate-limit | - |
| Admin 2FA | profiles | setup-mfa, verify-mfa, enable-mfa, disable-mfa | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| Admin CRUD | news, products, carousel_images, site_content | - | - |
| Newsletter | - | send-contact-email | RESEND_API_KEY |

---

## 8️⃣ Checklist de Deploy

### Banco de Dados
- [ ] Migração SQL executada sem erros
- [ ] RLS habilitado em todas as tabelas
- [ ] Usuário admin criado via Auth
- [ ] Registro na tabela user_roles

### Edge Functions
- [ ] Todas as 9 functions deployadas
- [ ] Secrets configuradas (RESEND_API_KEY, GROQ_API_KEY)
- [ ] JWT verification desabilitado (verify_jwt = false)

### EasyPanel
- [ ] Variáveis de ambiente configuradas
- [ ] Build completou sem erros
- [ ] Health check respondendo em /health
- [ ] Domínio configurado com SSL

### Testes
- [ ] Página inicial carrega
- [ ] Formulário de contato funciona
- [ ] Chatbot responde
- [ ] Login admin funciona
- [ ] Dashboard admin carrega dados
- [ ] Routing SPA funciona (refresh em /admin)

---

## 9️⃣ Troubleshooting

### "Failed to fetch" nos formulários
→ Verifique se `VITE_SUPABASE_URL` está correto e se as Edge Functions estão deployadas.

### Login redireciona para localhost
→ Verifique as Redirect URLs no Supabase Auth.

### Edge Functions retornam 500
→ Verifique se as secrets estão configuradas no Supabase.

### Dados não aparecem no admin
→ Verifique se o usuário tem role 'admin' na tabela user_roles.

### 404 ao recarregar páginas
→ Verifique se o server.js está servindo o fallback para index.html.

---

**Versão**: 1.0 | **Data**: 2026-03
