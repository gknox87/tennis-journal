const COACH_PREFIX = /^coach\s+/i;

/** Strip role label from a stored coach name; returns null if empty. */
export function normalizeCoachName(name: string | null | undefined): string | null {
  if (!name) return null;
  const normalized = name.trim().replace(COACH_PREFIX, "").trim();
  return normalized || null;
}

/** Format a coach name for display with the "Coach" label. */
export function formatCoachDisplay(name: string | null | undefined): string {
  const normalized = normalizeCoachName(name);
  return normalized ? `Coach ${normalized}` : "";
}
