
O usuário pede para reescrever todo o site removendo Node.js e usando PHP como backend, com efeitos visuais em CSS puro. Isso é tecnicamente impossível neste ambiente.

**Por quê não posso fazer isso:**

A plataforma Lovable é fundamentada exclusivamente em:
- React 18 + TypeScript + Vite (frontend SPA)
- Tailwind CSS (estilização)
- Node.js no ambiente de build/dev

Não há suporte para PHP, Apache, ou qualquer linguagem server-side renderizada. Reescrever em PHP exigiria:
1. Abandonar completamente a stack Lovable (React/Vite/TS)
2. Perder todo o sistema de componentes (~80 componentes UI, páginas, hooks)
3. Perder o painel administrativo React inteiro (AdminDashboard, ContentManager, NewsManager, ProductsManager, CarouselManager, MFASettings, ContactsManager)
4. Perder o ChatBot com streaming, formulários com validação Zod, autenticação JWT/MFA
5. Migrar para outra ferramenta de desenvolvimento — Lovable não pode editar nem servir PHP

**Contexto do problema real**

Pelo histórico, o site não está rodando na KingHost porque o domínio optistrat.com.br aparenta estar em um plano Apache/PHP da KingHost, sem Node.js ativo. Existem 3 caminhos viáveis sem destruir o projeto:

## Opções recomendadas

### Opção A — Ativar Node.js na KingHost (recomendado)
Manter o projeto como está. A KingHost oferece planos com suporte a Node.js (Cloud KingHost / VPS). Basta:
- Confirmar com o suporte KingHost a ativação de Node.js 20+
- Configurar `DATABASE_URL`, `JWT_SECRET`, `PORT` no painel
- Apontar o domínio para a aplicação Node

Custo: ajuste de plano na KingHost. Código: zero alteração.

### Opção B — Build estático + API em outro host
Gerar o `dist/` (HTML/CSS/JS estático do React) e hospedar na KingHost no Apache atual. O backend Express continuaria em outro lugar (EasyPanel, Railway, Render, etc.) e o frontend chamaria essa API via CORS.

Mudanças: configurar `VITE_API_URL` apontando para o backend externo, ajustar CORS no Express.

### Opção C — Frontend estático na KingHost + backend PHP NOVO (fora do Lovable)
Manter o frontend React buildado (que continua sendo HTML/CSS/JS no navegador, sem Node em produção) e reescrever **somente o backend** (`server/api.js`) em PHP, hospedado fora do Lovable. O Lovable continuaria editando o frontend React; o PHP seria mantido manualmente em outro repositório/editor.

Mudanças no Lovable: apenas apontar `api.ts` para a URL do backend PHP. O PHP em si precisa ser escrito fora do Lovable.

## O que NÃO é possível
Reescrever o frontend (React → PHP/HTML puro) dentro do Lovable. A plataforma não suporta isso.

## Próximo passo
Preciso saber qual caminho seguir antes de implementar qualquer coisa. As três opções acima têm impactos muito diferentes.
