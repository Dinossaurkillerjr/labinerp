import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export default function VendasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vendas"
        description="Vendas dos canais e-commerce, Instagram e WhatsApp."
      />
      <EmptyState
        icon={ShoppingBag}
        title="Módulo de vendas chega na Fase 3"
        description="O registro de vendas por canal será construído junto com produtos e contatos."
      />
    </div>
  );
}
