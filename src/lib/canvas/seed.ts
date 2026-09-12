import type { CanvasElement } from "./types";

const now = new Date().toISOString();

export const SEED_ELEMENTS: CanvasElement[] = [
  {
    id: "seed-text-1",
    type: "text",
    x: 80,
    y: 80,
    width: 320,
    height: 60,
    zIndex: 1,
    content: "Referências para a coleção de verão",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-sticky-1",
    type: "sticky",
    x: 80,
    y: 180,
    width: 200,
    height: 160,
    zIndex: 2,
    content: "Testar tecido linho na próxima produção",
    color: "#fef3c7",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-link-1",
    type: "link",
    x: 320,
    y: 180,
    width: 260,
    height: 72,
    zIndex: 3,
    url: "https://www.pinterest.com/",
    title: "Moodboard de inspiração",
    createdAt: now,
    updatedAt: now,
  },
];
