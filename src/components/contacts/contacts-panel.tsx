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
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { StatusBadge, type Status } from "@/components/common/status-badge";
import { useContacts } from "@/lib/contacts/contacts-provider";
import { useUI } from "@/components/providers/ui-provider";
import { ContactForm } from "@/components/contacts/contact-form";
import { ContactDetail } from "@/components/contacts/contact-detail";
import type { Contact, ContactStatus } from "@/lib/contacts/types";

const STATUS_MAP: Record<ContactStatus, Status> = {
  lead: "rascunho",
  cliente: "concluido",
  recorrente: "concluido",
  inativo: "cancelado",
};

const STATUS_LABELS: Record<ContactStatus, string> = {
  lead: "Lead",
  cliente: "Cliente",
  recorrente: "Recorrente",
  inativo: "Inativo",
};

export function ContactsPanel() {
  const { contacts, deleteContact } = useContacts();
  const { openDrawer, closeDrawer } = useUI();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ContactStatus | "todos">("todos");

  const filtered = contacts
    .filter((c) => (statusFilter === "todos" ? true : c.status === statusFilter))
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
    deleteContact(contact.id);
    toast.success("Contato excluído.");
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
    { key: "status", header: "Status", render: (row) => <StatusBadge status={STATUS_MAP[row.status]} /> },
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
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar contato..." className="pl-8" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="ml-auto" onClick={openCreate}>
          <Plus className="size-4" />
          Novo contato
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="Nenhum contato cadastrado"
        emptyDescription="Crie seu primeiro contato — nome e WhatsApp já bastam para começar."
      />
    </div>
  );
}
