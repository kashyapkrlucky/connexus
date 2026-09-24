/**
 * Appends a freshly fetched page, dropping items already shown. Offset pagination
 * can repeat items when new posts arrive between page loads.
 */
export function appendUnique<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const seen = new Set(existing.map((item) => item.id));
  return [...existing, ...incoming.filter((item) => !seen.has(item.id))];
}
