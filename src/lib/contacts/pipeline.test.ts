import { describe, expect, it } from "vitest";
import { resolveStageId, deriveStatusFromStage, DEFAULT_PIPELINE_STAGES } from "./pipeline";
import type { Contact } from "./types";

function makeContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: "c1",
    name: "Contato",
    status: "lead",
    customFields: [],
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("resolveStageId", () => {
  it("usa o stageId quando presente e válido", () => {
    const contact = makeContact({ stageId: "proposta" });
    expect(resolveStageId(contact, DEFAULT_PIPELINE_STAGES)).toBe("proposta");
  });

  it("mapeia contatos antigos (sem stageId) a partir do status legado", () => {
    expect(resolveStageId(makeContact({ status: "lead" }), DEFAULT_PIPELINE_STAGES)).toBe("novo");
    expect(resolveStageId(makeContact({ status: "cliente" }), DEFAULT_PIPELINE_STAGES)).toBe("cliente");
    expect(resolveStageId(makeContact({ status: "recorrente" }), DEFAULT_PIPELINE_STAGES)).toBe("cliente");
    expect(resolveStageId(makeContact({ status: "inativo" }), DEFAULT_PIPELINE_STAGES)).toBe("perdido");
  });

  it("cai no primeiro estágio se o stageId salvo não existir mais (estágio removido)", () => {
    const contact = makeContact({ stageId: "estagio-removido" });
    expect(resolveStageId(contact, DEFAULT_PIPELINE_STAGES)).toBe(DEFAULT_PIPELINE_STAGES[0].id);
  });
});

describe("deriveStatusFromStage", () => {
  it("mantém compatibilidade com os relatórios existentes (clientes/inativos)", () => {
    expect(deriveStatusFromStage("cliente")).toBe("cliente");
    expect(deriveStatusFromStage("perdido")).toBe("inativo");
    expect(deriveStatusFromStage("conversando")).toBe("lead");
  });
});
