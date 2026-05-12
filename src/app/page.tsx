import { getProdutosAtivos } from "@/actions/vendas";
import { RegistrarVendaClient } from "@/components/RegistrarVendaClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const produtos = await getProdutosAtivos();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Registrar Venda</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Selecione os produtos e confirme</p>
        </div>
        <RegistrarVendaClient produtos={produtos} />
      </div>
    </div>
  );
}
