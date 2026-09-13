"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/common/tag";
import { KanbanBoard } from "@/components/common/kanban-board";
import { useContacts } from "@/lib/contacts/contacts-provider";
import { useSettings } from "@/lib/settings/settings-provider";
import { useUI } from "@/components/providers/ui-provider";
import { resolveStageId, deriveStatusFromStage } from "@/lib/contacts/pipeline";
import { ContactForm } from "@/components/contacts/contact-form";
import type { Contact } from "@/lib/contacts/types";

function ContactCardContent({ contact }: { contact: Contact }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-body text-foreground">{contact.name}</span>
      {contact.whatsapp || contact.instagram ? (
        <span className="text-caption text-muted-foreground">{contact.whatsapp ?? contact.instagram}</span>
      ) : null}
      {contact.tags?.length ? (
        <div className="flex flex-wrap gap-1">
          {contact.tags.map((tag) => (
            <Tag key={tag.id} color={tag.color}>{tag.label}</Tag>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ContactsKanban({ contacts }: { contacts: Contact[] }) {
  const { updateContact } = useContacts();
  const { settings } = useSettings();
  const { openDrawer, closeDrawer } = useUI();
  const stages = settings.pipelineStages;

  function openDetail(contact: Contact) {
    openDrawer({ title: "Editar contato", content: <ContactForm contact={contact} onDone={closeDrawer} /> });
  }

  function openNewContact(stageId: string) {
    openDrawer({
      title: "Novo contato",
      description: "Comece com o nome — você pode detalhar depois.",
      content: <ContactForm onDone={closeDrawer} onCreated={(created) => updateContact(created.id, { stageId, status: deriveStatusFromStage(stageId) })} />,
    });
  }

  return (
    <KanbanBoard
      columns={stages}
      items={contacts}
      getColumnId={(contact) => resolveStageId(contact, stages)}
      onMove={(contactId, stageId) => updateContact(contactId, { stageId, status: deriveStatusFromStage(stageId) })}
      onOpenItem={openDetail}
      onAddToColumn={openNewContact}
      renderCard={(contact) => <ContactCardContent contact={contact} />}
      emptyTitle="Nenhum contato na pipeline"
      emptyDescription="Crie o primeiro contato para começar a organizar sua relação comercial."
      emptyAction={
        <Button onClick={() => openNewContact(stages[0]?.id)}>
          <Plus className="size-4" />
          Novo contato
        </Button>
      }
    />
  );
}
