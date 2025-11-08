export type ScoreFormat =
  | {
      type: "sets";
      maxSets: 3 | 5;
      pointsPerGame: number;
      tiebreaks: boolean;
      matchTiebreak?: boolean; // 10-point tiebreak for final set
      label?: string; // e.g., "Best of 3 Sets", "Best of 5 Sets"
    }
  | {
      type: "games";
      gamesPerMatch: number;
      label?: string; // e.g., "Pro Set to 8"
    }
  | {
      type: "rally";
      pointsToWin: number;
      winBy: number;
      bestOf?: 3 | 5 | 7; // number of games in match
      label?: string; // e.g., "Best of 5 to 11", "Best of 3 to 21"
    }
  | {
      type: "time";
      format: "mm:ss" | "hh:mm:ss";
      lowerIsBetter: boolean;
      eventDistance?: string; // e.g., "100m", "5K", "Marathon"
    }
  | {
      type: "distance";
      unit: "m" | "km" | "mi" | "ft";
      higherIsBetter: boolean;
    }
  | {
      type: "rounds";
      totalRounds: 3 | 4 | 5 | 6 | 8 | 10 | 12;
      roundDuration?: number; // in minutes
      scoringMethod: "points" | "knockout";
      label?: string; // e.g., "12 Rounds (Championship)", "3 Rounds × 5 min"
    }
  | {
      type: "numeric";
      unit: string;
      higherIsBetter: boolean;
      decimals?: number;
    };

export type SportCategory =
  | "racket"
  | "athletics"
  | "aquatic"
  | "combat"
  | "winter"
  | "cycling"
  | "gymnastics"
  | "team"
  | "endurance"
  | "other";

export interface SportMetadata {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  category: SportCategory;
  subcategory?: string;
  isIndividual: boolean;
  isPublished: boolean;
  popularity?: number;
  defaultScoreFormat: ScoreFormat;
  supportedScoreFormats: ScoreFormat[];
  primaryColour: string;
  accentColour: string;
  icon: string;
  terminology: {
    matchLabel: string;
    opponentLabel: string;
    trainingLabel: string;
    highlightLabel: string;
  };
  aiContext: {
    stylePrompt: string;
    focusAreas: string[];
  };
}
