import { Settings } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export default function ConfiguracoesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Configurações"
        description="Preferências gerais do sistema."
      />
      <EmptyState
        icon={Settings}
        title="Configurações detalhadas chegam nas próximas fases"
        description="Aqui você vai personalizar campos, canais e preferências do ERP."
      />
    </div>
  );
}
