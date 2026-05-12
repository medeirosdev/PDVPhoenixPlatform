# PDVPhoenixPlatform

Sistema de controle de vendas e estoque para vendinha interna de equipe. Interface mobile-first com tema escuro preto/laranja.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS v4** — dark mode preto/laranja
- **shadcn/ui** (base-ui) — componentes acessíveis
- **Prisma ORM** — schema type-safe com PostgreSQL
- **NextAuth v5** — autenticação com email/senha
- **Recharts** — gráficos de vendas

## Funcionalidades

- Registro de vendas com carrinho multi-item
- Controle de estoque com alertas de reposição
- Formulário de entrada de estoque com histórico
- Dashboard semanal: faturamento, lucro bruto, ticket médio, mais vendidos

## Setup

### 1. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/banco
AUTH_SECRET=   # openssl rand -base64 32
AUTH_URL=http://localhost:3000
```

### 2. Banco de dados

```bash
python3 db.py init    # cria as tabelas no banco e usuário de teste
```

Credenciais do seed: `admin@vendinha.com` / `123`

### 3. Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run db:push` | Aplica schema no banco (usando Prisma) |
| `npm run db:seed` | Popula dados iniciais |
| `npm run db:studio` | UI do Prisma para inspecionar o banco |

## Deploy (Vercel)

1. Conecte o repositório na Vercel
2. Configure as variáveis de ambiente (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`)
3. Deploy automático no push para `main`
