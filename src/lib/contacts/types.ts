// Domain types for the Contatos module (Phase 3, evolved into a light CRM in
// Fase 5.5 — see lib/contacts/pipeline.ts).

import type { EntityTag } from "@/lib/tags";

/**
 * Legacy classification, kept only so code that already reads it (contacts
 * report counts, seed data) keeps working. New code should think in terms of
 * the pipeline stage (see pipeline.ts) — `status` is now derived from it.
 */
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
  /** Pipeline stage id (see lib/contacts/pipeline.ts). Falls back to a status-based mapping when absent. */
  stageId?: string;
  tags?: EntityTag[];
  whatsapp?: string;
  instagram?: string;
  email?: string;
  customFields: CustomField[];
  createdAt: string;
  updatedAt: string;
};
