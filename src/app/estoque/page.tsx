import { getProdutos } from "@/actions/estoque";
import { StockBadge } from "@/components/StockBadge";
import { NovoProdutoDialog } from "@/components/NovoProdutoDialog";
import { Card, CardContent } from "@/components/ui/card";

export default async function EstoquePage() {
  const produtos = await getProdutos();

  const alertas = produtos.filter(
    (p) => p.ativo && p.estoqueAtual <= p.alertaEstoque
  );

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Estoque</h1>
          <NovoProdutoDialog />
        </div>

        {alertas.length > 0 && (
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
            <p className="text-sm font-semibold text-orange-400 mb-1">
              Atenção: {alertas.length} produto{alertas.length > 1 ? "s" : ""} com estoque baixo
            </p>
            <ul className="text-xs text-orange-300 space-y-0.5">
              {alertas.map((p) => (
                <li key={p.id}>
                  · {p.nome} — {p.estoqueAtual} un.
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          {produtos.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              Nenhum produto cadastrado.
            </p>
          ) : (
            produtos.map((prod) => {
              const margem =
                ((parseFloat(prod.precoVenda) - parseFloat(prod.precoCusto)) /
                  parseFloat(prod.precoVenda)) *
                100;

              return (
                <Card key={prod.id} className={prod.ativo ? "" : "opacity-50"}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{prod.nome}</p>
                          {!prod.ativo && (
                            <span className="text-xs text-muted-foreground">(inativo)</span>
                          )}
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>Venda: R$ {parseFloat(prod.precoVenda).toFixed(2).replace(".", ",")}</span>
                          <span>Custo: R$ {parseFloat(prod.precoCusto).toFixed(2).replace(".", ",")}</span>
                          <span>Margem: {margem.toFixed(0)}%</span>
                        </div>
                      </div>
                      <StockBadge
                        estoqueAtual={prod.estoqueAtual}
                        alertaEstoque={prod.alertaEstoque}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
