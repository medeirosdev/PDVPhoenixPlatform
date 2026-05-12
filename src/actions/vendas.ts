"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";

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

  const venda = await db.$transaction(async (tx) => {
    const v = await tx.venda.create({
      data: {
        userId: session.user.id,
        valorTotal,
        itens: {
          create: itens.map((item) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
          })),
        },
      },
    });

    for (const item of itens) {
      await tx.produto.update({
        where: { id: item.produtoId },
        data: {
          estoqueAtual: { decrement: item.quantidade },
        },
      });
    }

    return v;
  });

  revalidatePath("/");
  revalidatePath("/estoque");
  revalidatePath("/dashboard");

  return { success: true, vendaId: venda.id };
}

export async function getProdutosAtivos() {
  const produtos = await db.produto.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });
  
  return produtos.map(p => ({
    ...p,
    precoVenda: p.precoVenda.toString(),
    precoCusto: p.precoCusto.toString(),
  }));
}
