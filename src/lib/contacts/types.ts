// Domain types for the Contatos module (Phase 3).

export type ContactStatus = "lead" | "cliente" | "recorrente" | "inativo";

export type CustomField = {
  id: string;
  label: string;
  value: string;
};

export type Contact = {
  id: string;
  name: string;
  status: ContactStatus;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  customFields: CustomField[];
  createdAt: string;
  updatedAt: string;
};
