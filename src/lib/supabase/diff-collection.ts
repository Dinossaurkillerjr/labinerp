/**
 * Every domain reducer in this app updates arrays immutably (unchanged items
 * keep the exact same object reference; changed/added items are new
 * objects) — see any *-reducer.ts. That convention makes a correct diff
 * between two states cheap: reference inequality means "changed", not a
 * deep comparison. This is what lets each Supabase-backed provider persist
 * only what actually changed, without inspecting which action produced it.
 */
/** General form for entities whose identity isn't the `id` field (e.g. ProfitAllocation's monthId, CategoryBudget's categoryId). */
export function diffByKey<T>(
  getKey: (item: T) => string,
  previous: T[],
  next: T[]
): { inserted: T[]; updated: T[]; deletedIds: string[] } {
  const previousByKey = new Map(previous.map((item) => [getKey(item), item]));
  const nextKeys = new Set<string>();

  const inserted: T[] = [];
  const updated: T[] = [];

  for (const item of next) {
    const key = getKey(item);
    nextKeys.add(key);
    const before = previousByKey.get(key);
    if (!before) inserted.push(item);
    else if (before !== item) updated.push(item);
  }

  const deletedIds = previous.filter((item) => !nextKeys.has(getKey(item))).map(getKey);

  return { inserted, updated, deletedIds };
}

export function diffById<T extends { id: string }>(
  previous: T[],
  next: T[]
): { inserted: T[]; updated: T[]; deletedIds: string[] } {
  return diffByKey((item) => item.id, previous, next);
}
