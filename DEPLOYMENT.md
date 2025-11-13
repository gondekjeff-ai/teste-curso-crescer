# Deploy OptiStrat no EasyPanel v2.23.0

Este documento fornece um guia completo e detalhado para fazer deploy da aplicação OptiStrat no EasyPanel versão 2.23.0 usando Docker e Node.js v20.19.5.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Configuração Inicial](#configuração-inicial)
4. [Deploy no EasyPanel](#deploy-no-easypanel)
5. [Configuração de Domínios](#configuração-de-domínios)
6. [Verificação e Testes](#verificação-e-testes)
7. [Troubleshooting](#troubleshooting)
8. [Manutenção e Atualizações](#manutenção-e-atualizações)

## 🔧 Pré-requisitos

### Requisitos de Sistema

- **Node.js**: v20.19.5 (especificado em `.node-version` e `Dockerfile`)
- **Docker**: Qualquer versão recente
- **Git**: Para controle de versão

### Serviços Externos Necessários

1. **Conta EasyPanel**
   - URL: https://easypanel.io
   - Servidor VPS conectado ao EasyPanel
   - EasyPanel v2.23.0 ou superior

2. **Projeto Supabase**
   - URL: https://supabase.com/dashboard/project/bsbwwgicxjmjshofxyop
   - Acesso às credenciais (URL e Anon Key)
   - Projeto ativo e configurado

3. **Repositório Git**
   - GitHub, GitLab, ou Bitbucket
   - Push access configurado

### Credenciais Necessárias

Antes de começar, tenha em mãos:

- ✅ URL do projeto Supabase
- ✅ Anon Key do Supabase
- ✅ Project ID do Supabase
- ✅ URL do repositório Git
- ✅ Credenciais de acesso ao EasyPanel

## 📁 Estrutura do Projeto

### Arquivos Principais para Deploy

```
optistrat/
├── Dockerfile                 # Configuração Docker (Node.js 20.19.5)
├── .dockerignore             # Arquivos ignorados no build
├── docker-compose.yml        # Configuração Docker Compose (opcional)
├── .node-version             # Versão do Node.js (20.19.5)
├── package.json              # Dependências e scripts
├── server.js                 # Servidor Express para produção
├── vite.config.ts            # Configuração Vite
├── dist/                     # Build de produção (gerado)
└── src/                      # Código fonte da aplicação
    ├── pages/
    │   ├── AdminLogin.tsx    # Página de login admin
    │   └── AdminDashboard.tsx # Dashboard administrativo
    ├── hooks/
    │   └── useAuth.tsx       # Hook de autenticação
    └── integrations/
        └── supabase/         # Integração Supabase
```

### Dockerfile Explicado

```dockerfile
# Build stage - Compila a aplicação
FROM node:20.19.5-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage - Serve a aplicação compilada
FROM node:20.19.5-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Características:**
- ✅ Build em duas etapas para imagem otimizada
- ✅ Node.js v20.19.5 Alpine (imagem leve)
- ✅ Serve estático usando `serve`
- ✅ Porta 3000 exposta
- ✅ Suporte a SPA routing

## 🚀 Configuração Inicial

### 1. Verificar Configuração Local

Antes de fazer deploy, teste localmente:

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>
cd optistrat

# Verifique a versão do Node.js
node --version  # Deve mostrar v20.19.5

# Se necessário, instale a versão correta
nvm install 20.19.5
nvm use 20.19.5

# Instale as dependências
npm install

# Teste o build
npm run build

# Teste localmente
npm run preview
# ou
node server.js
```

### 2. Configurar Variáveis de Ambiente Localmente

Crie um arquivo `.env` local (NÃO COMMITAR):

```env
# Node Environment
NODE_ENV=production

# Supabase Configuration
VITE_SUPABASE_URL=https://bsbwwgicxjmjshofxyop.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
VITE_SUPABASE_PROJECT_ID=bsbwwgicxjmjshofxyop

# Server Configuration
PORT=3000
```

### 3. Testar Build Docker Localmente

```bash
# Build da imagem Docker
docker build -t optistrat:test .

# Executar container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e VITE_SUPABASE_URL=https://bsbwwgicxjmjshofxyop.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui \
  -e VITE_SUPABASE_PROJECT_ID=bsbwwgicxjmjshofxyop \
  optistrat:test

# Testar em http://localhost:3000
```

## 🌐 Deploy no EasyPanel

### Passo 1: Criar Novo Projeto

1. **Login no EasyPanel**
   - Acesse: https://app.easypanel.io
   - Faça login com suas credenciais
   - Selecione seu servidor

2. **Criar Novo Projeto**
   ```
   Nome: optistrat
   Tipo: Docker (Git Repository)
   ```

### Passo 2: Conectar Repositório Git

1. **Selecionar Source**
   - Clique em "Create Project"
   - Selecione "Git Repository"

2. **Configurar Git**
   ```
   Provider: GitHub/GitLab/Bitbucket
   Repository: seu-usuario/optistrat
   Branch: main
   ```

3. **Autorizar Acesso**
   - Autorize o EasyPanel a acessar seu repositório
   - Conceda permissões de leitura

### Passo 3: Configurar Build

O EasyPanel detectará automaticamente o `Dockerfile`.

**Build Configuration:**

```yaml
Build Method: Dockerfile
Dockerfile Path: ./Dockerfile
Build Context: .
Build Arguments: (nenhum necessário)
```

**⚠️ Importante**: 
- O EasyPanel usa o `Dockerfile` na raiz do projeto
- O build acontece no servidor do EasyPanel
- Cache de build é automático após o primeiro build

### Passo 4: Configurar Variáveis de Ambiente

No painel do EasyPanel, adicione as seguintes variáveis:

#### Variáveis Obrigatórias

```bash
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=https://bsbwwgicxjmjshofxyop.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
VITE_SUPABASE_PROJECT_ID=bsbwwgicxjmjshofxyop
```

#### Como Obter as Credenciais Supabase

1. Acesse: https://supabase.com/dashboard/project/bsbwwgicxjmjshofxyop/settings/api
2. Copie:
   - **URL**: Seção "Project URL"
   - **Anon Key**: Seção "Project API keys" → "anon" "public"

**⚠️ Segurança**:
- ✅ Use apenas a ANON KEY (pública)
- ❌ NUNCA use a SERVICE ROLE KEY no frontend
- ✅ Mantenha as secrets no EasyPanel, não no código

### Passo 5: Configurar Networking

#### Port Mapping

```yaml
Container Port: 3000
Protocol: HTTP
External Port: 80 (ou 443 para HTTPS)
```

#### Configurações de Rede

```yaml
Health Check: Enabled
  - Path: /
  - Interval: 30s
  - Timeout: 10s
  - Retries: 3

Resource Limits:
  - Memory: 512MB (mínimo) / 1GB (recomendado)
  - CPU: 0.5 cores (mínimo) / 1 core (recomendado)
```

### Passo 6: Configurar Persistência (Opcional)

Como esta é uma aplicação SPA sem estado, persistência não é necessária. Todos os dados são gerenciados pelo Supabase.

### Passo 7: Deploy

1. **Revisar Configurações**
   - Verifique todas as variáveis de ambiente
   - Confirme o port mapping
   - Verifique o branch Git

2. **Iniciar Deploy**
   - Clique em "Deploy"
   - Monitore os logs de build em tempo real

3. **Aguardar Build**
   - Tempo estimado: 2-5 minutos
   - O EasyPanel mostrará o progresso

**Logs de Build Esperados:**
```
[builder] Step 1/14 : FROM node:20.19.5-alpine as builder
[builder] Step 2/14 : WORKDIR /app
[builder] Step 3/14 : COPY package*.json ./
[builder] Step 4/14 : RUN npm ci
[builder] Step 5/14 : COPY . .
[builder] Step 6/14 : RUN npm run build
[builder] Build successful!
[runtime] Starting serve on port 3000...
[runtime] Server running at http://0.0.0.0:3000
```

## 🌍 Configuração de Domínios

### Passo 1: Adicionar Domínio no EasyPanel

1. **Acessar Configuração de Domínios**
   - No projeto OptiStrat
   - Clique em "Domains"
   - Clique em "Add Domain"

2. **Configurar Domínio**
   ```
   Domain: seu-dominio.com
   Type: Custom Domain
   ```

### Passo 2: Configurar DNS

No seu provedor de DNS (ex: Cloudflare, Namecheap):

**Para domínio raiz (seu-dominio.com):**
```
Type: A
Name: @
Value: [IP do seu servidor EasyPanel]
TTL: Auto ou 3600
```

**Para subdomínio (www.seu-dominio.com):**
```
Type: CNAME
Name: www
Value: seu-dominio.com
TTL: Auto ou 3600
```

### Passo 3: Configurar SSL/TLS

O EasyPanel oferece SSL automático via Let's Encrypt:

1. **Ativar SSL**
   - Em "Domains" → "SSL/TLS"
   - Selecione "Let's Encrypt"
   - Clique em "Generate Certificate"

2. **Aguardar Provisionamento**
   - Tempo estimado: 1-2 minutos
   - Certificado válido por 90 dias
   - Renovação automática

3. **Forçar HTTPS**
   - Ative "Force HTTPS"
   - Redireciona automaticamente HTTP → HTTPS

### Passo 4: Configurar Supabase URLs

**CRÍTICO**: Configure as URLs de redirect no Supabase para que o login administrativo funcione:

1. Acesse: https://supabase.com/dashboard/project/bsbwwgicxjmjshofxyop/auth/url-configuration

2. **Site URL:**
   ```
   https://seu-dominio.com
   ```

3. **Redirect URLs:**
   ```
   https://seu-dominio.com/**
   https://seu-dominio.com/admin/**
   https://seu-dominio.com/admin/login
   ```

4. **Salvar Alterações**

**⚠️ Importante**: 
- Sem esta configuração, os redirects de login falharão
- Adicione TODAS as URLs (staging, produção, www, não-www)
- Use `/**` para permitir todos os subpaths

## ✅ Verificação e Testes

### 1. Verificar Deploy Bem-Sucedido

#### Verificar Status no EasyPanel

```bash
Status: Running (ícone verde)
Health: Healthy
Uptime: [tempo desde deploy]
CPU/Memory: Dentro dos limites
```

#### Verificar Logs

```bash
# No EasyPanel:
Logs → Application Logs

# Logs esperados:
✅ "Serving dist on port 3000"
✅ "Server started successfully"
❌ Sem erros "ECONNREFUSED" ou "Cannot GET"
```

### 2. Testes de Funcionalidade

#### Teste 1: Página Inicial
```bash
URL: https://seu-dominio.com/
Esperado: ✅ Página carrega sem erros
         ✅ Assets (CSS, JS, imagens) carregam
         ✅ Sem erros 404 no console
```

#### Teste 2: Login Administrativo
```bash
URL: https://seu-dominio.com/admin/login
Esperado: ✅ Formulário de login aparece
         ✅ Campo email e senha funcionam
         ✅ Botão de login responde
```

#### Teste 3: Autenticação
```bash
1. Insira credenciais de admin
2. Clique em "Entrar"
Esperado: ✅ Redirect para /admin após login
         ✅ Dashboard administrativo carrega
         ✅ Token JWT é armazenado
```

#### Teste 4: Conexão Supabase
```bash
1. Abra o console do navegador (F12)
2. Vá para Network → XHR
3. Faça login
Esperado: ✅ Requests para supabase.co sem erros
         ✅ Status 200 nas chamadas de API
         ✅ Sem erros CORS
```

#### Teste 5: Routing SPA
```bash
1. Navegue para /admin
2. Recarregue a página (F5)
Esperado: ✅ Página carrega normalmente
         ✅ Sem erro 404
         ✅ Routing client-side funciona
```

#### Teste 6: Formulários de Contato
```bash
1. Acesse a página de contato
2. Preencha o formulário
3. Envie
Esperado: ✅ Edge function é chamada
         ✅ Email é enviado
         ✅ Toast de sucesso aparece
```

### 3. Testes de Performance

```bash
# Use ferramentas online:
- PageSpeed Insights: https://pagespeed.web.dev/
- GTmetrix: https://gtmetrix.com/

Métricas esperadas:
✅ First Contentful Paint: < 2s
✅ Time to Interactive: < 3.5s
✅ Speed Index: < 3s
✅ Lighthouse Score: > 90
```

### 4. Testes de Segurança

```bash
# SSL/TLS
✅ SSL Labs: https://www.ssllabs.com/ssltest/
   Grade esperada: A ou A+

# Headers de Segurança
✅ Security Headers: https://securityheaders.com/
   Verificar: X-Frame-Options, CSP, etc.

# Verificação Manual
✅ HTTPS funciona
✅ HTTP redireciona para HTTPS
✅ Certificado válido
✅ Sem mixed content warnings
```

## 🔧 Troubleshooting

### Problema 1: Build Falha

#### Erro: "npm ci failed"
```bash
Causa: package-lock.json desatualizado ou corrompido

Solução:
1. Localmente: rm package-lock.json && npm install
2. Commit o novo package-lock.json
3. Push para o repositório
4. Rebuild no EasyPanel
```

#### Erro: "Module not found"
```bash
Causa: Dependência faltando ou cache corrompido

Solução no EasyPanel:
1. Settings → Clear Build Cache
2. Rebuild Application
3. Monitore os logs de build
```

#### Erro: "Build timeout"
```bash
Causa: Build muito longo (> 15 minutos)

Solução:
1. Verifique o .dockerignore (exclua node_modules, dist)
2. Otimize o Dockerfile (use npm ci em vez de npm install)
3. Aumente o timeout nas configurações do EasyPanel
```

### Problema 2: Aplicação Não Inicia

#### Erro: "Container keeps restarting"
```bash
Causa: Erro fatal no runtime

Diagnóstico:
1. EasyPanel → Logs → Application Logs
2. Procure por stack traces
3. Verifique se a porta 3000 está exposta

Solução:
- Verifique o CMD no Dockerfile
- Certifique-se de que "serve" está instalado
- Verifique se dist/ foi copiado corretamente
```

#### Erro: "Health check failing"
```bash
Causa: Aplicação não responde no path de health check

Solução:
1. Verifique se a aplicação está realmente rodando na porta 3000
2. Teste manualmente: curl http://localhost:3000
3. Ajuste o path do health check para "/"
4. Aumente o timeout do health check
```

### Problema 3: Erros de Conexão Supabase

#### Erro: "Failed to fetch" / "Network error"
```bash
Causa: Configuração incorreta das variáveis ou CORS

Diagnóstico:
1. Verifique as variáveis de ambiente no EasyPanel
2. Console do navegador → Network → Veja requests falhando

Solução:
1. Confirme VITE_SUPABASE_URL está correto
2. Confirme VITE_SUPABASE_ANON_KEY está correto
3. Verifique se o projeto Supabase está ativo
4. Configure CORS no Supabase (permitir seu domínio)
```

#### Erro: "Invalid JWT" / "Auth session missing"
```bash
Causa: Token JWT inválido ou expirado

Solução:
1. Limpe localStorage: localStorage.clear()
2. Faça logout e login novamente
3. Verifique se o JWT_SECRET está configurado no Supabase
4. Verifique configurações de JWT no Supabase
```

### Problema 4: Redirects de Login Não Funcionam

#### Erro: "Invalid redirect URL"
```bash
Causa: URL não configurada no Supabase

Solução DEFINITIVA:
1. Acesse Supabase Dashboard:
   https://supabase.com/dashboard/project/bsbwwgicxjmjshofxyop/auth/url-configuration

2. Configure:
   Site URL: https://seu-dominio.com
   
   Redirect URLs:
   - https://seu-dominio.com/**
   - https://seu-dominio.com/admin/**
   - https://seu-dominio.com/admin/login
   - http://localhost:3000/** (para dev)

3. Salve e aguarde 1-2 minutos para propagar

4. Limpe cache do navegador e teste novamente
```

#### Erro: "Redirects to localhost"
```bash
Causa: emailRedirectTo apontando para localhost

Solução:
1. Verifique src/hooks/useAuth.tsx
2. Certifique-se de usar window.location.origin:
   
   const signUp = async (email, password) => {
     const redirectUrl = `${window.location.origin}/`;
     // ...
   }

3. Rebuild a aplicação
```

### Problema 5: Erros 404 nas Rotas

#### Erro: "Cannot GET /admin"
```bash
Causa: SPA routing não configurado corretamente

Verificar:
1. server.js tem fallback para index.html? ✅
2. serve está com flag -s (single page app)? ✅
3. Dockerfile CMD correto? ✅

Solução no server.js:
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

### Problema 6: Variáveis de Ambiente Não Funcionam

#### Erro: "undefined" nas variáveis VITE_*
```bash
Causa: Variáveis VITE_* devem estar presentes no BUILD time

⚠️ IMPORTANTE:
- Variáveis VITE_* são embutidas no bundle durante build
- Mudar variáveis no runtime NÃO afeta o frontend
- É necessário REBUILD após mudar variáveis VITE_*

Solução:
1. Configure as variáveis no EasyPanel
2. Faça REBUILD (não apenas restart)
3. Aguarde o novo build completar
4. Verifique no código compilado:
   view-source:https://seu-dominio.com/
   Procure por valores hardcoded
```

### Problema 7: Performance Ruim

#### Sintoma: Aplicação lenta ou timeout
```bash
Diagnóstico:
1. EasyPanel → Metrics
2. Verifique CPU e Memory usage
3. Veja se está chegando no limite

Solução:
1. Aumente recursos do container:
   Settings → Resources
   - Memory: 1GB → 2GB
   - CPU: 0.5 → 1.0 cores

2. Otimize o build:
   - Minimize assets
   - Lazy load components
   - Use code splitting

3. Configure cache:
   - Ative HTTP cache headers
   - Use CDN para assets estáticos
```

## 🔄 Manutenção e Atualizações

### Auto-Deploy via Git

Configure deploy automático quando fizer push:

```bash
# No EasyPanel:
Settings → Git Settings
✅ Enable Auto Deploy
Branch: main
```

Agora, sempre que você fizer push:
```bash
git add .
git commit -m "Update feature X"
git push origin main
# EasyPanel automaticamente detecta e faz rebuild/redeploy
```

### Deploy Manual

Se preferir deploy manual:

```bash
# 1. Faça as alterações localmente
git add .
git commit -m "Update"
git push origin main

# 2. No EasyPanel:
Project → Redeploy
✅ Rebuild Application
```

### Rollback para Versão Anterior

Se algo der errado após deploy:

```bash
# No EasyPanel:
Deployments → History
→ Selecione versão anterior
→ Clique em "Rollback to this version"

# Ou via Git:
git revert HEAD
git push origin main
# EasyPanel fará rebuild automático
```

### Monitoramento Contínuo

**Métricas a Monitorar:**
```bash
✅ CPU Usage (deve ficar < 80%)
✅ Memory Usage (deve ficar < 80%)
✅ Response Time (deve ficar < 1s)
✅ Error Rate (deve ficar < 1%)
✅ Uptime (deve ficar > 99.9%)
```

**Configurar Alertas:**
```bash
EasyPanel → Monitoring → Alerts
1. CPU > 90% por 5 minutos
2. Memory > 90% por 5 minutos
3. Health check failing
4. Error rate > 5%
```

### Backup e Recuperação

**O que fazer backup:**
```bash
✅ Variáveis de ambiente (exportar do EasyPanel)
✅ Configuração Docker/EasyPanel (documentar)
✅ Database Supabase (backup automático pelo Supabase)
❌ Código (já está no Git)
❌ Build artifacts (regeneráveis)
```

**Recuperação de Desastre:**
```bash
Cenário: Servidor EasyPanel perdido

1. Configure novo servidor no EasyPanel
2. Crie novo projeto
3. Conecte ao mesmo repositório Git
4. Importe variáveis de ambiente salvas
5. Deploy automático
6. Configure domínios
7. SSL automático

Tempo total de recuperação: < 30 minutos
```

## 📊 Checklist Final de Deploy

Antes de considerar o deploy completo, verifique:

### Build e Deploy
- [ ] ✅ Build completa sem erros
- [ ] ✅ Container iniciou corretamente
- [ ] ✅ Health check passing
- [ ] ✅ Logs sem erros críticos

### Networking
- [ ] ✅ Domínio configurado
- [ ] ✅ DNS propagado
- [ ] ✅ SSL/TLS ativo
- [ ] ✅ HTTPS forçado
- [ ] ✅ Redirect HTTP → HTTPS funciona

### Supabase
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Site URL configurada
- [ ] ✅ Redirect URLs configuradas
- [ ] ✅ Conexão estabelecida
- [ ] ✅ Autenticação funciona

### Funcionalidades
- [ ] ✅ Página inicial carrega
- [ ] ✅ Login administrativo funciona
- [ ] ✅ Dashboard acessível
- [ ] ✅ Formulários funcionam
- [ ] ✅ Routing SPA funciona
- [ ] ✅ Edge functions respondendo

### Performance e Segurança
- [ ] ✅ Lighthouse score > 90
- [ ] ✅ SSL Labs grade A/A+
- [ ] ✅ Security headers configurados
- [ ] ✅ Performance aceitável (< 3s load)
- [ ] ✅ Sem erros no console

### Monitoramento
- [ ] ✅ Logs acessíveis
- [ ] ✅ Métricas visíveis
- [ ] ✅ Alertas configurados
- [ ] ✅ Auto-deploy configurado (opcional)
- [ ] ✅ Backup documentado

## 📚 Recursos Adicionais

**Documentação Oficial:**
- EasyPanel: https://easypanel.io/docs
- Docker: https://docs.docker.com/
- Node.js: https://nodejs.org/docs/
- Supabase: https://supabase.com/docs

**Suporte:**
- EasyPanel Support: support@easypanel.io
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: [seu-repositório]/issues

**Ferramentas Úteis:**
- SSL Test: https://www.ssllabs.com/ssltest/
- Performance: https://pagespeed.web.dev/
- Security Headers: https://securityheaders.com/
- DNS Propagation: https://dnschecker.org/

---

**Versão do Documento**: 2.0  
**Última Atualização**: 2025  
**Compatível com**: EasyPanel v2.23.0, Node.js v20.19.5

**Desenvolvido para OptiStrat**
