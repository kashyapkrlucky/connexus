export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatScore(upvotes: number, downvotes: number): string {
  return formatCompactNumber(upvotes - downvotes);
}

/** "member" / "members" for a count; pass `plural` for irregular words. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}
