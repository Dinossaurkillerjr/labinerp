import type { Contact } from "./types";

const now = new Date().toISOString();

export const SEED_CONTACTS: Contact[] = [
  {
    id: "seed-contact-1",
    name: "Ana Beatriz Souza",
    status: "recorrente",
    whatsapp: "+55 11 91234-5678",
    instagram: "@anabeatriz",
    customFields: [{ id: "cf-1", label: "Tamanho", value: "M" }],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-contact-2",
    name: "Carlos Mendes",
    status: "cliente",
    instagram: "@carlosmendes",
    customFields: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-contact-3",
    name: "Juliana Prado",
    status: "cliente",
    whatsapp: "+55 21 99876-5432",
    customFields: [{ id: "cf-2", label: "Como conheceu", value: "Indicação" }],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-contact-4",
    name: "Rafael Lima",
    status: "lead",
    customFields: [],
    createdAt: now,
    updatedAt: now,
  },
];
