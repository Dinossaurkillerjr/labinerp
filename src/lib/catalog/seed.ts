import type { Product } from "./types";

const now = new Date().toISOString();

export const SEED_PRODUCTS: Product[] = [
  {
    id: "seed-product-1",
    name: "Camiseta Oversized Preta",
    status: "ativo",
    price: 12900,
    costComponents: [
      { id: "spc-1", category: "produto_pod", amount: 4500 },
      { id: "spc-2", category: "etiqueta", amount: 300 },
      { id: "spc-3", category: "embalagem", amount: 400 },
      { id: "spc-4", category: "frete", amount: 1200 },
      { id: "spc-5", category: "taxas", amount: 600 },
    ],
    category: "Camisetas",
    collection: "Inverno 2026",
    sku: "CAM-OV-PT",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-product-2",
    name: "Moletom Canguru Cinza",
    status: "ativo",
    price: 24900,
    costComponents: [
      { id: "spc-6", category: "produto_pod", amount: 11000 },
      { id: "spc-7", category: "etiqueta", amount: 300 },
      { id: "spc-8", category: "embalagem", amount: 500 },
      { id: "spc-9", category: "frete", amount: 1500 },
    ],
    category: "Moletons",
    collection: "Inverno 2026",
    sku: "MOL-CG-CZ",
    sizes: ["M", "G"],
    colors: ["Cinza"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-product-3",
    name: "Boné Aba Curva Logo",
    status: "rascunho",
    costComponents: [],
    createdAt: now,
    updatedAt: now,
  },
];
