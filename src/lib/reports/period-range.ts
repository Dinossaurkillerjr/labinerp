// Shared period-range resolution for Dashboard and Relatórios — pure, so both
// screens compute "this month" / "last 30 days" / etc. exactly the same way.

export type PeriodPreset = "mes" | "ultimos30" | "trimestre" | "ano" | "personalizado";

export type PeriodRange = {
  start: string; // ISO yyyy-MM-dd, inclusive
  end: string; // ISO yyyy-MM-dd, inclusive
  label: string;
};

function addDaysISO(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function startOfMonthISO(isoDate: string): string {
  return `${isoDate.slice(0, 7)}-01`;
}

function endOfMonthISO(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${isoDate.slice(0, 7)}-${String(lastDay).padStart(2, "0")}`;
}

function startOfQuarterISO(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
  return `${year}-${String(quarterStartMonth).padStart(2, "0")}-01`;
}

/** Resolves a preset (relative to `todayISO`) into a concrete [start, end] range. */
export function resolvePeriodRange(
  preset: PeriodPreset,
  todayISO: string,
  custom?: { start: string; end: string }
): PeriodRange {
  switch (preset) {
    case "mes":
      return { start: startOfMonthISO(todayISO), end: endOfMonthISO(todayISO), label: "Este mês" };
    case "ultimos30":
      return { start: addDaysISO(todayISO, -29), end: todayISO, label: "Últimos 30 dias" };
    case "trimestre":
      return { start: startOfQuarterISO(todayISO), end: todayISO, label: "Este trimestre" };
    case "ano":
      return { start: `${todayISO.slice(0, 4)}-01-01`, end: todayISO, label: "Este ano" };
    case "personalizado":
      return { start: custom?.start ?? todayISO, end: custom?.end ?? todayISO, label: "Período personalizado" };
  }
}

/** The same-length period immediately preceding `range`, for comparisons. */
export function previousPeriodRange(range: PeriodRange): PeriodRange {
  const days = Math.round((toDayNumber(range.end) - toDayNumber(range.start)) / 86400000) + 1;
  const end = addDaysISO(range.start, -1);
  const start = addDaysISO(end, -(days - 1));
  return { start, end, label: "Período anterior" };
}

function toDayNumber(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function isWithinRange(dateISO: string, range: PeriodRange): boolean {
  return dateISO >= range.start && dateISO <= range.end;
}

/** Percent change from `previous` to `current`, or undefined when there's no
 *  baseline to compare against ("quando houver dados suficientes"). Shared by
 *  every screen that shows a variação vs. período anterior, so the definition
 *  of "trend" never drifts between Dashboard, Relatórios and Financeiro. */
export function percentChange(current: number, previous: number): number | undefined {
  if (previous <= 0) return undefined;
  return ((current - previous) / previous) * 100;
}
