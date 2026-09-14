"use client";

import * as React from "react";
import { Plus, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasks } from "@/lib/tasks/tasks-provider";
import { useUI } from "@/components/providers/ui-provider";
import { TaskForm } from "@/components/tasks/task-form";
import { PlanTomorrow } from "@/components/tasks/plan-tomorrow";
import { TasksBoard } from "@/components/tasks/tasks-board";
import { TasksList } from "@/components/tasks/tasks-list";
import { TasksAgenda } from "@/components/tasks/tasks-agenda";
import { applyTaskFilters, type TaskPeriod } from "@/lib/tasks/filters";
import { tomorrowISO } from "@/lib/tasks/filters";
import type { TaskPriority, TaskStatus } from "@/lib/tasks/types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TarefasPage() {
  const { tasks } = useTasks();
  const { openDrawer, closeDrawer } = useUI();

  const [view, setView] = React.useState<"kanban" | "lista" | "agenda">("kanban");
  const [period, setPeriod] = React.useState<TaskPeriod>("todas");
  const [priority, setPriority] = React.useState<TaskPriority | "todas">("todas");
  const [status, setStatus] = React.useState<TaskStatus | "todas">("todas");
  const [search, setSearch] = React.useState("");

  const today = todayISO();
  const filtered = applyTaskFilters(
    tasks,
    {
      period,
      priority: priority === "todas" ? undefined : priority,
      status: status === "todas" ? undefined : status,
      search,
    },
    today
  );

  function openNewTask() {
    openDrawer({
      title: "Nova tarefa",
      description: "Só o título é obrigatório.",
      content: <TaskForm onDone={closeDrawer} />,
    });
  }

  function openPlanTomorrow() {
    openDrawer({
      title: "Planejar amanhã",
      content: <PlanTomorrow tomorrowISO={tomorrowISO(today)} />,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tarefas"
        description="Kanban, lista e agenda sobre a mesma coleção de tarefas."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={openPlanTomorrow}>
              <CalendarClock className="size-4" />
              Planejar amanhã
            </Button>
            <Button onClick={openNewTask}>
              <Plus className="size-4" />
              Nova tarefa
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tarefa..."
          className="max-w-xs flex-1"
        />
        <Select value={period} onValueChange={(v) => setPeriod(v as TaskPeriod)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="semana">Esta semana</SelectItem>
            <SelectItem value="atrasadas">Atrasadas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Toda prioridade</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todo status</SelectItem>
            <SelectItem value="a_fazer">A fazer</SelectItem>
            <SelectItem value="em_andamento">Em andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>

        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="ml-auto">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "kanban" ? <TasksBoard tasks={filtered} /> : null}
      {view === "lista" ? <TasksList tasks={filtered} todayISO={today} /> : null}
      {view === "agenda" ? <TasksAgenda tasks={filtered} todayISO={today} /> : null}
    </div>
  );
}
