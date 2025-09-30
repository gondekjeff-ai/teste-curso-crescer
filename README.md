# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ec1d4f1e-2506-4da5-a91b-34afa90cceb6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ec1d4f1e-2506-4da5-a91b-34afa90cceb6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Como fazer deploy deste projeto?

Simplesmente abra [Lovable](https://lovable.dev/projects/ec1d4f1e-2506-4da5-a91b-34afa90cceb6) e clique em Share -> Publish.

## Hospedar em servidor externo - Passo a passo

### 1. Deploy usando Node.js (Recomendado)

Este projeto inclui um servidor Node.js (`server.js`) para facilitar o deploy em qualquer servidor VPS ou hospedagem com suporte a Node.js.

#### Passo 1: Preparar o projeto
```sh
# Clonar o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Instalar dependências do projeto
npm install

# Gerar build de produção
npm run build
```

#### Passo 2: Instalar dependência do servidor
```sh
# Instalar Express para o servidor Node.js
npm install express
```

#### Passo 3: Configurar variáveis de ambiente (opcional)
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (se necessário):
```
PORT=3000
VITE_SUPABASE_PROJECT_ID=bsbwwgicxjmjshofxyop
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://bsbwwgicxjmjshofxyop.supabase.co
```

#### Passo 4: Iniciar o servidor
```sh
# Rodar o servidor Node.js
node server.js
```

O servidor estará disponível em `http://localhost:3000` (ou na porta configurada).

#### Passo 5: Manter o servidor rodando (Produção)

Para manter o servidor rodando em produção, use PM2:
```sh
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
```

#### Deploy em servidores VPS (AWS, DigitalOcean, Linode, etc.)

1. **Conecte ao servidor via SSH**
   ```sh
   ssh user@seu-servidor.com
   ```

2. **Instale Node.js e NPM** (se ainda não estiver instalado)
   ```sh
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone e configure o projeto** (seguir passos 1-4 acima)

4. **Configure um proxy reverso com Nginx** (recomendado)
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
       }
   }
   ```

5. **Configure SSL com Let's Encrypt**
   ```sh
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d seu-dominio.com
   ```

### 2. Deploy no Netlify (Alternativa)
1. Acesse [netlify.com](https://www.netlify.com) e faça login
2. Clique em "Add new site" -> "Import from Git"
3. Conecte o repositório GitHub
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Configure as variáveis de ambiente necessárias
6. Clique em "Deploy"

### 3. Deploy no Vercel (Alternativa)
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Conecte o repositório GitHub
4. Configure as variáveis de ambiente na seção "Environment Variables"
5. Clique em "Deploy"

### Configurações importantes:
- **Redirecionamento SPA**: O servidor Node.js já está configurado para redirecionar todas as rotas para `index.html`
- **HTTPS**: Sempre use HTTPS em produção (configure com Nginx + Let's Encrypt ou use plataformas que fornecem SSL automaticamente)
- **Variáveis de ambiente**: Nunca exponha chaves secretas no código. Use variáveis de ambiente
- **Firewall**: Configure o firewall do servidor para permitir apenas as portas necessárias (80, 443, SSH)

## Quero usar um domínio personalizado - é possível?

Não suportamos domínios personalizados (ainda). Se você quiser fazer deploy do seu projeto sob seu próprio domínio, recomendamos usar Netlify ou Vercel. Visite nossa documentação para mais detalhes: [Domínios personalizados](https://docs.lovable.dev/tips-tricks/custom-domain/)
