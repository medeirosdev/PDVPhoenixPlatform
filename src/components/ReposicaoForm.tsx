"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registrarReposicao } from "@/actions/reposicao";

type Produto = {
  id: string;
  nome: string;
  estoqueAtual: number;
};

export function ReposicaoForm({ produtos }: { produtos: Produto[] }) {
  const [produtoId, setProdutoId] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [isPending, startTransition] = useTransition();

  const produtoSelecionado = produtos.find((p) => p.id === produtoId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const quantidade = parseInt(
      (form.elements.namedItem("quantidade") as HTMLInputElement).value
    );
    const custoTotal = parseFloat(
      (form.elements.namedItem("custoTotal") as HTMLInputElement).value
    );

    startTransition(async () => {
      await registrarReposicao({ produtoId, quantidade, custoTotal });
      form.reset();
      setProdutoId("");
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {sucesso && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/8 px-3 py-2.5 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Reposição registrada! Estoque atualizado.
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Produto
        </Label>
        <Select value={produtoId} onValueChange={(v) => setProdutoId(v ?? "")} required>
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Selecione o produto...">
              {produtoSelecionado
                ? produtoSelecionado.nome
                : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {produtos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center justify-between gap-4 w-full">
                  <span>{p.nome}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.estoqueAtual} un.
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="quantidade"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Quantidade
          </Label>
          <Input
            id="quantidade"
            name="quantidade"
            type="number"
            min="1"
            placeholder="Ex: 24"
            required
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="custoTotal"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            Custo total (R$)
          </Label>
          <Input
            id="custoTotal"
            name="custoTotal"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 28,80"
            required
            className="h-10"
          />
        </div>
      </div>

      {produtoSelecionado && (
        <p className="text-xs text-muted-foreground">
          Estoque atual de <span className="font-medium text-foreground">{produtoSelecionado.nome}</span>:{" "}
          <span className="font-medium text-foreground">{produtoSelecionado.estoqueAtual} un.</span>
        </p>
      )}

      <Button
        type="submit"
        className="w-full h-10 font-semibold"
        disabled={isPending || !produtoId}
      >
        {isPending ? "Registrando..." : "Registrar reposição"}
      </Button>
    </form>
  );
}
