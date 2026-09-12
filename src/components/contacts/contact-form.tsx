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
import { useContacts } from "@/lib/contacts/contacts-provider";
import type { Contact, ContactStatus, CustomField } from "@/lib/contacts/types";

const STATUS_OPTIONS: { value: ContactStatus; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "cliente", label: "Cliente" },
  { value: "recorrente", label: "Recorrente" },
  { value: "inativo", label: "Inativo" },
];

let localCounter = 0;
function tempId() {
  localCounter += 1;
  return `cf-tmp-${Date.now()}-${localCounter}`;
}

export function ContactForm({ contact, onDone }: { contact?: Contact; onDone: () => void }) {
  const { addContact, updateContact } = useContacts();
  const isEditing = Boolean(contact);

  const [name, setName] = React.useState(contact?.name ?? "");
  const [whatsapp, setWhatsapp] = React.useState(contact?.whatsapp ?? "");
  const [status, setStatus] = React.useState<ContactStatus>(contact?.status ?? "lead");
  const [instagram, setInstagram] = React.useState(contact?.instagram ?? "");
  const [email, setEmail] = React.useState(contact?.email ?? "");
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
      status,
      whatsapp: whatsapp || undefined,
      instagram: instagram || undefined,
      email: email || undefined,
      customFields,
    };

    if (isEditing && contact) {
      updateContact(contact.id, changes);
      toast.success("Contato atualizado.");
    } else {
      const created = addContact({ name, status, whatsapp: changes.whatsapp });
      updateContact(created.id, changes);
      toast.success("Contato criado.");
    }
    onDone();
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
        <Field label="Status">
          <Select value={status} onValueChange={(value) => setStatus(value as ContactStatus)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

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
