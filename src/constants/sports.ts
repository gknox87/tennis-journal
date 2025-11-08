import type { SportMetadata, ScoreFormat } from "@/types/sport";

// Tennis Formats
const tennisBestOf3: ScoreFormat = {
  type: "sets",
  maxSets: 3,
  pointsPerGame: 4,
  tiebreaks: true,
  label: "Best of 3 Sets",
};

const tennisBestOf5: ScoreFormat = {
  type: "sets",
  maxSets: 5,
  pointsPerGame: 4,
  tiebreaks: true,
  label: "Best of 5 Sets",
};

const tennisProSet: ScoreFormat = {
  type: "games",
  gamesPerMatch: 8,
  label: "Pro Set (First to 8)",
};

const tennisMatchTiebreak: ScoreFormat = {
  type: "sets",
  maxSets: 3,
  pointsPerGame: 4,
  tiebreaks: true,
  matchTiebreak: true,
  label: "Best of 3 with Match Tiebreak",
};

const racketSetFormat: ScoreFormat = {
  type: "sets",
  maxSets: 3,
  pointsPerGame: 4,
  tiebreaks: true,
  label: "Best of 3 Sets",
};

const rallyTo11: ScoreFormat = {
  type: "rally",
  pointsToWin: 11,
  winBy: 2,
};

const rallyTo15: ScoreFormat = {
  type: "rally",
  pointsToWin: 15,
  winBy: 2,
};

const rallyTo21: ScoreFormat = {
  type: "rally",
  pointsToWin: 21,
  winBy: 2,
};

// Table Tennis Formats
const tableTennisBestOf3: ScoreFormat = {
  type: "rally",
  pointsToWin: 11,
  winBy: 2,
  bestOf: 3,
  label: "Best of 3 to 11",
};

const tableTennisBestOf5: ScoreFormat = {
  type: "rally",
  pointsToWin: 11,
  winBy: 2,
  bestOf: 5,
  label: "Best of 5 to 11",
};

const tableTennisBestOf7: ScoreFormat = {
  type: "rally",
  pointsToWin: 11,
  winBy: 2,
  bestOf: 7,
  label: "Best of 7 to 11",
};

// Badminton Formats
const badmintonBestOf3: ScoreFormat = {
  type: "rally",
  pointsToWin: 21,
  winBy: 2,
  bestOf: 3,
  label: "Best of 3 to 21",
};

const badmintonSingleGame: ScoreFormat = {
  type: "rally",
  pointsToWin: 21,
  winBy: 2,
  bestOf: 1,
  label: "Single Game to 21",
};

// Squash Formats
const squashBestOf3: ScoreFormat = {
  type: "rally",
  pointsToWin: 11,
  winBy: 2,
  bestOf: 3,
  label: "Best of 3 to 11",
};

const squashBestOf5: ScoreFormat = {
  type: "rally",
  pointsToWin: 11,
  winBy: 2,
  bestOf: 5,
  label: "Best of 5 to 11",
};

// Pickleball Formats
const pickleballBestOf3: ScoreFormat = {
  type: "rally",
  pointsToWin: 11,
  winBy: 2,
  bestOf: 3,
  label: "Best of 3 to 11",
};

const pickleballSingleTo11: ScoreFormat = {
  type: "rally",
  pointsToWin: 11,
  winBy: 2,
  bestOf: 1,
  label: "Single Game to 11",
};

const pickleballSingleTo15: ScoreFormat = {
  type: "rally",
  pointsToWin: 15,
  winBy: 2,
  bestOf: 1,
  label: "Single Game to 15",
};

const pickleballSingleTo21: ScoreFormat = {
  type: "rally",
  pointsToWin: 21,
  winBy: 2,
  bestOf: 1,
  label: "Single Game to 21",
};

// Padel Formats
const padelBestOf3: ScoreFormat = {
  type: "sets",
  maxSets: 3,
  pointsPerGame: 4,
  tiebreaks: true,
  label: "Best of 3 Sets",
};

const padelBestOf5: ScoreFormat = {
  type: "sets",
  maxSets: 5,
  pointsPerGame: 4,
  tiebreaks: true,
  label: "Best of 5 Sets",
};

// Athletics Formats
const timeFormatMMSS: ScoreFormat = {
  type: "time",
  format: "mm:ss",
  lowerIsBetter: true,
};

const timeFormatHHMMSS: ScoreFormat = {
  type: "time",
  format: "hh:mm:ss",
  lowerIsBetter: true,
};

const distanceMeters: ScoreFormat = {
  type: "distance",
  unit: "m",
  higherIsBetter: true,
};

const distanceKilometers: ScoreFormat = {
  type: "distance",
  unit: "km",
  higherIsBetter: true,
};

// Combat Sport Formats
const roundsFormat: ScoreFormat = {
  type: "rounds",
  totalRounds: 3,
  scoringMethod: "points",
};

const roundsKO: ScoreFormat = {
  type: "rounds",
  totalRounds: 12,
  scoringMethod: "knockout",
};

// Gymnastics/Diving Formats
const numericScore: ScoreFormat = {
  type: "numeric",
  unit: "points",
  higherIsBetter: true,
  decimals: 2,
};

export const SPORTS: Record<string, SportMetadata> = {
  tennis: {
    id: "tennis",
    name: "Tennis",
    shortName: "Tennis",
    slug: "tennis",
    category: "racket",
    isIndividual: true,
    isPublished: true,
    popularity: 100,
    defaultScoreFormat: racketSetFormat,
    supportedScoreFormats: [racketSetFormat],
    primaryColour: "#1464c2",
    accentColour: "#ffd447",
    icon: "🎾",
    terminology: {
      matchLabel: "Match",
      opponentLabel: "Opponent",
      trainingLabel: "Practice Session",
      highlightLabel: "Key Point",
    },
    aiContext: {
      stylePrompt: "high-performance tennis",
      focusAreas: ["serve consistency", "return depth", "baseline aggression"],
    },
  },
  table_tennis: {
    id: "table_tennis",
    name: "Table Tennis",
    shortName: "Table Tennis",
    slug: "table-tennis",
    category: "racket",
    isIndividual: true,
    isPublished: true,
    popularity: 90,
    defaultScoreFormat: rallyTo11,
    supportedScoreFormats: [rallyTo11],
    primaryColour: "#ef5b00",
    accentColour: "#252850",
    icon: "🏓",
    terminology: {
      matchLabel: "Match",
      opponentLabel: "Opponent",
      trainingLabel: "Drill Session",
      highlightLabel: "Rally Highlight",
    },
    aiContext: {
      stylePrompt: "elite table tennis",
      focusAreas: ["serve variation", "third-ball attack", "footwork timing"],
    },
  },
  padel: {
    id: "padel",
    name: "Padel",
    shortName: "Padel",
    slug: "padel",
    category: "racket",
    isIndividual: false,
    isPublished: true,
    popularity: 85,
    defaultScoreFormat: racketSetFormat,
    supportedScoreFormats: [racketSetFormat],
    primaryColour: "#0a2239",
    accentColour: "#f6c90e",
    icon: "🏸",
    terminology: {
      matchLabel: "Match",
      opponentLabel: "Opposing Pair",
      trainingLabel: "Practice",
      highlightLabel: "Winning Pattern",
    },
    aiContext: {
      stylePrompt: "professional padel",
      focusAreas: ["net pressure", "lob defence", "court positioning"],
    },
  },
  pickleball: {
    id: "pickleball",
    name: "Pickleball",
    shortName: "Pickleball",
    slug: "pickleball",
    category: "racket",
    isIndividual: true,
    isPublished: true,
    popularity: 80,
    defaultScoreFormat: rallyTo11,
    supportedScoreFormats: [rallyTo11, rallyTo15],
    primaryColour: "#62a60a",
    accentColour: "#f3f315",
    icon: "🏸",
    terminology: {
      matchLabel: "Game",
      opponentLabel: "Opposing Team",
      trainingLabel: "Drill",
      highlightLabel: "Key Rally",
    },
    aiContext: {
      stylePrompt: "competitive pickleball",
      focusAreas: ["dink control", "third-shot drop", "transition positioning"],
    },
  },
  badminton: {
    id: "badminton",
    name: "Badminton",
    shortName: "Badminton",
    slug: "badminton",
    category: "racket",
    isIndividual: true,
    isPublished: true,
    popularity: 95,
    defaultScoreFormat: rallyTo21,
    supportedScoreFormats: [rallyTo21, rallyTo15],
    primaryColour: "#00a896",
    accentColour: "#028090",
    icon: "🏸",
    terminology: {
      matchLabel: "Match",
      opponentLabel: "Opponent",
      trainingLabel: "Training",
      highlightLabel: "Rally Insight",
    },
    aiContext: {
      stylePrompt: "elite badminton",
      focusAreas: ["net play", "rear-court clears", "smash recovery"],
    },
  },
  squash: {
    id: "squash",
    name: "Squash",
    shortName: "Squash",
    slug: "squash",
    category: "racket",
    isIndividual: true,
    isPublished: true,
    popularity: 75,
    defaultScoreFormat: rallyTo11,
    supportedScoreFormats: [rallyTo11, rallyTo15],
    primaryColour: "#4b1d3f",
    accentColour: "#f0a6ca",
    icon: "⚫️",
    terminology: {
      matchLabel: "Match",
      opponentLabel: "Opponent",
      trainingLabel: "Session",
      highlightLabel: "Pressure Moment",
    },
    aiContext: {
      stylePrompt: "professional squash",
      focusAreas: ["T-position control", "length accuracy", "pressure building"],
    },
  },
  // Athletics
  running_100m: {
    id: "running_100m",
    name: "100m Sprint",
    shortName: "100m",
    slug: "100m-sprint",
    category: "athletics",
    subcategory: "sprint",
    isIndividual: true,
    isPublished: true,
    popularity: 70,
    defaultScoreFormat: {
      type: "numeric",
      unit: "seconds",
      higherIsBetter: false,
      decimals: 2,
    },
    supportedScoreFormats: [{
      type: "numeric",
      unit: "seconds",
      higherIsBetter: false,
      decimals: 2,
    }],
    primaryColour: "#e63946",
    accentColour: "#f1faee",
    icon: "🏃",
    terminology: {
      matchLabel: "Race",
      opponentLabel: "Competitor",
      trainingLabel: "Training Run",
      highlightLabel: "Split Time",
    },
    aiContext: {
      stylePrompt: "elite sprinting",
      focusAreas: ["explosive start", "drive phase", "top-end speed"],
    },
  },
  running_400m: {
    id: "running_400m",
    name: "400m",
    shortName: "400m",
    slug: "400m",
    category: "athletics",
    subcategory: "sprint",
    isIndividual: true,
    isPublished: true,
    popularity: 65,
    defaultScoreFormat: {
      type: "numeric",
      unit: "seconds",
      higherIsBetter: false,
      decimals: 2,
    },
    supportedScoreFormats: [{
      type: "numeric",
      unit: "seconds",
      higherIsBetter: false,
      decimals: 2,
    }],
    primaryColour: "#e63946",
    accentColour: "#f1faee",
    icon: "🏃",
    terminology: {
      matchLabel: "Race",
      opponentLabel: "Competitor",
      trainingLabel: "Speed Endurance",
      highlightLabel: "Split Time",
    },
    aiContext: {
      stylePrompt: "quarter-mile racing",
      focusAreas: ["pace distribution", "lactate tolerance", "finishing speed"],
    },
  },
  running_5k: {
    id: "running_5k",
    name: "5K Running",
    shortName: "5K",
    slug: "5k-running",
    category: "athletics",
    subcategory: "distance",
    isIndividual: true,
    isPublished: true,
    popularity: 85,
    defaultScoreFormat: timeFormatHHMMSS,
    supportedScoreFormats: [timeFormatHHMMSS],
    primaryColour: "#457b9d",
    accentColour: "#a8dadc",
    icon: "🏃‍♂️",
    terminology: {
      matchLabel: "Race",
      opponentLabel: "Runner",
      trainingLabel: "Distance Run",
      highlightLabel: "Kilometer Split",
    },
    aiContext: {
      stylePrompt: "competitive 5K racing",
      focusAreas: ["pacing strategy", "aerobic capacity", "kick finish"],
    },
  },
  running_marathon: {
    id: "running_marathon",
    name: "Marathon",
    shortName: "Marathon",
    slug: "marathon",
    category: "endurance",
    isIndividual: true,
    isPublished: true,
    popularity: 80,
    defaultScoreFormat: timeFormatHHMMSS,
    supportedScoreFormats: [timeFormatHHMMSS],
    primaryColour: "#1d3557",
    accentColour: "#f1faee",
    icon: "🏃‍♀️",
    terminology: {
      matchLabel: "Race",
      opponentLabel: "Runner",
      trainingLabel: "Long Run",
      highlightLabel: "Mile Split",
    },
    aiContext: {
      stylePrompt: "marathon endurance",
      focusAreas: ["negative splits", "fueling strategy", "mental toughness"],
    },
  },
  // Aquatic
  swimming_freestyle: {
    id: "swimming_freestyle",
    name: "Freestyle Swimming",
    shortName: "Freestyle",
    slug: "swimming-freestyle",
    category: "aquatic",
    isIndividual: true,
    isPublished: true,
    popularity: 75,
    defaultScoreFormat: timeFormatMMSS,
    supportedScoreFormats: [timeFormatMMSS, timeFormatHHMMSS],
    primaryColour: "#0077b6",
    accentColour: "#00b4d8",
    icon: "🏊",
    terminology: {
      matchLabel: "Race",
      opponentLabel: "Swimmer",
      trainingLabel: "Swim Session",
      highlightLabel: "Lap Split",
    },
    aiContext: {
      stylePrompt: "competitive swimming",
      focusAreas: ["stroke efficiency", "turn technique", "underwater phase"],
    },
  },
  // Combat Sports
  boxing: {
    id: "boxing",
    name: "Boxing",
    shortName: "Boxing",
    slug: "boxing",
    category: "combat",
    isIndividual: true,
    isPublished: true,
    popularity: 85,
    defaultScoreFormat: roundsKO,
    supportedScoreFormats: [roundsKO, roundsFormat],
    primaryColour: "#d00000",
    accentColour: "#ffba08",
    icon: "🥊",
    terminology: {
      matchLabel: "Bout",
      opponentLabel: "Opponent",
      trainingLabel: "Sparring",
      highlightLabel: "Key Exchange",
    },
    aiContext: {
      stylePrompt: "professional boxing",
      focusAreas: ["ring generalship", "combination punching", "defensive positioning"],
    },
  },
  mma: {
    id: "mma",
    name: "Mixed Martial Arts",
    shortName: "MMA",
    slug: "mma",
    category: "combat",
    isIndividual: true,
    isPublished: true,
    popularity: 90,
    defaultScoreFormat: roundsFormat,
    supportedScoreFormats: [roundsFormat],
    primaryColour: "#370617",
    accentColour: "#dc2f02",
    icon: "🥋",
    terminology: {
      matchLabel: "Fight",
      opponentLabel: "Opponent",
      trainingLabel: "Training Session",
      highlightLabel: "Key Moment",
    },
    aiContext: {
      stylePrompt: "mixed martial arts",
      focusAreas: ["striking defense", "takedown accuracy", "ground control"],
    },
  },
  judo: {
    id: "judo",
    name: "Judo",
    shortName: "Judo",
    slug: "judo",
    category: "combat",
    isIndividual: true,
    isPublished: true,
    popularity: 70,
    defaultScoreFormat: numericScore,
    supportedScoreFormats: [numericScore],
    primaryColour: "#004e89",
    accentColour: "#ff6b35",
    icon: "🥋",
    terminology: {
      matchLabel: "Match",
      opponentLabel: "Opponent",
      trainingLabel: "Randori",
      highlightLabel: "Technique",
    },
    aiContext: {
      stylePrompt: "competitive judo",
      focusAreas: ["gripping strategy", "throw timing", "groundwork transitions"],
    },
  },
  // Cycling
  cycling_road: {
    id: "cycling_road",
    name: "Road Cycling",
    shortName: "Road Cycling",
    slug: "road-cycling",
    category: "cycling",
    isIndividual: true,
    isPublished: true,
    popularity: 75,
    defaultScoreFormat: timeFormatHHMMSS,
    supportedScoreFormats: [timeFormatHHMMSS, distanceKilometers],
    primaryColour: "#2d6a4f",
    accentColour: "#95d5b2",
    icon: "🚴",
    terminology: {
      matchLabel: "Race",
      opponentLabel: "Rider",
      trainingLabel: "Training Ride",
      highlightLabel: "Segment",
    },
    aiContext: {
      stylePrompt: "competitive cycling",
      focusAreas: ["power output", "drafting technique", "climb pacing"],
    },
  },
  // Gymnastics
  gymnastics_artistic: {
    id: "gymnastics_artistic",
    name: "Artistic Gymnastics",
    shortName: "Gymnastics",
    slug: "artistic-gymnastics",
    category: "gymnastics",
    isIndividual: true,
    isPublished: true,
    popularity: 70,
    defaultScoreFormat: numericScore,
    supportedScoreFormats: [numericScore],
    primaryColour: "#6a4c93",
    accentColour: "#f72585",
    icon: "🤸",
    terminology: {
      matchLabel: "Competition",
      opponentLabel: "Gymnast",
      trainingLabel: "Practice",
      highlightLabel: "Routine Element",
    },
    aiContext: {
      stylePrompt: "elite gymnastics",
      focusAreas: ["execution score", "difficulty value", "landing precision"],
    },
  },
};

export const DEFAULT_SPORT_ID = SPORTS.tennis.id;
export type SupportedSportId = keyof typeof SPORTS;
