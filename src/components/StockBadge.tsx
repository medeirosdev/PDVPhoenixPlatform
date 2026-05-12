type Props = {
  estoqueAtual: number;
  alertaEstoque: number;
};

export function StockBadge({ estoqueAtual, alertaEstoque }: Props) {
  if (estoqueAtual === 0) {
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-red-500/12 text-red-400 ring-1 ring-red-500/20">
        Sem estoque
      </span>
    );
  }
  if (estoqueAtual <= alertaEstoque) {
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-amber-500/12 text-amber-400 ring-1 ring-amber-500/20">
        Baixo · {estoqueAtual}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
      {estoqueAtual} un.
    </span>
  );
}
