import { Badge } from "@/components/ui/badge";

type Props = {
  estoqueAtual: number;
  alertaEstoque: number;
};

export function StockBadge({ estoqueAtual, alertaEstoque }: Props) {
  if (estoqueAtual === 0) {
    return <Badge variant="destructive">Sem estoque</Badge>;
  }
  if (estoqueAtual <= alertaEstoque) {
    return (
      <Badge className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/20">
        Baixo ({estoqueAtual})
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20">
      {estoqueAtual} un.
    </Badge>
  );
}
