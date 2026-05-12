"use client";

import { useState, useTransition } from "react";
import { Edit, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editarProduto } from "@/actions/estoque";

type Produto = {
  id: string;
  nome: string;
  precoVenda: string;
  precoCusto: string;
  estoqueAtual: number;
  alertaEstoque: number;
};

export function EditarProdutoDialog({ produto }: { produto: Produto }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      nome: (form.elements.namedItem("nome") as HTMLInputElement).value,
      precoVenda: parseFloat((form.elements.namedItem("precoVenda") as HTMLInputElement).value),
      precoCusto: parseFloat((form.elements.namedItem("precoCusto") as HTMLInputElement).value),
      estoqueAtual: parseInt((form.elements.namedItem("estoqueAtual") as HTMLInputElement).value),
      alertaEstoque: parseInt((form.elements.namedItem("alertaEstoque") as HTMLInputElement).value),
    };

    startTransition(async () => {
      await editarProduto(produto.id, data);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />}>
        <Edit2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" defaultValue={produto.nome} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="precoVenda">Preço de venda (R$)</Label>
              <Input
                id="precoVenda"
                name="precoVenda"
                type="number"
                step="0.01"
                min="0"
                defaultValue={parseFloat(produto.precoVenda).toFixed(2)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precoCusto">Custo (R$)</Label>
              <Input
                id="precoCusto"
                name="precoCusto"
                type="number"
                step="0.01"
                min="0"
                defaultValue={parseFloat(produto.precoCusto).toFixed(2)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="estoqueAtual">Estoque atual</Label>
              <Input
                id="estoqueAtual"
                name="estoqueAtual"
                type="number"
                min="0"
                defaultValue={produto.estoqueAtual}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alertaEstoque">Alerta abaixo de</Label>
              <Input
                id="alertaEstoque"
                name="alertaEstoque"
                type="number"
                min="1"
                defaultValue={produto.alertaEstoque}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
