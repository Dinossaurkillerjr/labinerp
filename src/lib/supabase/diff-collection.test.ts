import { describe, expect, it } from "vitest";
import { diffById, diffByKey } from "./diff-collection";

describe("diffById", () => {
  it("detecta itens inseridos, atualizados (por referência) e removidos", () => {
    const a = { id: "1", name: "A" };
    const b = { id: "2", name: "B" };
    const previous = [a, b];

    const bChanged = { id: "2", name: "B2" }; // nova referência = "mudou"
    const c = { id: "3", name: "C" }; // novo id = inserido
    const next = [a, bChanged, c]; // "a" é a MESMA referência = não mudou; "b" some

    const { inserted, updated, deletedIds } = diffById(previous, next);
    expect(inserted).toEqual([c]);
    expect(updated).toEqual([bChanged]);
    expect(deletedIds).toEqual([]);
  });

  it("detecta remoção quando um id do estado anterior não existe mais", () => {
    const a = { id: "1", name: "A" };
    const b = { id: "2", name: "B" };
    const { inserted, updated, deletedIds } = diffById([a, b], [a]);
    expect(inserted).toEqual([]);
    expect(updated).toEqual([]);
    expect(deletedIds).toEqual(["2"]);
  });

  it("itens idênticos por referência não geram nem insert nem update", () => {
    const a = { id: "1", name: "A" };
    const { inserted, updated, deletedIds } = diffById([a], [a]);
    expect(inserted).toEqual([]);
    expect(updated).toEqual([]);
    expect(deletedIds).toEqual([]);
  });
});

describe("diffByKey", () => {
  it("usa uma chave de negócio em vez de `id` (ex: monthId de ProfitAllocation)", () => {
    const sep = { monthId: "2026-09", reinvestimento: 100 };
    const { inserted } = diffByKey((a) => a.monthId, [], [sep]);
    expect(inserted).toEqual([sep]);
  });
});
