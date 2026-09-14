import { PageHeader } from "@/components/common/page-header";
import { ProductsPanel } from "@/components/catalog/products-panel";

export default function ProdutosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Produtos"
        description="Catálogo interno, custos reais e simulação — sem duplicar a Nuvemshop."
      />
      <ProductsPanel />
    </div>
  );
}
