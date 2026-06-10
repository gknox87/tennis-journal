
/**
 * Parse a match score string into the number of sets played.
 * Handles comma-separated ("6-4, 6-3") and space-separated formats.
 */
export function parseSetCount(score: string | null | undefined): number {
  if (!score?.trim()) return 0;
  const sets = score.split(/,\s*|\s+/).filter((s) => s.trim().length > 0);
  return sets.length;
}

export function getWinRate(matches: { is_win: boolean }[]): number {
  if (matches.length === 0) return 0;
  const wins = matches.filter((m) => m.is_win).length;
  return Math.round((wins / matches.length) * 100);
}
