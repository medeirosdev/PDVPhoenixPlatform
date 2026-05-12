"use client";

import { useState, useTransition } from "react";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          <Check className="h-4 w-4" />
          Venda registrada com sucesso!
        </div>
      )}

      {produtos.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          Nenhum produto cadastrado ainda.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {produtos.map((prod) => {
            const qtd = carrinho[prod.id] ?? 0;
            const semEstoque = prod.estoqueAtual === 0;

            return (
              <Card
                key={prod.id}
                className={semEstoque ? "opacity-50" : ""}
              >
                <CardContent className="p-3 space-y-2">
                  <div>
                    <p className="font-medium text-sm leading-tight">{prod.nome}</p>
                    <p className="text-primary font-bold">
                      R$ {parseFloat(prod.precoVenda).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Estoque: {prod.estoqueAtual}
                  </p>
                  {qtd === 0 ? (
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={semEstoque}
                      onClick={() => add(prod.id)}
                    >
                      {semEstoque ? "Sem estoque" : "Adicionar"}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => remove(prod.id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-bold text-primary">{qtd}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
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
              className="w-full h-12 text-base font-semibold shadow-lg"
              onClick={() => setSheetOpen(true)}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ver carrinho ({totalItens}) · R$ {totalValor.toFixed(2).replace(".", ",")}
            </Button>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh]">
            <SheetHeader>
              <SheetTitle>Carrinho</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3 overflow-y-auto">
              {Object.entries(carrinho).map(([id, qtd]) => {
                const prod = produtos.find((p) => p.id === id);
                if (!prod) return null;
                return (
                  <div key={id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{prod.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {qtd}x R$ {parseFloat(prod.precoVenda).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <span className="font-semibold">
                      R$ {(parseFloat(prod.precoVenda) * qtd).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                );
              })}
              <Separator />
              <div className="flex items-center justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  R$ {totalValor.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <Button
                className="w-full h-12 text-base font-semibold mt-2"
                onClick={confirmar}
                disabled={isPending}
              >
                {isPending ? "Registrando..." : "Confirmar Venda"}
              </Button>
            </div>
          </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}
