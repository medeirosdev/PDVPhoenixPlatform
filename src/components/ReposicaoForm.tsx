"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
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
import type { InferSelectModel } from "drizzle-orm";
import type { produtos as ProdutoType } from "@/db/schema";

type Produto = InferSelectModel<typeof ProdutoType>;

export function ReposicaoForm({ produtos }: { produtos: Produto[] }) {
  const [produtoId, setProdutoId] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [isPending, startTransition] = useTransition();

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {sucesso && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          <Check className="h-4 w-4" />
          Reposição registrada! Estoque atualizado.
        </div>
      )}

      <div className="space-y-2">
        <Label>Produto</Label>
        <Select value={produtoId} onValueChange={(v) => setProdutoId(v ?? "")} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o produto..." />
          </SelectTrigger>
          <SelectContent>
            {produtos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nome} (estoque: {p.estoqueAtual})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="quantidade">Quantidade comprada</Label>
          <Input
            id="quantidade"
            name="quantidade"
            type="number"
            min="1"
            placeholder="24"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="custoTotal">Custo total (R$)</Label>
          <Input
            id="custoTotal"
            name="custoTotal"
            type="number"
            step="0.01"
            min="0"
            placeholder="28,80"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || !produtoId}
      >
        {isPending ? "Registrando..." : "Registrar reposição"}
      </Button>
    </form>
  );
}
