import { Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export default function ContatosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Contatos"
        description="Clientes, fornecedores e parceiros da marca."
      />
      <EmptyState
        icon={Users}
        title="Módulo de contatos chega na Fase 3"
        description="Um CRM simples, sem a complexidade de um CRM avançado."
      />
    </div>
  );
}
