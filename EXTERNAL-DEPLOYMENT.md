# Deployment Guide - OptiStrat (EasyPanel / Docker)

## Requisitos

- Docker & Docker Compose
- PostgreSQL 12+ (externo)
- Node.js 20+ (apenas para desenvolvimento local)

## Configuração do Banco de Dados

### 1. Executar o script de migração

Conecte ao PostgreSQL e execute o arquivo `supabase-migration.sql`:

```bash
psql -h pgsql.optistrat.com.br -U optistrat -d optistrat -f supabase-migration.sql
```

### 2. Variáveis de Ambiente (EasyPanel)

Configure no EasyPanel as seguintes variáveis:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `DATABASE_URL` | `postgresql://optistrat:<SENHA>@pgsql.optistrat.com.br:5432/optistrat` | Conexão PostgreSQL |
| `DB_SSL` | `true` | SSL do banco (use `false` se não suportar) |
| `JWT_SECRET` | (gere um segredo forte) | Segredo para tokens JWT |
| `RESEND_API_KEY` | (sua chave Resend) | Para envio de emails |
| `GROQ_API_KEY` | (sua chave Groq) | Para o chatbot IA |
| `NODE_ENV` | `production` | Ambiente |
| `PORT` | `3000` | Porta do servidor |

### 3. Deploy via Docker

```bash
docker-compose up -d --build
```

### 4. Criar o primeiro administrador

Após o deploy, execute:

```bash
curl -X POST https://seu-dominio.com.br/api/setup \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@optistrat.com.br", "password": "sua-senha-segura"}'
```

## Arquitetura

```
Frontend (React/Vite) → Express API (server.js) → PostgreSQL
                         ↓
                    server/api.js (rotas)
                    server/auth.js (JWT + MFA)
                    server/db.js (pool PostgreSQL)
```

### Armazenamento de Mídia

Imagens e vídeos são armazenados como BLOB na tabela `media` do PostgreSQL.
O endpoint `GET /api/media/:id` serve os arquivos diretamente do banco.

### Endpoints Públicos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/news` | Notícias publicadas |
| GET | `/api/news/:id` | Detalhe da notícia |
| GET | `/api/products` | Produtos ativos |
| GET | `/api/carousel` | Imagens do carrossel |
| GET | `/api/popups` | Popups ativos |
| GET | `/api/site-content/:section` | Conteúdo do site |
| GET | `/api/media/:id` | Servir mídia (BLOB) |
| POST | `/api/contacts` | Enviar contato |
| POST | `/api/orders` | Enviar orçamento |
| POST | `/api/chatbot` | Chat IA (streaming) |

### Endpoints Admin (requer JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Dados do usuário |
| CRUD | `/api/admin/news` | Gerenciar notícias |
| CRUD | `/api/admin/products` | Gerenciar produtos |
| CRUD | `/api/admin/carousel` | Gerenciar carrossel |
| CRUD | `/api/admin/popups` | Gerenciar popups |
| CRUD | `/api/admin/contacts` | Ver contatos |
| GET | `/api/admin/orders` | Ver orçamentos |
| GET | `/api/admin/stats` | Dashboard stats |
| PUT | `/api/admin/site-content/:section` | Editar conteúdo |
| POST | `/api/admin/upload` | Upload de mídia (BLOB) |
| GET | `/api/admin/media` | Listar mídia |

## GitHub Actions

O workflow `.github/workflows/lovable-deploy.yml` faz build e deploy automático
para a branch `stable-website` a cada push na `main`.
