"use client";

import * as React from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateInput } from "@/components/common/date-input";
import { Combobox } from "@/components/common/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CollapsibleSection } from "@/components/common/collapsible-section";
import { DrawerForm, DrawerFormActions } from "@/components/common/drawer-form";
import { ChecklistEditor } from "@/components/tasks/checklist-editor";
import { useTasks } from "@/lib/tasks/tasks-provider";
import { useCatalog } from "@/lib/catalog/catalog-provider";
import { useContacts } from "@/lib/contacts/contacts-provider";
import { useSales } from "@/lib/sales/sales-provider";
import { DEFAULT_STATUS_COLUMNS } from "@/lib/tasks/types";
import type { ChecklistItem, Task, TaskPriority, TaskStatus } from "@/lib/tasks/types";

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
];

function toISODate(date?: Date): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function TaskForm({
  task,
  defaultDueDate,
  defaultStatus,
  onDone,
}: {
  task?: Task;
  defaultDueDate?: string;
  defaultStatus?: TaskStatus;
  onDone: () => void;
}) {
  const { addTask, updateTask } = useTasks();
  const { products } = useCatalog();
  const { contacts } = useContacts();
  const { sales } = useSales();
  const isEditing = Boolean(task);

  const [title, setTitle] = React.useState(task?.title ?? "");
  const [description, setDescription] = React.useState(task?.description ?? "");
  const [status, setStatus] = React.useState<TaskStatus>(task?.status ?? defaultStatus ?? "a_fazer");
  const [priority, setPriority] = React.useState<TaskPriority | "">(task?.priority ?? "");
  const [dueDate, setDueDate] = React.useState<Date | undefined>(toDate(task?.dueDate ?? defaultDueDate));
  const [category, setCategory] = React.useState(task?.category ?? "");
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>(task?.checklist ?? []);
  const [productId, setProductId] = React.useState(task?.relations?.productId ?? "");
  const [contactId, setContactId] = React.useState(task?.relations?.contactId ?? "");
  const [saleId, setSaleId] = React.useState(task?.relations?.saleId ?? "");

  const hasExtraFields = Boolean(
    task?.description || task?.priority || task?.dueDate || task?.category ||
    task?.checklist?.length || task?.relations?.productId || task?.relations?.contactId || task?.relations?.saleId
  );

  function handleSubmit() {
    if (!title.trim()) {
      toast.error("Dê um título à tarefa.");
      return;
    }

    const changes: Partial<Task> = {
      title,
      status,
      description: description || undefined,
      priority: priority || undefined,
      dueDate: toISODate(dueDate),
      category: category || undefined,
      checklist: checklist.length > 0 ? checklist : undefined,
      relations:
        productId || contactId || saleId
          ? { productId: productId || undefined, contactId: contactId || undefined, saleId: saleId || undefined }
          : undefined,
    };

    if (isEditing && task) {
      updateTask(task.id, changes);
      toast.success("Tarefa atualizada.");
    } else {
      const created = addTask({ title, status });
      updateTask(created.id, changes);
      toast.success("Tarefa criada.");
    }
    onDone();
  }

  return (
    <>
      <DrawerForm>
        <Field label="Título">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Trocar foto do produto" autoFocus />
        </Field>

        <CollapsibleSection defaultOpen={hasExtraFields} label="Adicionar detalhes">
          <Field label="Descrição" optional>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEFAULT_STATUS_COLUMNS.map((column) => (
                    <SelectItem key={column.id} value={column.id}>{column.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Prioridade" optional>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Sem prioridade" /></SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Prazo" optional>
            <DateInput value={dueDate} onValueChange={setDueDate} />
          </Field>

          <Field label="Categoria" optional>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Marketing" />
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-body font-medium text-foreground">Checklist</span>
            <ChecklistEditor items={checklist} onChange={setChecklist} />
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-body font-medium text-foreground">Relações</span>
            <Field label="Produto" optional>
              <Combobox
                options={products.map((p) => ({ value: p.id, label: p.name }))}
                value={productId}
                onValueChange={setProductId}
                placeholder="Nenhum"
              />
            </Field>
            <Field label="Venda" optional>
              <Combobox
                options={sales.map((s) => ({
                  value: s.id,
                  label: `${new Date(s.date + "T00:00:00").toLocaleDateString("pt-BR")} — ${products.find((p) => p.id === s.productId)?.name ?? "Produto"}`,
                }))}
                value={saleId}
                onValueChange={setSaleId}
                placeholder="Nenhuma"
              />
            </Field>
            <Field label="Contato" optional>
              <Combobox
                options={contacts.map((c) => ({ value: c.id, label: c.name }))}
                value={contactId}
                onValueChange={setContactId}
                placeholder="Nenhum"
              />
            </Field>
          </div>
        </CollapsibleSection>
      </DrawerForm>
      <DrawerFormActions
        onCancel={onDone}
        onSubmit={handleSubmit}
        submitLabel={isEditing ? "Salvar alterações" : "Criar tarefa"}
      />
    </>
  );
}
