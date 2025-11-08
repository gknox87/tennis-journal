import type { SportMetadata, ScoreFormat, SportCategory } from "@/types/sport";
import { SPORTS, type SupportedSportId } from "@/constants/sports";

/**
 * Get sports grouped by category
 */
export function getSportsByCategory(): Record<SportCategory, SportMetadata[]> {
  const grouped: Partial<Record<SportCategory, SportMetadata[]>> = {};

  Object.values(SPORTS).forEach((sport) => {
    if (!grouped[sport.category]) {
      grouped[sport.category] = [];
    }
    grouped[sport.category]!.push(sport);
  });

  // Sort each category by popularity
  Object.keys(grouped).forEach((category) => {
    grouped[category as SportCategory]!.sort((a, b) =>
      (b.popularity || 0) - (a.popularity || 0)
    );
  });

  return grouped as Record<SportCategory, SportMetadata[]>;
}

/**
 * Get popular sports (top N by popularity)
 */
export function getPopularSports(limit: number = 8): SportMetadata[] {
  return Object.values(SPORTS)
    .filter(sport => sport.isPublished)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit);
}

/**
 * Get published sports only
 */
export function getPublishedSports(): SportMetadata[] {
  return Object.values(SPORTS).filter(sport => sport.isPublished);
}

/**
 * Get individual sports only
 */
export function getIndividualSports(): SportMetadata[] {
  return Object.values(SPORTS).filter(sport => sport.isIndividual && sport.isPublished);
}

/**
 * Get team sports only
 */
export function getTeamSports(): SportMetadata[] {
  return Object.values(SPORTS).filter(sport => !sport.isIndividual && sport.isPublished);
}

/**
 * Format score based on score format type
 */
export function formatScore(score: number | string, format: ScoreFormat): string {
  switch (format.type) {
    case "time":
      return formatTime(score.toString(), format.format);
    case "distance":
      return `${score}${format.unit}`;
    case "numeric":
      if (format.decimals !== undefined && typeof score === 'number') {
        return `${score.toFixed(format.decimals)} ${format.unit}`;
      }
      return `${score} ${format.unit}`;
    case "rounds":
      return `${score} rounds`;
    case "sets":
    case "rally":
    case "games":
    default:
      return score.toString();
  }
}

/**
 * Format time string based on format
 */
function formatTime(time: string, format: "mm:ss" | "hh:mm:ss"): string {
  // If time is already in correct format, return it
  if (time.includes(":")) {
    return time;
  }

  // If time is in seconds, convert to format
  const totalSeconds = parseFloat(time);
  if (isNaN(totalSeconds)) {
    return time;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const ms = Math.round((totalSeconds % 1) * 100);

  if (format === "hh:mm:ss") {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    const totalMinutes = hours * 60 + minutes;
    if (ms > 0) {
      return `${totalMinutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    return `${totalMinutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Parse time string to seconds
 */
export function parseTimeToSeconds(time: string): number {
  const parts = time.split(":");
  if (parts.length === 2) {
    // mm:ss or mm:ss.ms
    const [minutes, secondsPart] = parts;
    const seconds = parseFloat(secondsPart);
    return parseInt(minutes) * 60 + seconds;
  } else if (parts.length === 3) {
    // hh:mm:ss
    const [hours, minutes, seconds] = parts;
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
  }
  return parseFloat(time);
}

/**
 * Validate score input based on format
 */
export function validateScoreInput(input: string, format: ScoreFormat): boolean {
  switch (format.type) {
    case "time":
      // Check if it's a valid time format (mm:ss or hh:mm:ss)
      const timeRegex = format.format === "hh:mm:ss"
        ? /^\d{1,2}:\d{2}:\d{2}(\.\d{1,2})?$/
        : /^\d{1,3}:\d{2}(\.\d{1,2})?$/;
      return timeRegex.test(input);
    case "distance":
      // Check if it's a valid number
      return !isNaN(parseFloat(input)) && parseFloat(input) >= 0;
    case "numeric":
      return !isNaN(parseFloat(input));
    case "rounds":
      return !isNaN(parseInt(input)) && parseInt(input) > 0 && parseInt(input) <= format.totalRounds;
    default:
      return true;
  }
}

/**
 * Get scoring hint text for a sport
 */
export function getScoringHint(format: ScoreFormat): string {
  switch (format.type) {
    case "time":
      return `Enter time in ${format.format} format${format.lowerIsBetter ? ' (lower is better)' : ''}`;
    case "distance":
      return `Enter distance in ${format.unit}${format.higherIsBetter ? ' (higher is better)' : ''}`;
    case "numeric":
      return `Enter score in ${format.unit}${format.higherIsBetter ? ' (higher is better)' : ''}`;
    case "rounds":
      return `Enter result (max ${format.totalRounds} rounds, ${format.scoringMethod})`;
    case "sets":
      return `Best of ${format.maxSets} sets`;
    case "rally":
      return `First to ${format.pointsToWin}, win by ${format.winBy}`;
    case "games":
      return `Best of ${format.gamesPerMatch} games`;
    default:
      return "";
  }
}

/**
 * Check if score format is time-based
 */
export function isTimeBasedScoring(format: ScoreFormat): boolean {
  return format.type === "time";
}

/**
 * Check if score format is distance-based
 */
export function isDistanceBasedScoring(format: ScoreFormat): boolean {
  return format.type === "distance";
}

/**
 * Check if score format is numeric
 */
export function isNumericScoring(format: ScoreFormat): boolean {
  return format.type === "numeric";
}

/**
 * Check if score format uses traditional set/rally scoring
 */
export function isTraditionalScoring(format: ScoreFormat): boolean {
  return format.type === "sets" || format.type === "rally" || format.type === "games";
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: SportCategory): string {
  const displayNames: Record<SportCategory, string> = {
    racket: "Racket Sports",
    athletics: "Athletics",
    aquatic: "Aquatic Sports",
    combat: "Combat Sports",
    winter: "Winter Sports",
    cycling: "Cycling",
    gymnastics: "Gymnastics",
    team: "Team Sports",
    endurance: "Endurance Sports",
    other: "Other Sports",
  };
  return displayNames[category] || category;
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: SportCategory): string {
  const icons: Record<SportCategory, string> = {
    racket: "🎾",
    athletics: "🏃",
    aquatic: "🏊",
    combat: "🥊",
    winter: "⛷️",
    cycling: "🚴",
    gymnastics: "🤸",
    team: "⚽",
    endurance: "🏃‍♀️",
    other: "🏅",
  };
  return icons[category] || "🏅";
}

/**
 * Search sports by name or category
 */
export function searchSports(query: string): SportMetadata[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(SPORTS).filter(sport =>
    sport.isPublished && (
      sport.name.toLowerCase().includes(lowerQuery) ||
      sport.shortName.toLowerCase().includes(lowerQuery) ||
      sport.category.toLowerCase().includes(lowerQuery) ||
      (sport.subcategory && sport.subcategory.toLowerCase().includes(lowerQuery))
    )
  );
}

/**
 * Get sport by ID safely
 */
export function getSportById(id: string): SportMetadata | undefined {
  return SPORTS[id as SupportedSportId];
}

/**
 * Compare two scores based on format
 * Returns: 1 if score1 is better, -1 if score2 is better, 0 if equal
 */
export function compareScores(score1: number, score2: number, format: ScoreFormat): number {
  if (score1 === score2) return 0;

  const higherIsBetter =
    format.type === "distance" ? format.higherIsBetter :
    format.type === "numeric" ? format.higherIsBetter :
    format.type === "time" ? !format.lowerIsBetter :
    true; // Default for sets/rally/games

  if (higherIsBetter) {
    return score1 > score2 ? 1 : -1;
  } else {
    return score1 < score2 ? 1 : -1;
  }
}
