import { db } from "@/db";
import { vendas, vendaItens, produtos } from "@/db/schema";
import { gte, sql, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficoVendas } from "@/components/GraficoVendas";
import { StockBadge } from "@/components/StockBadge";
import { TrendingUp, DollarSign, ShoppingBag, AlertTriangle } from "lucide-react";

async function getDadosDashboard() {
  const agora = new Date();
  const inicioSemana = new Date(agora);
  inicioSemana.setDate(agora.getDate() - 6);
  inicioSemana.setHours(0, 0, 0, 0);

  const vendasSemana = await db
    .select({
      data: vendas.dataVenda,
      total: vendas.valorTotal,
    })
    .from(vendas)
    .where(gte(vendas.dataVenda, inicioSemana))
    .orderBy(vendas.dataVenda);

  const diasMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(agora);
    d.setDate(agora.getDate() - i);
    const key = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" });
    diasMap[key] = 0;
  }

  for (const v of vendasSemana) {
    const key = new Date(v.data).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
    });
    if (key in diasMap) diasMap[key] += parseFloat(v.total);
  }

  const dadosGrafico = Object.entries(diasMap).map(([dia, total]) => ({
    dia: dia.replace(".", ""),
    total: parseFloat(total.toFixed(2)),
  }));

  const faturamentoTotal = vendasSemana.reduce(
    (acc, v) => acc + parseFloat(v.total),
    0
  );

  const [custoSemana] = await db
    .select({
      custoTotal: sql<string>`coalesce(sum(${vendaItens.quantidade} * ${vendaItens.precoUnitario} * (${produtos.precoCusto}::numeric / NULLIF(${produtos.precoVenda}::numeric, 0))), 0)`,
    })
    .from(vendaItens)
    .innerJoin(vendas, sql`${vendaItens.vendaId} = ${vendas.id}`)
    .innerJoin(produtos, sql`${vendaItens.produtoId} = ${produtos.id}`)
    .where(gte(vendas.dataVenda, inicioSemana));

  const lucro = faturamentoTotal - (parseFloat(custoSemana?.custoTotal ?? "0") || 0);
  const ticketMedio = vendasSemana.length > 0 ? faturamentoTotal / vendasSemana.length : 0;

  const produtosAlerta = await db.query.produtos.findMany({
    where: (p, { and, lte, eq }) =>
      and(eq(p.ativo, true), lte(p.estoqueAtual, p.alertaEstoque)),
    orderBy: (p, { asc }) => [asc(p.estoqueAtual)],
  });

  const topVendidos = await db
    .select({
      nome: produtos.nome,
      totalVendido: sql<string>`sum(${vendaItens.quantidade})`,
    })
    .from(vendaItens)
    .innerJoin(vendas, sql`${vendaItens.vendaId} = ${vendas.id}`)
    .innerJoin(produtos, sql`${vendaItens.produtoId} = ${produtos.id}`)
    .where(gte(vendas.dataVenda, inicioSemana))
    .groupBy(produtos.id, produtos.nome)
    .orderBy(desc(sql`sum(${vendaItens.quantidade})`))
    .limit(5);

  return {
    dadosGrafico,
    faturamentoTotal,
    lucro,
    ticketMedio,
    totalVendas: vendasSemana.length,
    produtosAlerta,
    topVendidos,
  };
}

export default async function DashboardPage() {
  const dados = await getDadosDashboard();

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-xs text-muted-foreground -mt-2">Últimos 7 dias</p>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Faturamento</span>
              </div>
              <p className="text-lg font-bold text-primary">
                {fmt(dados.faturamentoTotal)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Lucro bruto</span>
              </div>
              <p className="text-lg font-bold text-green-400">
                {fmt(dados.lucro)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-xs">Vendas</span>
              </div>
              <p className="text-lg font-bold">{dados.totalVendas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-xs">Ticket médio</span>
              </div>
              <p className="text-lg font-bold">{fmt(dados.ticketMedio)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm">Vendas por dia</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <GraficoVendas dados={dados.dadosGrafico} />
          </CardContent>
        </Card>

        {dados.topVendidos.length > 0 && (
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Mais vendidos</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {dados.topVendidos.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{item.nome}</span>
                  <span className="text-sm font-semibold text-primary">
                    {item.totalVendido} un.
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {dados.produtosAlerta.length > 0 && (
          <Card className="border-orange-500/30">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2 text-orange-400">
                <AlertTriangle className="h-4 w-4" />
                Precisa comprar
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {dados.produtosAlerta.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between">
                  <span className="text-sm">{prod.nome}</span>
                  <StockBadge
                    estoqueAtual={prod.estoqueAtual}
                    alertaEstoque={prod.alertaEstoque}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
