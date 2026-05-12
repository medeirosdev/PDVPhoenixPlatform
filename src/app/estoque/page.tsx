import { getProdutos } from "@/actions/estoque";
import { StockBadge } from "@/components/StockBadge";
import { NovoProdutoDialog } from "@/components/NovoProdutoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export default async function EstoquePage() {
  const produtos = await getProdutos();

  const alertas = produtos.filter(
    (p) => p.ativo && p.estoqueAtual <= p.alertaEstoque
  );

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Estoque</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {produtos.filter((p) => p.ativo).length} produtos ativos
            </p>
          </div>
          <NovoProdutoDialog />
        </div>

        {alertas.length > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
            <p className="text-sm font-medium text-amber-400 mb-1">
              {alertas.length} produto{alertas.length > 1 ? "s" : ""} com estoque baixo
            </p>
            <ul className="text-xs text-amber-400/70 space-y-0.5">
              {alertas.map((p) => (
                <li key={p.id}>· {p.nome} — {p.estoqueAtual} un.</li>
              ))}
            </ul>
          </div>
        )}

        {produtos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Package className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              {produtos.map((prod, i) => {
                const margem =
                  ((parseFloat(prod.precoVenda) - parseFloat(prod.precoCusto)) /
                    parseFloat(prod.precoVenda)) *
                  100;

                return (
                  <div key={prod.id}>
                    <div className={`flex items-center justify-between px-4 py-3 ${!prod.ativo ? "opacity-40" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{prod.nome}</p>
                          {!prod.ativo && (
                            <span className="text-xs text-muted-foreground shrink-0">(inativo)</span>
                          )}
                        </div>
                        <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span>Venda: R$ {parseFloat(prod.precoVenda).toFixed(2).replace(".", ",")}</span>
                          <span>Custo: R$ {parseFloat(prod.precoCusto).toFixed(2).replace(".", ",")}</span>
                          <span className="text-primary/80">{margem.toFixed(0)}% margem</span>
                        </div>
                      </div>
                      <div className="ml-3 shrink-0">
                        <StockBadge
                          estoqueAtual={prod.estoqueAtual}
                          alertaEstoque={prod.alertaEstoque}
                        />
                      </div>
                    </div>
                    {i < produtos.length - 1 && (
                      <div className="h-px bg-border mx-4" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
