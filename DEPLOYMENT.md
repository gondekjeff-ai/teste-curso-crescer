# Guia de Deploy no EasyPanel

Este guia descreve como fazer o deploy da aplicação OptiStrat no EasyPanel usando Docker.

## Pré-requisitos

- Conta no EasyPanel
- Repositório Git configurado
- Acesso ao projeto Supabase

## Passos para Deploy

### 1. Configurar o Projeto no EasyPanel

1. Acesse seu painel do EasyPanel
2. Clique em "Create Project"
3. Selecione "Deploy from GitHub" ou "Deploy from Git"
4. Conecte seu repositório

### 2. Configurar as Variáveis de Ambiente

No EasyPanel, configure as seguintes variáveis de ambiente (se necessário):

```
NODE_ENV=production
```

**Nota:** As credenciais do Supabase já estão incluídas no código (`src/integrations/supabase/client.ts`), então não é necessário configurar variáveis de ambiente adicionais.

### 3. Configurar o Build

O EasyPanel detectará automaticamente o `Dockerfile` na raiz do projeto e iniciará o build automaticamente.

### 4. Configurar o Domínio

1. No painel do EasyPanel, vá em "Domains"
2. Adicione seu domínio personalizado ou use o domínio fornecido pelo EasyPanel
3. Configure o SSL (geralmente automático com Let's Encrypt)

### 5. Deploy

1. O EasyPanel fará o build da aplicação automaticamente
2. A aplicação será servida na porta 3000
3. Acesse a URL fornecida pelo EasyPanel para verificar o deploy

## Estrutura de Deploy

- **Build Stage**: Compila a aplicação React/TypeScript
- **Production Stage**: Serve os arquivos estáticos usando `serve`
- **Porta**: 3000

## Troubleshooting

### Build Falha

Se o build falhar, verifique:
- Todas as dependências estão listadas no `package.json`
- O comando `npm run build` funciona localmente

### Aplicação não Carrega

Se a aplicação não carregar:
- Verifique os logs no painel do EasyPanel
- Confirme que a porta 3000 está exposta corretamente
- Verifique as configurações de domínio/DNS

### Problemas com Supabase

Se houver problemas de conexão com o Supabase:
- Verifique se as URLs e chaves em `src/integrations/supabase/client.ts` estão corretas
- Confirme que o projeto Supabase está ativo
- Verifique as políticas RLS no Supabase

## Atualizações

Para atualizar a aplicação:
1. Faça push das alterações para o repositório Git
2. O EasyPanel detectará as mudanças e fará o redeploy automaticamente
3. Ou manualmente acione um novo deploy no painel do EasyPanel

## Suporte

Para mais informações sobre o EasyPanel, consulte: https://easypanel.io/docs
