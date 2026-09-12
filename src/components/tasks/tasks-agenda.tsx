"use client";

import { EmptyState } from "@/components/common/empty-state";
import { PriorityBadge } from "@/components/common/priority-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTasks } from "@/lib/tasks/tasks-provider";
import { useUI } from "@/components/providers/ui-provider";
import { TaskForm } from "@/components/tasks/task-form";
import { groupByDate, isOverdue, NO_DATE_BUCKET } from "@/lib/tasks/filters";
import type { Task } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";

function formatGroupLabel(date: string, todayISO: string): string {
  if (date === NO_DATE_BUCKET) return "Sem data";
  if (date === todayISO) return "Hoje";
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function TasksAgenda({ tasks, todayISO }: { tasks: Task[]; todayISO: string }) {
  const { setTaskStatus } = useTasks();
  const { openDrawer, closeDrawer } = useUI();
  const groups = groupByDate(tasks);

  function openTask(task: Task) {
    openDrawer({ title: "Editar tarefa", content: <TaskForm task={task} onDone={closeDrawer} /> });
  }

  if (groups.length === 0) {
    return <EmptyState title="Nenhuma tarefa por aqui" description="Crie uma tarefa para vê-la na agenda." />;
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.date} className="flex flex-col gap-2">
          <h3
            className={cn(
              "text-body font-medium capitalize",
              group.date === todayISO ? "text-electric-blue" : "text-foreground"
            )}
          >
            {formatGroupLabel(group.date, todayISO)}
          </h3>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {group.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-3 py-2.5">
                <Checkbox
                  checked={task.status === "concluido"}
                  onCheckedChange={(checked) => setTaskStatus(task.id, checked ? "concluido" : "a_fazer")}
                />
                <button
                  className={cn(
                    "flex-1 text-left text-body",
                    task.status === "concluido" ? "text-muted-foreground line-through" : "text-foreground"
                  )}
                  onClick={() => openTask(task)}
                >
                  {task.title}
                </button>
                {group.date !== NO_DATE_BUCKET && isOverdue(task, todayISO) ? (
                  <span className="text-caption text-destructive">Atrasada</span>
                ) : null}
                {task.priority ? <PriorityBadge priority={task.priority} /> : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
