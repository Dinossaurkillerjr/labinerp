import type { Contact, ContactStatus } from "./types";

export type PipelineStage = {
  id: string;
  label: string;
};

// Initial values only — the user can rename/add/remove stages in Configurações
// (see lib/settings). "Em que ponto da relação comercial esse contato está?"
export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: "novo", label: "Novo contato" },
  { id: "primeiro_contato", label: "Primeiro contato" },
  { id: "conversando", label: "Conversando" },
  { id: "interesse", label: "Interesse" },
  { id: "proposta", label: "Proposta" },
  { id: "negociacao", label: "Negociação" },
  { id: "cliente", label: "Cliente" },
  { id: "perdido", label: "Perdido" },
];

/**
 * Contacts created before the pipeline existed only have `status`. This maps
 * that legacy value to a sensible stage so they show up correctly in the
 * Kanban without needing a data migration.
 */
function mapStatusToStageId(status: ContactStatus): string {
  switch (status) {
    case "cliente":
    case "recorrente":
      return "cliente";
    case "inativo":
      return "perdido";
    case "lead":
    default:
      return "novo";
  }
}

/** The contact's current stage id, falling back to a legacy-status mapping. */
export function resolveStageId(contact: Contact, stages: PipelineStage[]): string {
  if (contact.stageId && stages.some((s) => s.id === contact.stageId)) return contact.stageId;
  const mapped = mapStatusToStageId(contact.status);
  return stages.some((s) => s.id === mapped) ? mapped : stages[0]?.id ?? mapped;
}

/**
 * Keeps the legacy `status` field coherent whenever the stage changes, so
 * anything still reading `status` (e.g. the Contatos report's clientes/
 * inativos counts) keeps working without knowing about stages at all.
 */
export function deriveStatusFromStage(stageId: string): ContactStatus {
  if (stageId === "cliente") return "cliente";
  if (stageId === "perdido") return "inativo";
  return "lead";
}
