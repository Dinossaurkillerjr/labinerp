import { describe, expect, it } from "vitest";
import { monthIdsUpTo } from "./period";

describe("monthIdsUpTo", () => {
  it("gera os últimos N meses terminando no mês informado (inclusive), do mais antigo para o mais recente", () => {
    expect(monthIdsUpTo("2026-09", 3)).toEqual(["2026-07", "2026-08", "2026-09"]);
  });

  it("atravessa a virada de ano corretamente", () => {
    expect(monthIdsUpTo("2026-02", 3)).toEqual(["2025-12", "2026-01", "2026-02"]);
  });

  it("com count 1, retorna só o próprio mês", () => {
    expect(monthIdsUpTo("2026-09", 1)).toEqual(["2026-09"]);
  });
});
