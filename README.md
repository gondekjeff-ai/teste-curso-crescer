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

### 1. Build do projeto
```sh
# Instalar dependências
npm install

# Gerar build de produção
npm run build
```

### 2. Deploy no Netlify
1. Acesse [netlify.com](https://www.netlify.com) e faça login
2. Clique em "Add new site" -> "Deploy manually"
3. Arraste a pasta `dist` gerada no build
4. Configure as variáveis de ambiente necessárias:
   - `VITE_SUPABASE_URL`: https://bsbwwgicxjmjshofxyop.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### 3. Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Conecte o repositório GitHub
4. Configure as variáveis de ambiente na seção "Environment Variables"
5. Clique em "Deploy"

### 4. Deploy no Firebase Hosting
```sh
# Instalar Firebase CLI
npm install -g firebase-tools

# Login no Firebase
firebase login

# Inicializar projeto
firebase init hosting

# Configurar pasta public como 'dist'
# Deploy
firebase deploy
```

### 5. Deploy em servidor próprio (Apache/Nginx)
1. Faça upload da pasta `dist` para o servidor
2. Configure o servidor web para servir arquivos estáticos
3. Configure redirecionamento para index.html para SPA
4. Configure HTTPS com certificado SSL

### Configurações importantes para SPA:
- Configurar redirecionamento de todas as rotas para `/index.html`
- Configurar headers de cache adequados
- Configurar CORS se necessário para APIs externas

## Quero usar um domínio personalizado - é possível?

Não suportamos domínios personalizados (ainda). Se você quiser fazer deploy do seu projeto sob seu próprio domínio, recomendamos usar Netlify ou Vercel. Visite nossa documentação para mais detalhes: [Domínios personalizados](https://docs.lovable.dev/tips-tricks/custom-domain/)
