"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";

export async function getProdutos() {
  const produtos = await db.produto.findMany({
    orderBy: { nome: "asc" },
  });
  
  return produtos.map(p => ({
    ...p,
    precoVenda: p.precoVenda.toString(),
    precoCusto: p.precoCusto.toString(),
  }));
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

  await db.produto.create({
    data: {
      nome: data.nome,
      precoVenda: data.precoVenda,
      precoCusto: data.precoCusto,
      estoqueAtual: data.estoqueAtual,
      alertaEstoque: data.alertaEstoque,
    }
  });

  revalidatePath("/estoque");
  revalidatePath("/");
}

export async function toggleProduto(id: string, ativo: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  await db.produto.update({
    where: { id },
    data: { ativo },
  });

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
    estoqueAtual: number;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  await db.produto.update({
    where: { id },
    data: {
      nome: data.nome,
      precoVenda: data.precoVenda,
      precoCusto: data.precoCusto,
      alertaEstoque: data.alertaEstoque,
      estoqueAtual: data.estoqueAtual,
    }
  });

  revalidatePath("/estoque");
  revalidatePath("/");
}
