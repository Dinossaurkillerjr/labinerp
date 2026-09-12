"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { useTasks } from "@/lib/tasks/tasks-provider";
import { getTasksForDate } from "@/lib/tasks/filters";

export function PlanTomorrow({ tomorrowISO }: { tomorrowISO: string }) {
  const { tasks, addTask, updateTask, reorderTasks } = useTasks();
  const [newTitle, setNewTitle] = React.useState("");

  const tomorrowTasks = getTasksForDate(tasks, tomorrowISO);

  function addQuickTask() {
    if (!newTitle.trim()) return;
    addTask({ title: newTitle, dueDate: tomorrowISO });
    setNewTitle("");
    toast.success("Adicionada a amanhã.");
  }

  function removeFromTomorrow(id: string) {
    updateTask(id, { dueDate: undefined });
  }

  function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= tomorrowTasks.length) return;
    const reordered = [...tomorrowTasks];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    reorderTasks(reordered.map((t) => t.id));
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <p className="text-body text-muted-foreground">
        Revise o que já está planejado para amanhã e adicione o que faltar — sem precisar preencher tudo agora.
      </p>

      <div className="flex items-center gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nova tarefa para amanhã..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addQuickTask();
            }
          }}
        />
        <Button variant="outline" size="icon" onClick={addQuickTask} type="button" aria-label="Adicionar">
          <Plus className="size-4" />
        </Button>
      </div>

      {tomorrowTasks.length === 0 ? (
        <EmptyState title="Nada planejado para amanhã ainda" description="Adicione algo acima ou volte às tarefas para definir prazos." />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {tomorrowTasks.map((task, index) => (
            <div key={task.id} className="flex items-center gap-2 px-3 py-2.5">
              <span className="flex-1 text-body text-foreground">{task.title}</span>
              <Button variant="ghost" size="icon-sm" aria-label="Mover para cima" disabled={index === 0} onClick={() => move(index, -1)}>
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Mover para baixo"
                disabled={index === tomorrowTasks.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="size-3.5" />
              </Button>
              <button onClick={() => removeFromTomorrow(task.id)} aria-label="Remover de amanhã" type="button">
                <X className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
