# 🛒 Projeto: VendinhaPhoenix

## 1. Visão Geral
Sistema de controle de estoque e registro de vendas para uma vendinha interna da equipe (doces, snacks, etc.). Foco em praticidade no dia a dia: registrar o que foi vendido, acompanhar o estoque e ver o resumo da semana.

*   **Público-alvo / Uso:** Equipe interna (foco 90% mobile).
*   **Identidade Visual:** Preto e Laranja (Dark mode por padrão para economizar bateria em telas OLED).
*   **Hospedagem:** Vercel (Frontend + Serverless Functions).
*   **Banco de Dados:** PostgreSQL hospedado na Kinghost.

---

## 2. Stack Tecnológica

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js 14 (App Router) | Monólito, Server Actions, ótimo no Vercel |
| Estilização | Tailwind CSS v3 | Mobile-first, tema customizado preto/laranja |
| Componentes | Shadcn/ui | Acessível, fácil de tematizar |
| ORM | Drizzle ORM | Edge-friendly, zero-overhead, excelente TS DX |
| Auth | NextAuth v5 (Auth.js) | Login com usuário/senha (credentials) |
| Charts | Recharts | Flexível, customizável nas cores do projeto |

---

## 3. Modelagem do Banco de Dados (PostgreSQL)

### Tabela: `users`
Controle de acesso básico.
*   `id` (UUID, PK)
*   `name` (VARCHAR)
*   `email` (VARCHAR, UNIQUE)
*   `password_hash` (VARCHAR)
*   `created_at` (TIMESTAMP, default NOW())

### Tabela: `produtos`
Catálogo e controle de estoque.
*   `id` (UUID, PK)
*   `nome` (VARCHAR) - ex: "KitKat Tradicional"
*   `preco_venda` (DECIMAL)
*   `preco_custo` (DECIMAL) - para calcular margem
*   `estoque_atual` (INT)
*   `alerta_estoque` (INT) - gatilho para o aviso de reposição
*   `ativo` (BOOLEAN, default true)
*   `created_at` (TIMESTAMP, default NOW())

### Tabela: `vendas`
Cabeçalho de cada transação (pode ter múltiplos itens).
*   `id` (UUID, PK)
*   `user_id` (UUID, FK -> users)
*   `valor_total` (DECIMAL) - soma dos itens
*   `data_venda` (TIMESTAMP, default NOW())

### Tabela: `venda_itens`
Itens de cada venda (carrinho multi-produto).
*   `id` (UUID, PK)
*   `venda_id` (UUID, FK -> vendas)
*   `produto_id` (UUID, FK -> produtos)
*   `quantidade` (INT)
*   `preco_unitario` (DECIMAL) - snapshot do preço no momento da venda

### Tabela: `reposicao_estoque`
Entradas de estoque / compras.
*   `id` (UUID, PK)
*   `produto_id` (UUID, FK -> produtos)
*   `quantidade_comprada` (INT)
*   `custo_total` (DECIMAL)
*   `user_id` (UUID, FK -> users)
*   `data_compra` (TIMESTAMP, default NOW())

---

## 4. Mapa de Funcionalidades (MVP)

### Bottom Navigation (4 abas)

| Aba | Rota | Descrição |
|---|---|---|
| Registrar | `/` | Seleciona produtos, monta a venda, confirma |
| Estoque | `/estoque` | Lista todos os produtos com indicador de nível |
| Reposição | `/reposicao` | Formulário: "Comprei X de Y por R$ Z" |
| Dashboard | `/dashboard` | Gráfico semanal, lucro bruto, lista de alerta |

### Detalhes por tela

**Registrar Venda (`/`)**
- Grid de cards dos produtos ativos
- Botão + em cada card para adicionar ao "carrinho" (estado local)
- Resumo lateral/bottom sheet com itens e total
- Botão "Confirmar Venda" → Server Action que insere `vendas` + `venda_itens` e decrementa `estoque_atual`

**Estoque (`/estoque`)**
- Lista com nome, estoque atual, alerta
- Indicador visual: verde (ok) / laranja (atenção) / vermelho (crítico)
- Botão para adicionar novo produto

**Reposição (`/reposicao`)**
- Select de produto + campos de quantidade e custo total
- Ao confirmar: incrementa `estoque_atual`, insere em `reposicao_estoque`

**Dashboard (`/dashboard`)**
- Gráfico de barras: vendas por dia (semana corrente)
- Cards: faturamento total, lucro bruto estimado, ticket médio
- Lista: produtos abaixo do `alerta_estoque`

---

## 5. Estrutura de Pastas (Next.js App Router)

```text
/src
  /app
    /page.tsx                  (Registrar venda)
    /estoque
      /page.tsx
    /reposicao
      /page.tsx
    /dashboard
      /page.tsx
    /api
      /auth/[...nextauth]/route.ts
    /layout.tsx                (BottomNav + AuthProvider)
  /components
    /ui/                       (Shadcn components)
    /BottomNav.tsx
    /ProductCard.tsx
    /CartSheet.tsx
    /StockBadge.tsx
  /db
    /schema.ts                 (Drizzle schema)
    /index.ts                  (Conexão Postgres Kinghost)
  /actions
    /vendas.ts
    /estoque.ts
    /reposicao.ts
  /lib
    /auth.ts                   (NextAuth config)
    /utils.ts
```

---

## 6. Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:pass@kinghost-host:5432/vendinha
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://vendinha.vercel.app
```
