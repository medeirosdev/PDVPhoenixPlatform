import {
  pgTable,
  uuid,
  varchar,
  decimal,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const produtos = pgTable("produtos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: varchar("nome", { length: 150 }).notNull(),
  precoVenda: decimal("preco_venda", { precision: 10, scale: 2 }).notNull(),
  precoCusto: decimal("preco_custo", { precision: 10, scale: 2 }).notNull(),
  estoqueAtual: integer("estoque_atual").notNull().default(0),
  alertaEstoque: integer("alerta_estoque").notNull().default(5),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vendas = pgTable("vendas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  dataVenda: timestamp("data_venda").defaultNow().notNull(),
});

export const vendaItens = pgTable("venda_itens", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendaId: uuid("venda_id")
    .notNull()
    .references(() => vendas.id, { onDelete: "cascade" }),
  produtoId: uuid("produto_id")
    .notNull()
    .references(() => produtos.id),
  quantidade: integer("quantidade").notNull(),
  precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }).notNull(),
});

export const reposicaoEstoque = pgTable("reposicao_estoque", {
  id: uuid("id").primaryKey().defaultRandom(),
  produtoId: uuid("produto_id")
    .notNull()
    .references(() => produtos.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  quantidadeComprada: integer("quantidade_comprada").notNull(),
  custoTotal: decimal("custo_total", { precision: 10, scale: 2 }).notNull(),
  dataCompra: timestamp("data_compra").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  vendas: many(vendas),
  reposicoes: many(reposicaoEstoque),
}));

export const produtosRelations = relations(produtos, ({ many }) => ({
  vendaItens: many(vendaItens),
  reposicoes: many(reposicaoEstoque),
}));

export const vendasRelations = relations(vendas, ({ one, many }) => ({
  user: one(users, { fields: [vendas.userId], references: [users.id] }),
  itens: many(vendaItens),
}));

export const vendaItensRelations = relations(vendaItens, ({ one }) => ({
  venda: one(vendas, { fields: [vendaItens.vendaId], references: [vendas.id] }),
  produto: one(produtos, { fields: [vendaItens.produtoId], references: [produtos.id] }),
}));

export const reposicaoEstoqueRelations = relations(reposicaoEstoque, ({ one }) => ({
  produto: one(produtos, { fields: [reposicaoEstoque.produtoId], references: [produtos.id] }),
  user: one(users, { fields: [reposicaoEstoque.userId], references: [users.id] }),
}));
