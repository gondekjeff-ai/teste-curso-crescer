# 🚀 Deploy com Fastify + PM2

O projeto migrou de **Express → Fastify** e agora roda sob **PM2** para gerenciamento de processo (auto-restart, logs centralizados, zero-downtime reload).

## Pré-requisitos

- Node.js **22.1.0+** (versão fixada em `.nvmrc` / `.node-version`)
- PM2 instalado globalmente: `npm install -g pm2`
- PostgreSQL acessível (variável `DATABASE_URL`)

## Variáveis de ambiente

```bash
NODE_ENV=production
PORT=21002
HOST=0.0.0.0
DATABASE_URL=postgresql://user:pass@host:5432/optistrat
DB_SSL=false                    # ou 'true' para SSL
JWT_SECRET=troque-em-producao
RESEND_API_KEY=...              # opcional
GROQ_API_KEY=...                # opcional (chatbot)
```

## Deploy direto (sem Docker)

```bash
# 1. instalar dependências e buildar
npm install
npm run build

# 2. iniciar com PM2
pm2 start ecosystem.config.cjs --env production

# 3. salvar e habilitar boot automático
pm2 save
pm2 startup            # siga a instrução impressa

# 4. verificar
pm2 status
pm2 logs optistrat
curl http://localhost:21002/health
curl -I http://localhost:21002/admin/login   # deve retornar 200
```

## Comandos úteis

```bash
pm2 reload optistrat        # zero-downtime reload (após deploy de código)
pm2 restart optistrat       # restart simples
pm2 stop optistrat
pm2 delete optistrat
pm2 monit                   # dashboard de CPU/memória
pm2 logs optistrat --lines 200
```

## Deploy com Docker

O `Dockerfile` já usa `pm2-runtime` como ENTRYPOINT (modo container-native do PM2):

```bash
docker build -t optistrat .
docker run -d --name optistrat -p 3000:21002 \
  -e DATABASE_URL=... -e JWT_SECRET=... \
  optistrat
```

## Cluster mode (opcional)

Para escalar horizontalmente em um servidor multi-core, edite `ecosystem.config.cjs`:

```js
exec_mode: 'cluster',
instances: 'max',   // ou número específico
```

E rode `pm2 reload optistrat`. PM2 distribui requests automaticamente.

## Troubleshooting `/admin/login` retornando 404

1. **Confirme que o servidor Node está rodando** (não apenas Nginx servindo HTML estático):
   ```bash
   curl -i http://seu-servidor:21002/health
   # Deve retornar: {"status":"healthy",...}
   ```

2. **Confirme que o build existe**:
   ```bash
   ls -la dist/index.html
   ```

3. **Verifique logs do PM2**:
   ```bash
   pm2 logs optistrat --err --lines 100
   ```

4. **Se estiver atrás de Nginx**, garanta o proxy correto:
   ```nginx
   location / {
     proxy_pass http://127.0.0.1:21002;
     proxy_set_header Host $host;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

## Por que Fastify?

- **2-3x mais rápido** que Express em throughput
- Schema validation nativa, logging estruturado (pino), hooks granulares
- Compatível 100% com PM2 (cluster, fork, pm2-runtime)
- Manutenção ativa, ecossistema moderno