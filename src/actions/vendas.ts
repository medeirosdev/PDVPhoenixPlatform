"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { vendas, vendaItens, produtos } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export type ItemCarrinho = {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
};

export async function registrarVenda(itens: ItemCarrinho[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  if (itens.length === 0) throw new Error("Carrinho vazio");

  const valorTotal = itens.reduce(
    (acc, item) => acc + item.precoUnitario * item.quantidade,
    0
  );

  const [venda] = await db
    .insert(vendas)
    .values({
      userId: session.user.id,
      valorTotal: valorTotal.toFixed(2),
    })
    .returning();

  await db.insert(vendaItens).values(
    itens.map((item) => ({
      vendaId: venda.id,
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario.toFixed(2),
    }))
  );

  for (const item of itens) {
    await db
      .update(produtos)
      .set({
        estoqueAtual: sql`${produtos.estoqueAtual} - ${item.quantidade}`,
      })
      .where(eq(produtos.id, item.produtoId));
  }

  revalidatePath("/");
  revalidatePath("/estoque");
  revalidatePath("/dashboard");

  return { success: true, vendaId: venda.id };
}

export async function getProdutosAtivos() {
  return db.query.produtos.findMany({
    where: (p, { eq }) => eq(p.ativo, true),
    orderBy: (p, { asc }) => [asc(p.nome)],
  });
}
