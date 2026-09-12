import type { Contact, CustomField } from "./types";

export type ContactsState = {
  contacts: Contact[];
};

export const EMPTY_CONTACTS_STATE: ContactsState = { contacts: [] };

export type ContactsAction =
  | { type: "HYDRATE"; state: ContactsState }
  | { type: "ADD_CONTACT"; contact: Contact }
  | { type: "UPDATE_CONTACT"; id: string; changes: Partial<Contact>; at: string }
  | { type: "DELETE_CONTACT"; id: string }
  | { type: "ADD_CUSTOM_FIELD"; contactId: string; field: CustomField; at: string }
  | { type: "REMOVE_CUSTOM_FIELD"; contactId: string; fieldId: string; at: string };

export function contactsReducer(state: ContactsState, action: ContactsAction): ContactsState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ADD_CONTACT":
      return { ...state, contacts: [...state.contacts, action.contact] };

    case "UPDATE_CONTACT":
      return {
        ...state,
        contacts: state.contacts.map((c) =>
          c.id === action.id ? { ...c, ...action.changes, updatedAt: action.at } : c
        ),
      };

    case "DELETE_CONTACT":
      return { ...state, contacts: state.contacts.filter((c) => c.id !== action.id) };

    case "ADD_CUSTOM_FIELD":
      return {
        ...state,
        contacts: state.contacts.map((c) =>
          c.id === action.contactId
            ? { ...c, customFields: [...c.customFields, action.field], updatedAt: action.at }
            : c
        ),
      };

    case "REMOVE_CUSTOM_FIELD":
      return {
        ...state,
        contacts: state.contacts.map((c) =>
          c.id === action.contactId
            ? {
                ...c,
                customFields: c.customFields.filter((f) => f.id !== action.fieldId),
                updatedAt: action.at,
              }
            : c
        ),
      };

    default:
      return state;
  }
}
