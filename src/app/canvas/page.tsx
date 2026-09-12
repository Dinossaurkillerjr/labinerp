import { PenTool } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export default function CanvasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Canvas"
        description="Espaço livre para criar e organizar ideias."
      />
      <EmptyState
        icon={PenTool}
        title="Canvas infinito chega na Fase 4"
        description="Um espaço de criação livre para registrar o que você está pensando."
      />
    </div>
  );
}
