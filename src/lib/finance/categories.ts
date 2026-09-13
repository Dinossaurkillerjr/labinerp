import type { Category, TransactionType } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  // Receitas
  { id: "venda", label: "Venda", group: "receita" },
  { id: "outros_recebimentos", label: "Outros recebimentos", group: "receita" },

  // Custos (ligados ao produto vendido)
  { id: "produto_pod", label: "Produto POD", group: "custo" },
  { id: "estampa", label: "Estampa", group: "custo" },
  { id: "etiqueta", label: "Etiqueta", group: "custo" },
  { id: "embalagem", label: "Embalagem", group: "custo" },
  { id: "frete", label: "Frete", group: "custo" },
  { id: "taxas", label: "Taxas", group: "custo" },
  { id: "outros_custos", label: "Outros", group: "custo" },

  // Despesas operacionais
  { id: "software", label: "Software", group: "despesa" },
  { id: "plataforma", label: "Plataforma", group: "despesa" },
  { id: "marketing", label: "Marketing", group: "despesa" },
  { id: "contabilidade", label: "Contabilidade", group: "despesa" },
  { id: "servicos", label: "Serviços", group: "despesa" },
  { id: "equipamentos", label: "Equipamentos", group: "despesa" },
  { id: "outras_despesas", label: "Outros", group: "despesa" },

  // Capital do proprietário
  { id: "aporte", label: "Aporte", group: "capital" },
  { id: "retirada", label: "Retirada", group: "capital" },
];

export const CATEGORY_GROUP_LABELS: Record<Category["group"], string> = {
  receita: "Receitas",
  custo: "Custos",
  despesa: "Despesas",
  capital: "Capital",
};

/** Category groups a given transaction type may use. */
export const GROUPS_BY_TYPE = {
  income: ["receita"],
  expense: ["custo", "despesa"],
  owner_contribution: ["capital"],
  owner_withdrawal: ["capital"],
} as const;

export const PAYMENT_SOURCE_LABELS: Record<string, string> = {
  conta_pessoal: "Conta pessoal",
  conta_marca: "Conta da marca",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  outro: "Outro",
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  income: "Receita",
  expense: "Despesa",
  owner_contribution: "Aporte",
  owner_withdrawal: "Retirada",
};

/**
 * Aporte/Retirada each have exactly one possible category ("aporte"/"retirada"),
 * so the type alone already determines it — asking the user to also pick a
 * category from a one-item list would just be the same choice twice. Callers
 * use this to auto-set the category and hide the category picker for these types.
 */
export function capitalCategoryFor(type: TransactionType): string | null {
  if (type === "owner_contribution") return "aporte";
  if (type === "owner_withdrawal") return "retirada";
  return null;
}
