"use client";

import * as React from "react";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { Tag } from "@/components/common/tag";
import { useContacts } from "@/lib/contacts/contacts-provider";
import { useSettings } from "@/lib/settings/settings-provider";
import { useUI } from "@/components/providers/ui-provider";
import { ContactForm } from "@/components/contacts/contact-form";
import { ContactDetail } from "@/components/contacts/contact-detail";
import { ContactsKanban } from "@/components/contacts/contacts-kanban";
import { resolveStageId } from "@/lib/contacts/pipeline";
import type { Contact } from "@/lib/contacts/types";

export function ContactsPanel() {
  const { contacts, deleteContact } = useContacts();
  const { settings } = useSettings();
  const { openDrawer, closeDrawer, confirm } = useUI();
  const [view, setView] = React.useState<"lista" | "pipeline">("lista");
  const [search, setSearch] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState<string>("todos");
  const stages = settings.pipelineStages;
  const stageLabel = new Map(stages.map((s) => [s.id, s.label]));

  const filtered = contacts
    .filter((c) => (stageFilter === "todos" ? true : resolveStageId(c, stages) === stageFilter))
    .filter((c) => (search.trim() ? c.name.toLowerCase().includes(search.trim().toLowerCase()) : true));

  function openCreate() {
    openDrawer({
      title: "Novo contato",
      description: "Comece com o nome — você pode detalhar depois.",
      content: <ContactForm onDone={closeDrawer} />,
    });
  }

  function openEdit(contact: Contact) {
    openDrawer({ title: "Editar contato", content: <ContactForm contact={contact} onDone={closeDrawer} /> });
  }

  function openDetail(contact: Contact) {
    openDrawer({
      title: contact.name,
      description: "Histórico e informações do contato.",
      content: <ContactDetail contact={contact} />,
    });
  }

  function handleDelete(contact: Contact) {
    confirm({
      title: "Excluir contato?",
      description: `"${contact.name}" será removido. O histórico de vendas já registrado é mantido, mas perde o vínculo com este contato.`,
      onConfirm: () => {
        deleteContact(contact.id);
        toast.success("Contato excluído.");
      },
    });
  }

  const columns: DataTableColumn<Contact>[] = [
    {
      key: "name",
      header: "Nome",
      render: (row) => (
        <button className="text-left text-foreground hover:underline" onClick={() => openDetail(row)}>
          {row.name}
        </button>
      ),
    },
    { key: "whatsapp", header: "WhatsApp", render: (row) => row.whatsapp ?? "—" },
    { key: "instagram", header: "Instagram", render: (row) => row.instagram ?? "—" },
    { key: "stage", header: "Estágio", render: (row) => <Tag color="blue">{stageLabel.get(resolveStageId(row, stages)) ?? "—"}</Tag> },
    {
      key: "tags",
      header: "Tags",
      render: (row) =>
        row.tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {row.tags.map((tag) => <Tag key={tag.id} color={tag.color}>{tag.label}</Tag>)}
          </div>
        ) : (
          "—"
        ),
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
            <DropdownMenuItem onSelect={() => openDetail(row)}>
              <Eye /> Ver histórico
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openEdit(row)}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(row)}>
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar contato..." className="pl-8" />
        </div>
        {view === "lista" ? (
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estágios</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button className="ml-auto" onClick={openCreate}>
          <Plus className="size-4" />
          Novo contato
        </Button>
      </div>

      {view === "lista" ? (
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="Nenhum contato cadastrado"
          emptyDescription="Crie seu primeiro contato — nome e WhatsApp já bastam para começar."
          emptyAction={
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Adicionar contato
            </Button>
          }
        />
      ) : (
        <ContactsKanban contacts={filtered} />
      )}
    </div>
  );
}
