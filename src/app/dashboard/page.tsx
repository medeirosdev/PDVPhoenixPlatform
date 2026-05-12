import { db } from "@/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficoVendas } from "@/components/GraficoVendas";
import { StockBadge } from "@/components/StockBadge";
import { TrendingUp, DollarSign, ShoppingBag, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDadosDashboard() {
  const agora = new Date();
  const inicioSemana = new Date(agora);
  inicioSemana.setDate(agora.getDate() - 6);
  inicioSemana.setHours(0, 0, 0, 0);

  const vendasSemana = await db.venda.findMany({
    where: { dataVenda: { gte: inicioSemana } },
    orderBy: { dataVenda: "asc" },
  });

  const diasMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(agora);
    d.setDate(agora.getDate() - i);
    const key = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" });
    diasMap[key] = 0;
  }

  let faturamentoTotal = 0;
  for (const v of vendasSemana) {
    const key = new Date(v.dataVenda).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
    });
    const totalVenda = Number(v.valorTotal);
    if (key in diasMap) diasMap[key] += totalVenda;
    faturamentoTotal += totalVenda;
  }

  const dadosGrafico = Object.entries(diasMap).map(([dia, total]) => ({
    dia: dia.replace(".", ""),
    total: parseFloat(total.toFixed(2)),
  }));

  const itensVendidos = await db.vendaItem.findMany({
    where: { venda: { dataVenda: { gte: inicioSemana } } },
    include: { produto: true },
  });

  let custoSemana = 0;
  const topVendidosMap: Record<string, { nome: string; totalVendido: number }> = {};

  for (const item of itensVendidos) {
    const qtde = item.quantidade;
    const custo = Number(item.produto.precoCusto);
    custoSemana += qtde * custo;

    if (!topVendidosMap[item.produtoId]) {
      topVendidosMap[item.produtoId] = { nome: item.produto.nome, totalVendido: 0 };
    }
    topVendidosMap[item.produtoId].totalVendido += qtde;
  }

  const lucro = faturamentoTotal - custoSemana;
  const ticketMedio = vendasSemana.length > 0 ? faturamentoTotal / vendasSemana.length : 0;

  const todosProdutosAtivos = await db.produto.findMany({
    where: { ativo: true },
  });

  const produtosAlerta = todosProdutosAtivos
    .filter((p) => p.estoqueAtual <= p.alertaEstoque)
    .sort((a, b) => a.estoqueAtual - b.estoqueAtual);

  const topVendidos = Object.values(topVendidosMap)
    .sort((a, b) => b.totalVendido - a.totalVendido)
    .slice(0, 5);

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
