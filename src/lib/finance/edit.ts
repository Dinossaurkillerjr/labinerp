import type { Transaction } from "./types";

/** Returns the keys whose values actually changed, ignoring bookkeeping fields. */
export function diffTransactionFields(
  previous: Transaction,
  changes: Partial<Transaction>
): string[] {
  const ignored = new Set(["updatedAt", "edited", "editHistory", "createdAt", "id"]);
  const changedFields: string[] = [];

  for (const key of Object.keys(changes) as (keyof Transaction)[]) {
    if (ignored.has(key)) continue;
    const before = previous[key];
    const after = changes[key];
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      changedFields.push(key);
    }
  }

  return changedFields;
}
