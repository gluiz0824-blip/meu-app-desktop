# Pulso Social

Sistema local para controle de tarefas, clientes, calendario editorial e producao de conteudo para social media, com interface dark premium.

## Rodar o projeto

```bash
npm install
npm run dev
```

Crie um arquivo `.env` baseado em `.env.example` com suas chaves do Supabase.

Depois abra:

```text
http://127.0.0.1:5173
```

A API roda em:

```text
http://127.0.0.1:3333
```

## Scripts

- `npm run dev`: inicia frontend e backend.
- `npm run build`: valida TypeScript e gera build de producao.

## Banco de dados

O banco agora usa Supabase. Rode o SQL abaixo no editor SQL do Supabase antes de iniciar:

```text
supabase/schema.sql
```

Use `SUPABASE_SERVICE_ROLE_KEY` apenas no backend/API, nunca no frontend publico.

## Login

Defina tambem estas variaveis no `.env` local e na Vercel:

```text
ADMIN_PASSWORD=sua-senha-de-acesso
AUTH_SECRET=um-segredo-longo-aleatorio
```

`ADMIN_PASSWORD` e a senha usada na tela de login. `AUTH_SECRET` assina o cookie de sessao.

## Rotas principais

- `/dashboard`
- `/clientes`
- `/clientes/2`
- `/tarefas`
- `/kanban`
- `/calendario`
- `/assistente`
- `/relatorios`
- `/configuracoes`
