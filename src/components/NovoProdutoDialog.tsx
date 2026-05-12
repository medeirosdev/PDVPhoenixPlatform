"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
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
import { criarProduto } from "@/actions/estoque";

export function NovoProdutoDialog() {
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
      await criarProduto(data);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="h-4 w-4 mr-1" /> Novo produto
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" placeholder="Ex: KitKat" required />
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
                placeholder="2,50"
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
                placeholder="1,20"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="estoqueAtual">Estoque inicial</Label>
              <Input
                id="estoqueAtual"
                name="estoqueAtual"
                type="number"
                min="0"
                placeholder="0"
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
                placeholder="5"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar produto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
