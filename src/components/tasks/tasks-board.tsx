"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/common/priority-badge";
import { EmptyState } from "@/components/common/empty-state";
import { useTasks } from "@/lib/tasks/tasks-provider";
import { useUI } from "@/components/providers/ui-provider";
import { TaskForm } from "@/components/tasks/task-form";
import { groupByStatus } from "@/lib/tasks/filters";
import { DEFAULT_STATUS_COLUMNS } from "@/lib/tasks/types";
import type { Task, TaskStatus } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";

function TaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  return (
    <button
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/task-id", task.id)}
      onClick={onOpen}
      className="flex w-full flex-col gap-1.5 rounded-lg border border-border bg-card p-2.5 text-left shadow-subtle transition-colors hover:border-electric-blue/40"
    >
      <span className="text-body text-foreground">{task.title}</span>
      <div className="flex items-center justify-between">
        {task.priority ? <PriorityBadge priority={task.priority} /> : <span />}
        {task.dueDate ? (
          <span className="text-caption text-muted-foreground">
            {new Date(task.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
          </span>
        ) : null}
      </div>
      {task.checklist?.length ? (
        <span className="text-caption text-muted-foreground">
          {task.checklist.filter((c) => c.done).length}/{task.checklist.length} itens
        </span>
      ) : null}
    </button>
  );
}

export function TasksBoard({ tasks }: { tasks: Task[] }) {
  const { setTaskStatus } = useTasks();
  const { openDrawer, closeDrawer } = useUI();
  const [dragOverColumn, setDragOverColumn] = React.useState<TaskStatus | null>(null);
  const grouped = groupByStatus(tasks, DEFAULT_STATUS_COLUMNS);

  function openTask(task: Task) {
    openDrawer({ title: "Editar tarefa", content: <TaskForm task={task} onDone={closeDrawer} /> });
  }

  function openNewTask(status: TaskStatus) {
    openDrawer({
      title: "Nova tarefa",
      description: "Só o título é obrigatório.",
      content: <TaskForm defaultStatus={status} onDone={closeDrawer} />,
    });
  }

  function handleDrop(event: React.DragEvent, status: TaskStatus) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/task-id");
    if (taskId) setTaskStatus(taskId, status);
    setDragOverColumn(null);
  }

  if (tasks.length === 0) {
    return <EmptyState title="Nenhuma tarefa por aqui" description="Crie a primeira tarefa para começar." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {DEFAULT_STATUS_COLUMNS.map((column) => (
        <div
          key={column.id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverColumn(column.id);
          }}
          onDragLeave={() => setDragOverColumn((current) => (current === column.id ? null : current))}
          onDrop={(e) => handleDrop(e, column.id)}
          className={cn(
            "flex flex-col gap-2 rounded-xl border border-border bg-paper-mist/60 p-3 transition-colors",
            dragOverColumn === column.id && "border-electric-blue bg-sidebar-accent/30"
          )}
        >
          <div className="flex items-center justify-between px-0.5">
            <span className="text-body font-medium text-foreground">
              {column.label} <span className="text-muted-foreground">({grouped[column.id].length})</span>
            </span>
            <Button variant="ghost" size="icon-sm" aria-label="Nova tarefa" onClick={() => openNewTask(column.id)}>
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {grouped[column.id].map((task) => (
              <TaskCard key={task.id} task={task} onOpen={() => openTask(task)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
