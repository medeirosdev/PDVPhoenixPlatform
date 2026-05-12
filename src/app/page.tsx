import { getProdutosAtivos } from "@/actions/vendas";
import { RegistrarVendaClient } from "@/components/RegistrarVendaClient";

export default async function HomePage() {
  const produtos = await getProdutosAtivos();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-4">Registrar Venda</h1>
        <RegistrarVendaClient produtos={produtos} />
      </div>
    </div>
  );
}
