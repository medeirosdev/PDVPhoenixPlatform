"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { reposicaoEstoque, produtos } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function registrarReposicao(data: {
  produtoId: string;
  quantidade: number;
  custoTotal: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  await db.insert(reposicaoEstoque).values({
    produtoId: data.produtoId,
    userId: session.user.id,
    quantidadeComprada: data.quantidade,
    custoTotal: data.custoTotal.toFixed(2),
  });

  await db
    .update(produtos)
    .set({
      estoqueAtual: sql`${produtos.estoqueAtual} + ${data.quantidade}`,
    })
    .where(eq(produtos.id, data.produtoId));

  revalidatePath("/estoque");
  revalidatePath("/reposicao");
  revalidatePath("/dashboard");
}

export async function getHistoricoReposicao() {
  return db.query.reposicaoEstoque.findMany({
    with: { produto: true, user: true },
    orderBy: (r, { desc }) => [desc(r.dataCompra)],
    limit: 50,
  });
}
