# OptiStrat - Web Application

## 📋 Informações do Projeto

**URL Lovable**: https://lovable.dev/projects/ec1d4f1e-2506-4da5-a91b-34afa90cceb6

**Node.js Version**: v20.19.5

## 🚀 Como Editar Este Projeto

Existem várias formas de editar esta aplicação.

### Usar Lovable (Recomendado)

Simplesmente visite o [Lovable Project](https://lovable.dev/projects/ec1d4f1e-2506-4da5-a91b-34afa90cceb6) e comece a desenvolver.

As alterações feitas via Lovable serão automaticamente commitadas neste repositório.

### Usar seu IDE Preferido

Se você quiser trabalhar localmente usando seu próprio IDE, pode clonar este repositório e fazer push das alterações. As alterações enviadas também serão refletidas no Lovable.

O único requisito é ter Node.js v20.19.5 & npm instalados - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Siga estes passos:

```sh
# Passo 1: Clone o repositório usando a URL Git do projeto.
git clone <YOUR_GIT_URL>

# Passo 2: Navegue até o diretório do projeto.
cd <YOUR_PROJECT_NAME>

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento com auto-reload e preview instantâneo.
npm run dev
```

### Editar um Arquivo Diretamente no GitHub

- Navegue até o(s) arquivo(s) desejado(s).
- Clique no botão "Edit" (ícone de lápis) no canto superior direito da visualização do arquivo.
- Faça suas alterações e commit das alterações.

### Usar GitHub Codespaces

- Navegue até a página principal do seu repositório.
- Clique no botão "Code" (botão verde) próximo ao canto superior direito.
- Selecione a aba "Codespaces".
- Clique em "New codespace" para lançar um novo ambiente Codespace.
- Edite arquivos diretamente no Codespace e faça commit e push das suas alterações quando terminar.

## 🛠️ Tecnologias Utilizadas

Este projeto é construído com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend)
- Node.js v20.19.5

## 📦 Deploy no EasyPanel v2.23.0

### Pré-requisitos

1. Conta no [EasyPanel](https://easypanel.io)
2. Servidor VPS conectado ao EasyPanel
3. Repositório Git (GitHub, GitLab, ou Bitbucket)
4. Projeto Supabase configurado

### Passo a Passo para Deploy

#### 1. Preparar o Repositório

Certifique-se de que seu repositório contém:
- ✅ `Dockerfile` configurado para Node.js v20.19.5
- ✅ `package.json` com scripts de build
- ✅ Código da aplicação compilado

#### 2. Configurar Projeto no EasyPanel

1. **Login no EasyPanel**
   - Acesse seu painel do EasyPanel
   - Selecione seu servidor

2. **Criar Novo Projeto**
   - Clique em "Create Project"
   - Nome do projeto: `optistrat` (ou nome de sua preferência)
   - Selecione "Git Repository"

3. **Conectar Repositório Git**
   - Escolha seu provedor (GitHub/GitLab/Bitbucket)
   - Autorize o EasyPanel a acessar seus repositórios
   - Selecione o repositório do OptiStrat
   - Branch: `main` (ou sua branch principal)

#### 3. Configurar Build

O EasyPanel detectará automaticamente o `Dockerfile`. Configure:

**Build Settings:**
- Build Method: `Dockerfile`
- Dockerfile Path: `./Dockerfile`
- Build Context: `.` (raiz do projeto)

#### 4. Configurar Variáveis de Ambiente

No painel do EasyPanel, adicione as seguintes variáveis de ambiente:

```bash
# Node Environment
NODE_ENV=production

# Supabase Configuration (obtenha em https://supabase.com/dashboard)
VITE_SUPABASE_URL=https://bsbwwgicxjmjshofxyop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=bsbwwgicxjmjshofxyop

# Server Configuration
PORT=3000
```

**⚠️ Importante**: 
- Nunca commite suas chaves reais no repositório
- Use as variáveis de ambiente do EasyPanel para armazenar credenciais
- Obtenha suas chaves em: https://supabase.com/dashboard/project/bsbwwgicxjmjshofxyop/settings/api

#### 5. Configurar Domínio e Portas

**Port Mapping:**
- Container Port: `3000`
- External Port: `80` (ou `443` para HTTPS)

**Domain Configuration:**
1. Clique em "Domains"
2. Adicione seu domínio personalizado ou use o subdomínio fornecido pelo EasyPanel
3. Configure SSL/TLS:
   - Selecione "Let's Encrypt" para SSL automático
   - O EasyPanel configurará o certificado automaticamente

#### 6. Deploy da Aplicação

1. Revise todas as configurações
2. Clique em "Deploy"
3. Aguarde o build completar (geralmente 2-5 minutos)
4. Monitore os logs na aba "Logs"

#### 7. Verificar Deploy

Após o deploy bem-sucedido:

1. **Teste a URL**
   - Acesse o domínio configurado
   - Verifique se a aplicação carrega corretamente

2. **Teste Funcionalidades**
   - ✅ Login administrativo funciona
   - ✅ Conexão com Supabase estabelecida
   - ✅ Formulários de contato funcionando
   - ✅ Redirects e roteamento funcionando

3. **Verificar Logs**
   ```bash
   # No painel do EasyPanel, acesse:
   Logs > Application Logs
   ```

#### 8. Configurar Auto-Deploy (Opcional)

Para deployments automáticos ao fazer push:

1. No EasyPanel, vá em "Settings"
2. Ative "Auto Deploy"
3. Selecione a branch: `main`
4. Toda vez que você fizer push, o EasyPanel fará rebuild e redeploy automaticamente

### 🔧 Troubleshooting

#### Build Falha

**Problema**: Build timeout ou falha
```bash
# Solução 1: Verifique os logs do build
Logs > Build Logs

# Solução 2: Verifique se o Dockerfile está correto
# Solução 3: Certifique-se de que package.json está completo
```

**Problema**: Erro "Module not found"
```bash
# Solução: Limpe o cache e rebuilde
1. Settings > Clear Build Cache
2. Rebuild Application
```

#### Aplicação Não Carrega

**Problema**: Erro 502 Bad Gateway
```bash
# Solução 1: Verifique se a porta está correta (3000)
# Solução 2: Verifique os logs da aplicação
# Solução 3: Restart a aplicação
```

**Problema**: Página em branco
```bash
# Solução: Verifique as variáveis de ambiente
# Especialmente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
```

#### Erros de Conexão com Supabase

**Problema**: "Failed to fetch" ou "Network error"
```bash
# Solução 1: Verifique as variáveis de ambiente do Supabase
# Solução 2: Verifique se o projeto Supabase está ativo
# Solução 3: Verifique as configurações de CORS no Supabase

# No Supabase Dashboard:
Authentication > URL Configuration
- Site URL: https://seu-dominio.com
- Redirect URLs: https://seu-dominio.com/**
```

**Problema**: Redirects de login não funcionam
```bash
# Solução: Configure as URLs de redirect no Supabase
1. Acesse: https://supabase.com/dashboard/project/bsbwwgicxjmjshofxyop/auth/url-configuration
2. Site URL: https://seu-dominio.com
3. Redirect URLs: 
   - https://seu-dominio.com/**
   - https://seu-dominio.com/admin/**
4. Salve as alterações
```

#### Problemas de Performance

**Problema**: Aplicação lenta
```bash
# Solução 1: Aumente os recursos do container
Settings > Resources > Memory/CPU

# Solução 2: Ative o cache de build
Settings > Enable Build Cache
```

### 📊 Monitoramento

**Métricas Disponíveis no EasyPanel:**
- CPU Usage
- Memory Usage
- Network Traffic
- Request Rate
- Response Time

**Acessar Logs:**
```bash
# Application Logs
Logs > Application > View Real-time

# Build Logs
Logs > Build > View History

# System Logs
Logs > System > View Events
```

### 🔄 Atualizar a Aplicação

Existem duas formas de atualizar:

**1. Via Git Push (com Auto-Deploy ativado)**
```bash
git add .
git commit -m "Update application"
git push origin main
# EasyPanel detectará e fará deploy automaticamente
```

**2. Via EasyPanel Manual**
1. Faça push das alterações para o repositório
2. No EasyPanel, clique em "Redeploy"
3. Selecione "Rebuild"
4. Aguarde o novo deploy

### 🔐 Segurança

**Checklist de Segurança:**
- ✅ SSL/TLS configurado (Let's Encrypt)
- ✅ Variáveis de ambiente seguras (não no código)
- ✅ CORS configurado no Supabase
- ✅ Firewall configurado no servidor
- ✅ Autenticação MFA implementada
- ✅ RLS policies ativas no Supabase

**Configurar Firewall:**
```bash
# No servidor VPS, configure:
- Porta 80 (HTTP) - Aberta
- Porta 443 (HTTPS) - Aberta
- Porta 22 (SSH) - Restrita
- Porta 3000 - Fechada (somente interna)
```

### 📚 Recursos Adicionais

**Documentação:**
- [EasyPanel Docs](https://easypanel.io/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Supabase Docs](https://supabase.com/docs)

**Suporte:**
- EasyPanel Support: support@easypanel.io
- Supabase Support: https://supabase.com/support

## 🌐 Deploy em Outras Plataformas

### Netlify

1. Acesse [netlify.com](https://www.netlify.com) e faça login
2. Clique em "Add new site" → "Import from Git"
3. Conecte o repositório GitHub
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Configure as variáveis de ambiente necessárias
6. Clique em "Deploy"

### Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Conecte o repositório GitHub
4. Configure as variáveis de ambiente na seção "Environment Variables"
5. Clique em "Deploy"

### Servidor VPS Manual (sem EasyPanel)

Se preferir fazer deploy manualmente em um VPS:

#### Passo 1: Conectar ao Servidor
```bash
ssh user@seu-servidor.com
```

#### Passo 2: Instalar Node.js v20.19.5
```bash
# Usando nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20.19.5
nvm use 20.19.5
nvm alias default 20.19.5
```

#### Passo 3: Clonar e Configurar o Projeto
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run build
```

#### Passo 4: Instalar e Configurar PM2
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar o servidor com PM2
pm2 start server.js --name "optistrat"

# Configurar PM2 para iniciar automaticamente após reboot
pm2 startup
pm2 save

# Comandos úteis do PM2
pm2 list          # Listar processos
pm2 logs          # Ver logs
pm2 restart optistrat  # Reiniciar aplicação
pm2 stop optistrat     # Parar aplicação
pm2 delete optistrat   # Remover aplicação
```

#### Passo 5: Configurar Nginx como Reverse Proxy
```bash
# Instalar Nginx
sudo apt update
sudo apt install nginx

# Criar configuração
sudo nano /etc/nginx/sites-available/optistrat
```

Adicione a configuração:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar o site
sudo ln -s /etc/nginx/sites-available/optistrat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Passo 6: Configurar SSL com Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## 🔧 Configurações Importantes

### Redirecionamento SPA
O servidor Node.js já está configurado para redirecionar todas as rotas para `index.html`, garantindo que o roteamento client-side do React funcione corretamente.

### HTTPS
Sempre use HTTPS em produção:
- **EasyPanel**: SSL automático via Let's Encrypt
- **VPS Manual**: Configure com Certbot (mostrado acima)
- **Netlify/Vercel**: SSL automático incluído

### Variáveis de Ambiente
- ✅ Nunca exponha chaves secretas no código
- ✅ Use variáveis de ambiente para todas as credenciais
- ✅ Use arquivos `.env` localmente (não faça commit)
- ✅ Configure variáveis no painel da plataforma de deploy

### Firewall
Configure o firewall do servidor para permitir apenas as portas necessárias:
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## 📱 Suporte e Documentação

- **Documentação Lovable**: [docs.lovable.dev](https://docs.lovable.dev)
- **Documentação Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Documentação React**: [react.dev](https://react.dev)
- **Documentação Vite**: [vitejs.dev](https://vitejs.dev)

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ usando Lovable**
