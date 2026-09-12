"use client";

import { CheckSquare } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PriorityBadge } from "@/components/common/priority-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTasks } from "@/lib/tasks/tasks-provider";
import { useSettings } from "@/lib/settings/settings-provider";
import { isOverdue } from "@/lib/tasks/filters";
import { buildTarefasKpi } from "@/lib/dashboard/calculations";
import type { Task } from "@/lib/tasks/types";

const PRIORITY_WEIGHT: Record<string, number> = { alta: 0, media: 1, baixa: 2 };

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-caption">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

export function DashboardTasksStatCard({ todayISO }: { todayISO: string }) {
  const { tasks } = useTasks();
  const { settings } = useSettings();
  const kpi = buildTarefasKpi(tasks, todayISO);
  const pending = tasks.filter((t) => t.status !== "concluido").length;

  return (
    <StatCard
      label="Tarefas"
      value={`${pending} pendentes`}
      icon={CheckSquare}
      href="/tarefas"
      footer={
        settings.dashboardDetailed ? (
          <div className="flex flex-col gap-0.5">
            <DetailRow label="Hoje" value={String(kpi.hoje)} />
            <DetailRow label="Atrasadas" value={String(kpi.atrasadas)} />
            <DetailRow label="Próximas (semana)" value={String(kpi.proximas)} />
            <DetailRow label="Concluídas" value={String(kpi.concluidas)} />
          </div>
        ) : undefined
      }
    />
  );
}

export function DashboardPriorityTasksCard() {
  const { tasks } = useTasks();
  const today = new Date().toISOString().slice(0, 10);

  const priorityTasks = tasks
    .filter((t) => t.status !== "concluido")
    .sort((a, b) => {
      const weightDiff = (PRIORITY_WEIGHT[a.priority ?? "baixa"] ?? 2) - (PRIORITY_WEIGHT[b.priority ?? "baixa"] ?? 2);
      if (weightDiff !== 0) return weightDiff;
      return (a.dueDate ?? "9999") < (b.dueDate ?? "9999") ? -1 : 1;
    })
    .slice(0, 5);

  const columns: DataTableColumn<Task>[] = [
    { key: "title", header: "Tarefa", render: (row) => row.title },
    { key: "priority", header: "Prioridade", render: (row) => (row.priority ? <PriorityBadge priority={row.priority} /> : "—") },
    {
      key: "dueDate",
      header: "Prazo",
      align: "right",
      render: (row) => {
        if (!row.dueDate) return "—";
        const label = new Date(row.dueDate + "T00:00:00").toLocaleDateString("pt-BR");
        return isOverdue(row, today) ? <span className="text-destructive">{label}</span> : label;
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarefas prioritárias</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={priorityTasks}
          emptyTitle="Nenhuma tarefa pendente"
          emptyDescription="Você está em dia."
        />
      </CardContent>
    </Card>
  );
}
