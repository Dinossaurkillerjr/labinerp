"use client";

import * as React from "react";
import type { Contact, ContactStatus } from "./types";
import { contactsReducer, EMPTY_CONTACTS_STATE, type ContactsAction, type ContactsState } from "./contacts-reducer";
import { useSupabaseReducer } from "@/lib/supabase/use-supabase-reducer";
import { diffById } from "@/lib/supabase/diff-collection";
import { deleteContacts, fetchContacts, upsertContacts } from "./repository";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

async function fetchInitial(userId: string): Promise<ContactsState> {
  return { contacts: await fetchContacts(userId) };
}

async function sync(userId: string, previous: ContactsState, next: ContactsState): Promise<void> {
  const { inserted, updated, deletedIds } = diffById(previous.contacts, next.contacts);
  await Promise.all([upsertContacts(userId, [...inserted, ...updated]), deleteContacts(userId, deletedIds)]);
}

export type NewContactInput = {
  name: string;
  status?: ContactStatus;
  whatsapp?: string;
};

type ContactsContextValue = {
  contacts: Contact[];
  addContact: (input: NewContactInput) => Contact;
  updateContact: (id: string, changes: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addCustomField: (contactId: string, label: string, value: string) => void;
  removeCustomField: (contactId: string, fieldId: string) => void;
  getContact: (id: string) => Contact | undefined;
};

const ContactsContext = React.createContext<ContactsContextValue | null>(null);

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useSupabaseReducer<ContactsState, ContactsAction>(
    contactsReducer,
    EMPTY_CONTACTS_STATE,
    (hydratedState) => ({ type: "HYDRATE" as const, state: hydratedState }),
    fetchInitial,
    sync
  );

  const value = React.useMemo<ContactsContextValue>(() => {
    function addContact(input: NewContactInput): Contact {
      const timestamp = nowISO();
      const contact: Contact = {
        id: makeId(),
        name: input.name,
        status: input.status ?? "lead",
        whatsapp: input.whatsapp,
        customFields: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      dispatch({ type: "ADD_CONTACT", contact });
      return contact;
    }

    function updateContact(id: string, changes: Partial<Contact>) {
      dispatch({ type: "UPDATE_CONTACT", id, changes, at: nowISO() });
    }

    function deleteContact(id: string) {
      dispatch({ type: "DELETE_CONTACT", id });
    }

    function addCustomField(contactId: string, label: string, value: string) {
      dispatch({ type: "ADD_CUSTOM_FIELD", contactId, field: { id: makeId(), label, value }, at: nowISO() });
    }

    function removeCustomField(contactId: string, fieldId: string) {
      dispatch({ type: "REMOVE_CUSTOM_FIELD", contactId, fieldId, at: nowISO() });
    }

    function getContact(id: string) {
      return state.contacts.find((c) => c.id === id);
    }

    return {
      contacts: state.contacts,
      addContact,
      updateContact,
      deleteContact,
      addCustomField,
      removeCustomField,
      getContact,
    };
  }, [state, dispatch]);

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
}

export function useContacts() {
  const ctx = React.useContext(ContactsContext);
  if (!ctx) throw new Error("useContacts must be used within a ContactsProvider");
  return ctx;
}
