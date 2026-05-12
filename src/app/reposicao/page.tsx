import { getProdutos } from "@/actions/estoque";
import { getHistoricoReposicao } from "@/actions/reposicao";
import { ReposicaoForm } from "@/components/ReposicaoForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function ReposicaoPage() {
  const [produtos, historico] = await Promise.all([
    getProdutos(),
    getHistoricoReposicao(),
  ]);

  const produtosAtivos = produtos.filter((p) => p.ativo);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-xl font-bold">Reposição de Estoque</h1>

        <Card>
          <CardContent className="pt-4">
            <ReposicaoForm produtos={produtosAtivos} />
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Histórico recente
          </h2>
          {historico.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">
              Nenhuma reposição registrada ainda.
            </p>
          ) : (
            historico.map((rep, i) => (
              <div key={rep.id}>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{rep.produto.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {rep.quantidadeComprada} un. ·{" "}
                      {new Date(rep.dataCompra).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    R$ {parseFloat(rep.custoTotal).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                {i < historico.length - 1 && <Separator />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
