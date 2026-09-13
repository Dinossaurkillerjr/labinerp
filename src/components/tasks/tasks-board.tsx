"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/common/priority-badge";
import { KanbanBoard } from "@/components/common/kanban-board";
import { useTasks } from "@/lib/tasks/tasks-provider";
import { useUI } from "@/components/providers/ui-provider";
import { TaskForm } from "@/components/tasks/task-form";
import { DEFAULT_STATUS_COLUMNS } from "@/lib/tasks/types";
import type { Task, TaskStatus } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";

const TAG_COLOR_BG: Record<string, string> = {
  neutral: "bg-silver",
  blue: "bg-electric-blue",
  green: "bg-vivid-green",
  orange: "bg-tangerine",
  violet: "bg-lavender",
};

function TaskCardContent({ task }: { task: Task }) {
  const stripColor = task.tags?.[0]?.color;
  return (
    <div className="flex gap-2">
      {stripColor ? <span className={cn("w-1 shrink-0 self-stretch rounded-full", TAG_COLOR_BG[stripColor])} /> : null}
      <div className="flex flex-1 flex-col gap-1.5">
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
      </div>
    </div>
  );
}

export function TasksBoard({ tasks }: { tasks: Task[] }) {
  const { setTaskStatus } = useTasks();
  const { openDrawer, closeDrawer } = useUI();

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

  return (
    <KanbanBoard
      columns={DEFAULT_STATUS_COLUMNS}
      items={tasks}
      getColumnId={(task) => task.status}
      onMove={(taskId, columnId) => setTaskStatus(taskId, columnId as TaskStatus)}
      onOpenItem={openTask}
      onAddToColumn={(columnId) => openNewTask(columnId as TaskStatus)}
      renderCard={(task) => <TaskCardContent task={task} />}
      emptyTitle="Nenhuma tarefa por aqui"
      emptyDescription="Crie a primeira tarefa para começar — só o título é obrigatório."
      emptyAction={
        <Button onClick={() => openNewTask("a_fazer")}>
          <Plus className="size-4" />
          Nova tarefa
        </Button>
      }
    />
  );
}
