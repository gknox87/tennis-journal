import type { SupportedSportId } from "@/constants/sports";
import { SPORTS } from "@/constants/sports";

/**
 * Format a stored score string for display, with sport-specific formatting.
 * Tennis:        "6-4, 6-7(7-5), 6-3"  →  "6-4  6-7(7-5)  6-3"
 * Table Tennis:  "11-9, 9-11, 11-4"    →  "11-9  9-11  11-4"
 * Badminton:     "21-18, 19-21, 21-5"  →  "21-18  19-21  21-5"
 * Boxing:        "KO 3" or "UD 5"       →  "KO 3"  (unchanged)
 */
export function formatScore(score: string, sportId?: string | null): string {
  if (!score) return "";

  const sport = sportId ? SPORTS[sportId as SupportedSportId] : null;
  const type = sport?.defaultScoreFormat?.type ?? "sets";

  switch (type) {
    case "rally": {
      // Table Tennis / Badminton / Squash: "11-9, 9-11, 11-4" → "11-9  9-11  11-4"
      return score.split(/,\s*/).join("  ");
    }
    case "sets": {
      // Tennis/Padel: "6-4, 6-7(7-5), 6-3" → "6-4  6-7(7-5)  6-3"
      // Padel match tiebreak: "6-4, 4-6, 10-8" → "6-4  4-6  10-8"
      return score.split(/,\s*/).join("  ");
    }
    case "rounds": {
      // Boxing/Karate: "KO 3", "UD 5" — already formatted, return as-is
      return score;
    }
    case "time":
    case "distance":
    case "numeric":
      return score;
    default:
      return score;
  }
}