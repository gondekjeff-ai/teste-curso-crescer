# Deploy na KingHost (Node.js)

## Pré-requisitos

- Plano KingHost com suporte a Node.js
- PostgreSQL habilitado na KingHost
- Repositório GitHub vinculado à KingHost

## 1. Configurar Variáveis de Ambiente

No painel da KingHost, configure as seguintes variáveis de ambiente:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://optistrat:FuEO4FYYOAl1QaVmZWRh@pgsql.optistrat.com.br:5432/optistrat` |
| `DB_SSL` | `false` |
| `JWT_SECRET` | (gere um segredo forte, ex: `openssl rand -hex 32`) |
| `NODE_ENV` | `production` |
| `PORT` | (use a porta fornecida pela KingHost, geralmente 3000) |
| `RESEND_API_KEY` | (opcional, para envio de emails) |
| `GROQ_API_KEY` | (opcional, para chatbot IA) |

## 2. Executar a Migração do Banco

Conecte ao PostgreSQL e execute o script de migração:

```bash
psql -h pgsql.optistrat.com.br -U optistrat -d optistrat -f supabase-migration.sql
```

## 3. Deploy Automático

A KingHost fará automaticamente:
1. `git clone` do repositório
2. `npm install` (que também executa `npm run build` via postinstall)
3. `npm start` (que executa `node server.js`)

## 4. Criar o Primeiro Administrador

Após o deploy, acesse:

```bash
curl -X POST https://seu-dominio.com.br/api/setup \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@optistrat.com.br", "password": "sua-senha-segura"}'
```

## Estrutura do Projeto

```
├── server.js          # Servidor Express (ponto de entrada)
├── server/
│   ├── api.js         # Rotas da API
│   ├── auth.js        # Autenticação JWT
│   └── db.js          # Pool PostgreSQL
├── dist/              # Frontend compilado (gerado pelo build)
└── package.json       # Scripts: start, build, postinstall
```

## Troubleshooting

- **Erro de conexão com DB**: Verifique se `DATABASE_URL` está correto e se `DB_SSL=false` para conexões internas da KingHost
- **Porta ocupada**: A KingHost define a porta via variável `PORT`; o server.js já usa `process.env.PORT`
- **Build falha**: Verifique se a versão do Node.js é >= 20
