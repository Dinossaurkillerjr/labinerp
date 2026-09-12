import { describe, expect, it } from "vitest";
import { contactsReducer, EMPTY_CONTACTS_STATE } from "./contacts-reducer";
import type { Contact } from "./types";

function makeContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: "ct1",
    name: "Ana Beatriz Souza",
    status: "lead",
    customFields: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("contactsReducer", () => {
  it("ADD_CONTACT cria um contato só com nome (cadastro progressivo)", () => {
    const state = contactsReducer(EMPTY_CONTACTS_STATE, { type: "ADD_CONTACT", contact: makeContact({ whatsapp: undefined }) });
    expect(state.contacts).toHaveLength(1);
    expect(state.contacts[0].whatsapp).toBeUndefined();
  });

  it("ADD_CUSTOM_FIELD adiciona campos personalizados sem afetar os campos fixos", () => {
    let state = contactsReducer(EMPTY_CONTACTS_STATE, { type: "ADD_CONTACT", contact: makeContact() });
    state = contactsReducer(state, {
      type: "ADD_CUSTOM_FIELD",
      contactId: "ct1",
      field: { id: "f1", label: "Como conheceu", value: "Instagram" },
      at: "2026-01-02T00:00:00.000Z",
    });

    expect(state.contacts[0].customFields).toEqual([{ id: "f1", label: "Como conheceu", value: "Instagram" }]);
    expect(state.contacts[0].name).toBe("Ana Beatriz Souza");
  });

  it("REMOVE_CUSTOM_FIELD remove apenas o campo indicado", () => {
    let state = contactsReducer(EMPTY_CONTACTS_STATE, {
      type: "ADD_CONTACT",
      contact: makeContact({
        customFields: [
          { id: "f1", label: "Tamanho", value: "M" },
          { id: "f2", label: "Interesses", value: "Streetwear" },
        ],
      }),
    });

    state = contactsReducer(state, {
      type: "REMOVE_CUSTOM_FIELD",
      contactId: "ct1",
      fieldId: "f1",
      at: "2026-01-02T00:00:00.000Z",
    });

    expect(state.contacts[0].customFields).toEqual([{ id: "f2", label: "Interesses", value: "Streetwear" }]);
  });

  it("UPDATE_CONTACT altera o status do contato", () => {
    let state = contactsReducer(EMPTY_CONTACTS_STATE, { type: "ADD_CONTACT", contact: makeContact() });
    state = contactsReducer(state, {
      type: "UPDATE_CONTACT",
      id: "ct1",
      changes: { status: "cliente" },
      at: "2026-01-02T00:00:00.000Z",
    });
    expect(state.contacts[0].status).toBe("cliente");
  });

  it("HYDRATE substitui o estado inteiro com os dados persistidos", () => {
    const persisted = { contacts: [makeContact({ id: "persisted-1" })] };
    const state = contactsReducer(EMPTY_CONTACTS_STATE, { type: "HYDRATE", state: persisted });
    expect(state.contacts).toHaveLength(1);
    expect(state.contacts[0].id).toBe("persisted-1");
  });
});
