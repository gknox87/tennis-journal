import type { SportMetadata } from "@/types/sport";

/** Label for the user's club / gym / team field on profile and match forms. */
export function getClubLabel(sport: SportMetadata): string {
  switch (sport.category) {
    case "combat":
      return "Gym / Dojo";
    case "aquatic":
      return "Swim Club";
    case "athletics":
    case "endurance":
    case "cycling":
      return "Club";
    default:
      return `${sport.name} Club`;
  }
}

/** Placeholder for the club field. */
export function getClubPlaceholder(sport: SportMetadata): string {
  switch (sport.category) {
    case "combat":
      return "Enter your gym or dojo";
    case "aquatic":
      return "Enter your swim club";
    case "athletics":
    case "endurance":
    case "cycling":
      return "Enter your club or group";
    default:
      return `Enter your ${sport.name.toLowerCase()} club`;
  }
}

/** Label for venue / surface / track preference on profile and match forms. */
export function getVenueLabel(sport: SportMetadata): string {
  if (!sport.venueOptions?.length) {
    return "Venue Detail";
  }
  switch (sport.category) {
    case "racket":
      return "Court Surface";
    case "aquatic":
      return "Pool Type";
    case "athletics":
    case "endurance":
      return "Track / Terrain";
    case "combat":
      return "Training Venue";
    case "cycling":
      return "Route / Terrain";
    case "winter":
      return "Slope / Terrain";
    default:
      return "Preferred Venue";
  }
}

/** Label for ranking / level / weight class on profile. */
export function getRankingLabel(sport: SportMetadata): string {
  switch (sport.category) {
    case "combat":
      return "Weight Class / Rank";
    case "racket":
      return "Current Ranking";
    case "athletics":
    case "endurance":
    case "aquatic":
      return "Current Level";
    default:
      return "Current Ranking";
  }
}

/** Placeholder hint for the ranking field. */
export function getRankingPlaceholder(sport: SportMetadata): string {
  switch (sport.category) {
    case "combat":
      return "e.g., Welterweight, Brown belt";
    case "racket":
      return "e.g., 4.5, UTR, ITN";
    case "athletics":
    case "endurance":
      return "e.g., Sub-20 5K, Club level";
    default:
      return "e.g., Advanced, Intermediate";
  }
}

/** Subtitle for the training notes page. */
export function getTrainingNotesSubtitle(sport: SportMetadata): string {
  return `Track your progress and reflect on ${sport.terminology.trainingLabel.toLowerCase()}s for ${sport.shortName}.`;
}

/** Minimum wellness entries before trend charts are shown. */
export const WELLNESS_CHART_MIN_ENTRIES = 3;
