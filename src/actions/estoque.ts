"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { produtos } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProdutos() {
  return db.query.produtos.findMany({
    orderBy: (p, { asc }) => [asc(p.nome)],
  });
}

export async function criarProduto(data: {
  nome: string;
  precoVenda: number;
  precoCusto: number;
  estoqueAtual: number;
  alertaEstoque: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  await db.insert(produtos).values({
    nome: data.nome,
    precoVenda: data.precoVenda.toFixed(2),
    precoCusto: data.precoCusto.toFixed(2),
    estoqueAtual: data.estoqueAtual,
    alertaEstoque: data.alertaEstoque,
  });

  revalidatePath("/estoque");
  revalidatePath("/");
}

export async function toggleProduto(id: string, ativo: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  await db.update(produtos).set({ ativo }).where(eq(produtos.id, id));

  revalidatePath("/estoque");
  revalidatePath("/");
}

export async function editarProduto(
  id: string,
  data: {
    nome: string;
    precoVenda: number;
    precoCusto: number;
    alertaEstoque: number;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  await db
    .update(produtos)
    .set({
      nome: data.nome,
      precoVenda: data.precoVenda.toFixed(2),
      precoCusto: data.precoCusto.toFixed(2),
      alertaEstoque: data.alertaEstoque,
    })
    .where(eq(produtos.id, id));

  revalidatePath("/estoque");
  revalidatePath("/");
}
