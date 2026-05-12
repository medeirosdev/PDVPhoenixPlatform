"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";

export async function registrarReposicao(data: {
  produtoId: string;
  quantidade: number;
  custoTotal: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  await db.$transaction([
    db.reposicaoEstoque.create({
      data: {
        produtoId: data.produtoId,
        userId: session.user.id,
        quantidadeComprada: data.quantidade,
        custoTotal: data.custoTotal,
      }
    }),
    db.produto.update({
      where: { id: data.produtoId },
      data: {
        estoqueAtual: { increment: data.quantidade }
      }
    })
  ]);

  revalidatePath("/estoque");
  revalidatePath("/reposicao");
  revalidatePath("/dashboard");
}

export async function getHistoricoReposicao() {
  const historico = await db.reposicaoEstoque.findMany({
    include: { produto: true, user: true },
    orderBy: { dataCompra: "desc" },
    take: 50,
  });

  return historico.map(h => ({
    ...h,
    custoTotal: h.custoTotal.toString(),
    produto: { ...h.produto, precoVenda: h.produto.precoVenda.toString(), precoCusto: h.produto.precoCusto.toString() }
  }));
}
