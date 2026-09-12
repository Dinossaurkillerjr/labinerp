import { Package } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export default function ProdutosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Produtos"
        description="Catálogo interno de produtos da marca."
      />
      <EmptyState
        icon={Package}
        title="Módulo de produtos chega na Fase 3"
        description="Aqui você vai cadastrar e organizar seus produtos sem duplicar a Nuvemshop."
      />
    </div>
  );
}
