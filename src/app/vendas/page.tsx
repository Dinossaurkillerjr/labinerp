import { PageHeader } from "@/components/common/page-header";
import { SalesPanel } from "@/components/sales/sales-panel";

export default function VendasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vendas"
        description="Registro de vendas dos canais Nuvemshop, Instagram e WhatsApp para análise."
      />
      <SalesPanel />
    </div>
  );
}
