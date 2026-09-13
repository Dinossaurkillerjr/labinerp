"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Field } from "@/components/common/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CollapsibleSection } from "@/components/common/collapsible-section";
import { DrawerForm, DrawerFormActions } from "@/components/common/drawer-form";
import { TagsEditor } from "@/components/common/tags-editor";
import { useContacts } from "@/lib/contacts/contacts-provider";
import { useSettings } from "@/lib/settings/settings-provider";
import { resolveStageId, deriveStatusFromStage } from "@/lib/contacts/pipeline";
import type { EntityTag } from "@/lib/tags";
import type { Contact, CustomField } from "@/lib/contacts/types";

const TAG_SUGGESTIONS = ["VIP", "Potencial", "Recorrente", "Influenciador", "Loja", "Atacado"];

let localCounter = 0;
function tempId() {
  localCounter += 1;
  return `cf-tmp-${Date.now()}-${localCounter}`;
}

export function ContactForm({ contact, onDone, onCreated }: { contact?: Contact; onDone: () => void; onCreated?: (contact: Contact) => void }) {
  const { addContact, updateContact } = useContacts();
  const { settings } = useSettings();
  const isEditing = Boolean(contact);
  const stages = settings.pipelineStages;

  const [name, setName] = React.useState(contact?.name ?? "");
  const [whatsapp, setWhatsapp] = React.useState(contact?.whatsapp ?? "");
  const [stageId, setStageId] = React.useState(contact ? resolveStageId(contact, stages) : stages[0]?.id ?? "");
  const [instagram, setInstagram] = React.useState(contact?.instagram ?? "");
  const [email, setEmail] = React.useState(contact?.email ?? "");
  const [tags, setTags] = React.useState<EntityTag[]>(contact?.tags ?? []);
  const [customFields, setCustomFields] = React.useState<CustomField[]>(contact?.customFields ?? []);
  const [newFieldLabel, setNewFieldLabel] = React.useState("");
  const [newFieldValue, setNewFieldValue] = React.useState("");

  const hasExtraFields = Boolean(contact?.instagram || contact?.email || contact?.customFields.length);

  function addCustomField() {
    if (!newFieldLabel.trim()) {
      toast.error("Dê um nome ao campo personalizado.");
      return;
    }
    setCustomFields((prev) => [...prev, { id: tempId(), label: newFieldLabel, value: newFieldValue }]);
    setNewFieldLabel("");
    setNewFieldValue("");
  }

  function removeCustomField(id: string) {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Dê um nome ao contato.");
      return;
    }

    const changes: Partial<Contact> = {
      name,
      stageId,
      status: deriveStatusFromStage(stageId),
      whatsapp: whatsapp || undefined,
      instagram: instagram || undefined,
      email: email || undefined,
      tags: tags.length > 0 ? tags : undefined,
      customFields,
    };

    if (isEditing && contact) {
      updateContact(contact.id, changes);
      toast.success("Contato atualizado.");
      onDone();
    } else {
      const created = addContact({ name, status: changes.status, whatsapp: changes.whatsapp });
      updateContact(created.id, changes);
      toast.success("Contato criado.");
      onCreated?.({ ...created, ...changes });
      onDone();
    }
  }

  return (
    <>
      <DrawerForm>
        <Field label="Nome">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" autoFocus />
        </Field>
        <Field label="WhatsApp" optional>
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+55 11 90000-0000" />
        </Field>
        <Field label="Estágio" hint="Em que ponto da relação comercial esse contato está?">
          <Select value={stageId} onValueChange={setStageId}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-body font-medium text-foreground">Tags</span>
          <TagsEditor tags={tags} onChange={setTags} suggestions={TAG_SUGGESTIONS} />
        </div>

        <CollapsibleSection defaultOpen={hasExtraFields}>
          <Field label="Instagram" optional>
            <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" />
          </Field>
          <Field label="E-mail" optional>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-body font-medium text-foreground">Campos personalizados</span>
            {customFields.map((field) => (
              <div key={field.id} className="flex items-center justify-between rounded-lg bg-paper-mist px-3 py-2">
                <span className="text-body text-foreground">
                  <span className="text-muted-foreground">{field.label}:</span> {field.value}
                </span>
                <button onClick={() => removeCustomField(field.id)} aria-label="Remover campo" type="button">
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
            <div className="flex items-end gap-2">
              <Input
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="Ex: Tamanho, Como conheceu..."
                className="flex-1"
              />
              <Input
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                placeholder="Valor"
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={addCustomField} type="button" aria-label="Adicionar campo">
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </CollapsibleSection>
      </DrawerForm>
      <DrawerFormActions
        onCancel={onDone}
        onSubmit={handleSubmit}
        submitLabel={isEditing ? "Salvar alterações" : "Criar contato"}
      />
    </>
  );
}
