"use client";

import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PriorityBadge } from "@/components/common/priority-badge";
import { Tag, type TagColor } from "@/components/common/tag";
import { useTasks } from "@/lib/tasks/tasks-provider";
import { useUI } from "@/components/providers/ui-provider";
import { TaskForm } from "@/components/tasks/task-form";
import { isOverdue } from "@/lib/tasks/filters";
import { DEFAULT_STATUS_COLUMNS, type Task, type TaskStatus } from "@/lib/tasks/types";

const STATUS_TAG_COLOR: Record<TaskStatus, TagColor> = {
  a_fazer: "neutral",
  em_andamento: "blue",
  concluido: "green",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  a_fazer: "A fazer",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

export function TasksList({ tasks, todayISO }: { tasks: Task[]; todayISO: string }) {
  const { deleteTask, setTaskStatus } = useTasks();
  const { openDrawer, closeDrawer, confirm } = useUI();

  function openTask(task: Task) {
    openDrawer({ title: "Editar tarefa", content: <TaskForm task={task} onDone={closeDrawer} /> });
  }

  const columns: DataTableColumn<Task>[] = [
    {
      key: "title",
      header: "Tarefa",
      render: (row) => (
        <button className="text-left text-foreground hover:underline" onClick={() => openTask(row)}>
          {row.title}
        </button>
      ),
    },
    { key: "status", header: "Status", render: (row) => <Tag color={STATUS_TAG_COLOR[row.status]}>{STATUS_LABEL[row.status]}</Tag> },
    { key: "priority", header: "Prioridade", render: (row) => (row.priority ? <PriorityBadge priority={row.priority} /> : "—") },
    {
      key: "dueDate",
      header: "Prazo",
      render: (row) => {
        if (!row.dueDate) return "—";
        const label = new Date(row.dueDate + "T00:00:00").toLocaleDateString("pt-BR");
        return isOverdue(row, todayISO) ? <span className="text-destructive">{label}</span> : label;
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Ações">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => openTask(row)}>Editar</DropdownMenuItem>
            {DEFAULT_STATUS_COLUMNS.filter((c) => c.id !== row.status).map((column) => (
              <DropdownMenuItem key={column.id} onSelect={() => setTaskStatus(row.id, column.id)}>
                Mover para {column.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() =>
                confirm({
                  title: "Excluir tarefa?",
                  description: `"${row.title}" será removida permanentemente.`,
                  onConfirm: () => {
                    deleteTask(row.id);
                    toast.success("Tarefa excluída.");
                  },
                })
              }
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={tasks}
      emptyTitle="Nenhuma tarefa encontrada"
      emptyDescription="Ajuste os filtros ou crie uma nova tarefa."
    />
  );
}
