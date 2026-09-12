"use client";

import * as React from "react";
import type { Contact, ContactStatus } from "./types";
import { contactsReducer, type ContactsAction, type ContactsState } from "./contacts-reducer";
import { SEED_CONTACTS } from "./seed";
import { usePersistentReducer } from "@/lib/persistent-reducer";

const STORAGE_KEY = "erp-contacts-v1";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function seededState(): ContactsState {
  return { contacts: SEED_CONTACTS };
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
  const [state, dispatch] = usePersistentReducer<ContactsState, ContactsAction>(
    contactsReducer,
    seededState,
    STORAGE_KEY,
    (hydratedState) => ({ type: "HYDRATE" as const, state: hydratedState })
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
