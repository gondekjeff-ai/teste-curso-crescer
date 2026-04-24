# Área Administrativa OptiStrat — Guia de Configuração no PostgreSQL

Este documento descreve como ativar e configurar a área administrativa
(`/admin`) em um servidor Node.js + PostgreSQL externo (KingHost,
EasyPanel, VPS, etc.).

---

## 1. Visão geral da arquitetura admin

- **Frontend**: páginas React em `src/pages/admin/*` (compiladas para `dist/`).
  - `/admin/login` — tela de login (público)
  - `/admin` — dashboard (protegido)
  - `/admin/carousel`, `/admin/content`, `/admin/news`, `/admin/products`,
    `/admin/contacts`, `/admin/security` — gerenciadores
- **Backend**: Express em `server/api.js` — 40+ rotas em `/api/admin/*`
  protegidas por `authMiddleware + requireAdmin`.
- **Auth**: JWT custom (`server/auth.js`) + bcryptjs + TOTP MFA opcional.
- **Storage**: BLOB no PostgreSQL (`media` table), servido via `/api/media/:id`.

---

## 2. Pré-requisitos no servidor

- Node.js **>= 20.19.5** ativo (não funciona em hospedagem só-PHP)
- PostgreSQL **>= 13** acessível pela aplicação
- Variáveis de ambiente configuradas (ver seção 4)
- Comando de start: `npm start` (executa `node server.js`)
- Porta exposta (padrão `21002`, configurável via `PORT`)

---

## 3. Importar o schema e os dados no PostgreSQL

Conecte-se ao banco de produção e execute o dump SQL incluído no deploy:

```bash
# 1) Criar o banco (se ainda nao existir)
createdb -h pgsql.optistrat.com.br -U optistrat optistrat

# 2) Importar schema + dados
psql -h pgsql.optistrat.com.br -U optistrat -d optistrat \
     -f optistrat-database.sql
```

O arquivo `optistrat-database.sql` contém:
- Schema `auth` (users, sessions, identities — estrutura base)
- Schema `public` (13 tabelas da aplicação)
- Dados de produtos, notícias, carrossel, popups, conteúdo e contatos

> ⚠️ Se o erro `permission denied for schema auth` aparecer, rode o script
> conectado como **superuser** (`postgres`) ou peça ao DBA para criar o
> schema `auth` previamente.

---

## 4. Variáveis de ambiente obrigatórias

Crie um arquivo `.env` no servidor (baseado em `.env.example`):

```env
# Banco PostgreSQL
DATABASE_URL=postgresql://optistrat:SENHA@pgsql.optistrat.com.br:5432/optistrat
DB_SSL=false                 # use 'true' se o banco exigir SSL

# JWT — TROQUE para um valor aleatório de 64+ caracteres
JWT_SECRET=cole-aqui-um-segredo-forte-e-unico-com-no-minimo-64-chars

# Ambiente
NODE_ENV=production
PORT=21002

# (Opcional) Integrações
RESEND_API_KEY=               # Envio de e-mail via Resend
GROQ_API_KEY=                 # Chatbot AI streaming
```

> 🔒 **JWT_SECRET é crítico**: se mudar depois, todos os admins serão
> deslogados. Gere com: `openssl rand -hex 64`.

---

## 5. Criar o primeiro usuário admin

Após o servidor subir, faça uma requisição POST única para criar o admin:

```bash
curl -X POST https://optistrat.com.br/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@optistrat.com.br",
    "password": "SenhaForte123!@#"
  }'
```

- Retorna `{ "success": true }` na primeira chamada
- Retorna `409 Conflict` em chamadas seguintes (proteção contra criação dupla)
- A senha é gravada com hash bcrypt (10 rounds) na tabela `users`
- O papel `admin` é registrado em `user_roles`

---

## 6. Acessar o painel

1. Abra `https://seu-dominio.com/admin/login`
2. Entre com o e-mail e senha criados acima
3. (Opcional) Em **Segurança → MFA**, ative TOTP com Google Authenticator

---

## 7. Estrutura das rotas administrativas

| Página              | Rota frontend       | API backend                    |
|---------------------|---------------------|--------------------------------|
| Login               | `/admin/login`      | `POST /api/auth/login`         |
| Dashboard           | `/admin`            | `GET /api/admin/stats`         |
| Carrossel           | `/admin/carousel`   | `*/api/admin/carousel`         |
| Conteúdo do site    | `/admin/content`    | `*/api/admin/site-content/*`   |
| Notícias / Blog     | `/admin/news`       | `*/api/admin/news`             |
| Produtos / Soluções | `/admin/products`   | `*/api/admin/products`         |
| Contatos            | `/admin/contacts`   | `GET/DEL /api/admin/contacts`  |
| Segurança / MFA     | `/admin/security`   | `*/api/admin/mfa/*`            |
| Upload de mídia     | (qualquer)          | `POST /api/admin/upload`       |

Todas as rotas `/api/admin/*` exigem header
`Authorization: Bearer <jwt-token>` retornado pelo `/api/auth/login`.

---

## 8. Checklist de validação pós-deploy

- [ ] `curl https://seu-dominio.com/health` retorna `200 OK` com JSON
- [ ] `curl https://seu-dominio.com/api/products` retorna `[]` ou lista
- [ ] `https://seu-dominio.com/admin/login` carrega a tela de login
- [ ] Login com admin criado retorna token JWT
- [ ] Dashboard `/admin` carrega estatísticas reais
- [ ] Upload de imagem no carrossel funciona (BLOB salvo no DB)
- [ ] Logs do servidor mostram `Server running on port 21002`

---

## 9. Solução de problemas

### "Página /admin retorna 404"
- O servidor não está rodando Node.js. Verifique se a hospedagem suporta
  Node 20+ e se o entrypoint é `server.js` (não `index.html`).

### "Login retorna 401 Token inválido"
- O `JWT_SECRET` mudou entre o login e a requisição. Mantenha fixo.

### "Upload retorna 500"
- Tabela `media` ausente. Reimporte `optistrat-database.sql`.

### "Erro ao conectar PostgreSQL"
- Confira `DATABASE_URL` e a flag `DB_SSL`. Bancos que exigem SSL precisam
  de `DB_SSL=true`; KingHost interno geralmente é `false`.

### "Página admin carrega em branco"
- Build do frontend não inclui as rotas admin. Rode novamente o GitHub
  Actions ou faça `npm run build` localmente e suba o `dist/` manualmente.

---

## 10. Referências

- Código admin frontend: `src/pages/admin/`, `src/components/admin/`
- Código admin backend: `server/api.js` (procure por `requireAdmin`)
- Auth e JWT: `server/auth.js`
- Schema do banco: `optistrat-database.sql`, `supabase-migration.sql`
- Deploy KingHost: `KINGHOST-DEPLOY.md`
---

## Troubleshooting: 404 ao acessar /admin/login

Se ao abrir `https://optistrat.com.br/admin/login` voce ver 404, verifique
em ordem:

### 1. O servidor Node esta rodando?
O site PRECISA ser servido pelo `server.js` (Express), nao por um servidor
estatico (Apache/Nginx puro). O Express tem o catch-all SPA que faz o
React Router responder rotas como `/admin/login`.

```bash
curl -i https://optistrat.com.br/health
```
Deve retornar `200 OK` com JSON `{"status":"healthy",...}`. Se retornar
404 ou HTML, o `server.js` nao esta no ar - confira o painel da KingHost
e suba o processo Node.

### 2. O bundle compilado contem as rotas admin?
Na branch `stable-website`, dentro de `dist/assets/`, deve existir um
arquivo JS contendo as strings `AdminDashboard` e `AdminLogin`:

```bash
grep -l "AdminDashboard" dist/assets/*.js
```

O workflow `.github/workflows/lovable-deploy.yml` ja faz essa verificacao
automaticamente e FALHA se as rotas estiverem ausentes.

### 3. O arquivo index.html esta sendo servido como fallback?
Teste com curl - tem que retornar o HTML do React (com `<div id="root">`):

```bash
curl -i https://optistrat.com.br/admin/login
```

Se vier 404, o catch-all do Express nao esta funcionando. Confira em
`server.js` que existe `app.use((req, res) => res.sendFile(... 'index.html'))`
DEPOIS do `app.use(express.static(... 'dist'))`.

### 4. Reiniciei e continua 404 - como reproduzir local?
```bash
git clone https://github.com/gondekjeff-ai/teste-curso-crescer.git
cd teste-curso-crescer
git checkout stable-website
npm install --omit=dev
node server.js
# Acesse http://localhost:21002/admin/login
```

Se funcionar local mas nao em producao, o problema esta no proxy/host
da KingHost - verifique se as requests para `/admin/*` estao sendo
encaminhadas ao Node.

