import type { SportMetadata } from "@/types/sport";
import { getClubLabel, getRankingLabel, getVenueLabel } from "@/utils/sportLabels";

export interface ProfileCompletionInput {
  full_name: string | null;
  club: string | null;
  ranking: string | null;
  preferred_surface: string | null;
  date_of_birth: string | null;
}

export interface ProfileCompletionResult {
  percent: number;
  completedCount: number;
  totalCount: number;
  missingFields: string[];
  isComplete: boolean;
}

function isFilled(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

/** Compute profile completion based on sport-relevant fields. */
export function getProfileCompletion(
  profile: ProfileCompletionInput,
  sport: SportMetadata
): ProfileCompletionResult {
  const fields: { label: string; filled: boolean }[] = [
    { label: "Full Name", filled: isFilled(profile.full_name) },
    { label: "Date of Birth", filled: isFilled(profile.date_of_birth) },
    { label: getClubLabel(sport), filled: isFilled(profile.club) },
    { label: getRankingLabel(sport), filled: isFilled(profile.ranking) },
  ];

  if (sport.venueOptions?.length) {
    fields.push({
      label: getVenueLabel(sport),
      filled: isFilled(profile.preferred_surface),
    });
  }

  const completedCount = fields.filter((f) => f.filled).length;
  const totalCount = fields.length;
  const percent = Math.round((completedCount / totalCount) * 100);
  const missingFields = fields.filter((f) => !f.filled).map((f) => f.label);

  return {
    percent,
    completedCount,
    totalCount,
    missingFields,
    isComplete: completedCount === totalCount,
  };
}
