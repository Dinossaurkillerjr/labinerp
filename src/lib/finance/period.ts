const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Returns the current month as "yyyy-MM". */
export function currentMonthId(): string {
  return new Date().toISOString().slice(0, 7);
}

/** "2026-09" -> "Setembro de 2026" */
export function formatMonthLabel(monthId: string): string {
  const [year, month] = monthId.split("-").map(Number);
  return `${MONTH_LABELS[month - 1]} de ${year}`;
}

/** First and last ISO date (yyyy-MM-dd) of a "yyyy-MM" month id. */
export function monthBounds(monthId: string): { start: string; end: string } {
  const [year, month] = monthId.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    start: `${monthId}-01`,
    end: `${monthId}-${String(lastDay).padStart(2, "0")}`,
  };
}

/** Generates the last `count` month ids ending at the current month, most recent first. */
export function recentMonthIds(count: number): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(now.getFullYear(), now.getMonth() - i, 1));
    return date.toISOString().slice(0, 7);
  });
}
