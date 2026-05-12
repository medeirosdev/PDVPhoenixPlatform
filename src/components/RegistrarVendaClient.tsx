"use client";

import { useState, useTransition } from "react";
import { Minus, Plus, ShoppingCart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { registrarVenda } from "@/actions/vendas";
import type { produtos as ProdutoType } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

type Produto = InferSelectModel<typeof ProdutoType>;
type Carrinho = Record<string, number>;

export function RegistrarVendaClient({ produtos }: { produtos: Produto[] }) {
  const [carrinho, setCarrinho] = useState<Carrinho>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalItens = Object.values(carrinho).reduce((a, b) => a + b, 0);
  const totalValor = Object.entries(carrinho).reduce((acc, [id, qtd]) => {
    const prod = produtos.find((p) => p.id === id);
    return acc + (prod ? parseFloat(prod.precoVenda) * qtd : 0);
  }, 0);

  function add(id: string) {
    const prod = produtos.find((p) => p.id === id);
    if (!prod) return;
    const atual = carrinho[id] ?? 0;
    if (atual >= prod.estoqueAtual) return;
    setCarrinho((c) => ({ ...c, [id]: atual + 1 }));
  }

  function remove(id: string) {
    setCarrinho((c) => {
      const atual = c[id] ?? 0;
      if (atual <= 1) {
        const { [id]: _, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: atual - 1 };
    });
  }

  function confirmar() {
    const itens = Object.entries(carrinho)
      .filter(([, qtd]) => qtd > 0)
      .map(([id, qtd]) => {
        const prod = produtos.find((p) => p.id === id)!;
        return {
          produtoId: id,
          quantidade: qtd,
          precoUnitario: parseFloat(prod.precoVenda),
        };
      });

    startTransition(async () => {
      await registrarVenda(itens);
      setCarrinho({});
      setSucesso(true);
      setSheetOpen(false);
      setTimeout(() => setSucesso(false), 3000);
    });
  }

  return (
    <div className="space-y-4">
      {sucesso && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/8 px-3 py-2.5 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Venda registrada com sucesso!
        </div>
      )}

      {produtos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Nenhum produto cadastrado ainda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {produtos.map((prod) => {
            const qtd = carrinho[prod.id] ?? 0;
            const semEstoque = prod.estoqueAtual === 0;

            return (
              <Card
                key={prod.id}
                className={`transition-opacity ${semEstoque ? "opacity-40" : ""}`}
              >
                <CardContent className="p-3.5 space-y-3">
                  <div>
                    <p className="font-medium text-sm leading-snug">{prod.nome}</p>
                    <p className="text-base font-bold text-primary mt-0.5">
                      R${parseFloat(prod.precoVenda).toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {prod.estoqueAtual} em estoque
                    </p>
                  </div>

                  {qtd === 0 ? (
                    <Button
                      size="sm"
                      className="w-full h-8 text-xs"
                      disabled={semEstoque}
                      onClick={() => add(prod.id)}
                    >
                      {semEstoque ? "Sem estoque" : "+ Adicionar"}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg bg-muted px-1 py-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => remove(prod.id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-bold text-primary text-sm w-6 text-center">
                        {qtd}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => add(prod.id)}
                        disabled={qtd >= prod.estoqueAtual}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalItens > 0 && (
        <>
          <div className="fixed bottom-20 left-0 right-0 px-4 max-w-lg mx-auto">
            <Button
              className="w-full h-12 text-sm font-semibold shadow-lg shadow-primary/10"
              onClick={() => setSheetOpen(true)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {totalItens} {totalItens === 1 ? "item" : "itens"} ·
              R$ {totalValor.toFixed(2).replace(".", ",")}
            </Button>
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader className="pb-2">
                <SheetTitle>Confirmar venda</SheetTitle>
              </SheetHeader>
              <div className="space-y-3 mt-2">
                {Object.entries(carrinho).map(([id, qtd]) => {
                  const prod = produtos.find((p) => p.id === id);
                  if (!prod) return null;
                  return (
                    <div key={id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{prod.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {qtd}× R$ {parseFloat(prod.precoVenda).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        R$ {(parseFloat(prod.precoVenda) * qtd).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  );
                })}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary tabular-nums">
                    R$ {totalValor.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <Button
                  className="w-full h-11 font-semibold mt-1"
                  onClick={confirmar}
                  disabled={isPending}
                >
                  {isPending ? "Registrando..." : "Confirmar venda"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}
