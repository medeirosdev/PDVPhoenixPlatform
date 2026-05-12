import { getProdutos } from "@/actions/estoque";
import { getHistoricoReposicao } from "@/actions/reposicao";
import { ReposicaoForm } from "@/components/ReposicaoForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReposicaoPage() {
  const [produtos, historico] = await Promise.all([
    getProdutos(),
    getHistoricoReposicao(),
  ]);

  const produtosAtivos = produtos.filter((p) => p.ativo);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h1 className="text-lg font-semibold">Reposição</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Registre uma nova entrada de estoque</p>
        </div>

        <Card>
          <CardContent className="pt-5 pb-5">
            <ReposicaoForm produtos={produtosAtivos} />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Histórico recente
          </p>
          {historico.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <RefreshCw className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nenhuma reposição registrada ainda.</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                {historico.map((rep, i) => (
                  <div key={rep.id}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{rep.produto.nome}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          +{rep.quantidadeComprada} un. ·{" "}
                          {new Date(rep.dataCompra).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        R$ {parseFloat(rep.custoTotal).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    {i < historico.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
