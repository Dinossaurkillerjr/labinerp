import { describe, expect, it } from "vitest";
import { resolvePeriodRange, previousPeriodRange, isWithinRange } from "./period-range";

const TODAY = "2026-09-15";

describe("resolvePeriodRange", () => {
  it('"mes" cobre do primeiro ao último dia do mês atual', () => {
    expect(resolvePeriodRange("mes", TODAY)).toMatchObject({ start: "2026-09-01", end: "2026-09-30" });
  });

  it('"ultimos30" cobre os 30 dias terminando hoje', () => {
    const range = resolvePeriodRange("ultimos30", TODAY);
    expect(range.end).toBe(TODAY);
    expect(range.start).toBe("2026-08-17");
  });

  it('"trimestre" começa no primeiro mês do trimestre corrente', () => {
    expect(resolvePeriodRange("trimestre", TODAY).start).toBe("2026-07-01");
  });

  it('"ano" começa em 1º de janeiro', () => {
    expect(resolvePeriodRange("ano", TODAY).start).toBe("2026-01-01");
  });

  it('"personalizado" usa as datas fornecidas', () => {
    const range = resolvePeriodRange("personalizado", TODAY, { start: "2026-01-01", end: "2026-01-15" });
    expect(range).toMatchObject({ start: "2026-01-01", end: "2026-01-15" });
  });
});

describe("previousPeriodRange", () => {
  it("retorna um período anterior de mesmo tamanho", () => {
    const current = { start: "2026-09-01", end: "2026-09-30", label: "" };
    const previous = previousPeriodRange(current);
    expect(previous.end).toBe("2026-08-31");
    expect(previous.start).toBe("2026-08-02");
  });
});

describe("isWithinRange", () => {
  it("inclui as bordas do período", () => {
    const range = resolvePeriodRange("mes", TODAY);
    expect(isWithinRange("2026-09-01", range)).toBe(true);
    expect(isWithinRange("2026-09-30", range)).toBe(true);
    expect(isWithinRange("2026-10-01", range)).toBe(false);
  });
});
