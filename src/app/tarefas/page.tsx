import { CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export default function TarefasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tarefas"
        description="Kanban, lista e agenda para organizar o que precisa ser feito."
      />
      <EmptyState
        icon={CheckSquare}
        title="Módulo de tarefas chega na Fase 4"
        description="Visões em Kanban, lista e agenda serão construídas junto com o Canvas."
      />
    </div>
  );
}
