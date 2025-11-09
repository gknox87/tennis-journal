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
  label: "Single Game to 11",
};

const pickleballSingleTo15: ScoreFormat = {
  type: "rally",
  pointsToWin: 15,
  winBy: 2,
  label: "Single Game to 15",
};

const pickleballSingleTo21: ScoreFormat = {
  type: "rally",
  pointsToWin: 21,
  winBy: 2,
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
    defaultScoreFormat: tennisBestOf3,
    supportedScoreFormats: [
      tennisBestOf3,
      tennisBestOf5,
      tennisMatchTiebreak,
      tennisProSet,
    ],
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
    venueOptions: [
      "Hard Court",
      "Clay Court",
      "Grass Court",
      "Artificial Grass",
      "Carpet Court"
    ],
    stats: {
      primary: [
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Your success rate",
          category: "universal"
        },
        {
          id: "total_matches",
          label: "Total Matches",
          description: "Games played",
          category: "universal"
        },
        {
          id: "matches_this_year",
          label: "This Year",
          description: "Recent activity",
          category: "universal"
        },
        {
          id: "sets_won",
          label: "Sets Won",
          description: "Winning sets",
          category: "sport_specific"
        },
        {
          id: "sets_lost",
          label: "Sets Lost",
          description: "Learning moments",
          category: "sport_specific"
        },
        {
          id: "tiebreaks_won",
          label: "Tiebreaks",
          description: "Clutch wins",
          category: "sport_specific"
        }
      ]
    }
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
    defaultScoreFormat: tableTennisBestOf5,
    supportedScoreFormats: [
      tableTennisBestOf5,
      tableTennisBestOf3,
      tableTennisBestOf7,
    ],
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
    stats: {
      primary: [
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Match conversion rate",
          category: "universal",
        },
        {
          id: "total_matches",
          label: "Matches Logged",
          description: "Games recorded",
          category: "universal",
        },
        {
          id: "matches_this_year",
          label: "This Season",
          description: "Events played this year",
          category: "universal",
        },
        {
          id: "sets_won",
          label: "Games Won",
          description: "Games taken across matches",
          category: "sport_specific",
        },
        {
          id: "sets_lost",
          label: "Games Dropped",
          description: "Games conceded in matches",
          category: "sport_specific",
        },
        {
          id: "tiebreaks_won",
          label: "Deciding Games",
          description: "Fifth-game clutch wins",
          category: "sport_specific",
        },
      ],
      secondary: [
        {
          id: "serve_quality",
          label: "Serve Quality",
          description: "Short and long serve effectiveness",
          category: "sport_specific",
        },
        {
          id: "forehand_success",
          label: "Forehand Success",
          description: "Winners struck with forehand",
          category: "sport_specific",
        },
      ],
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
    stats: {
      primary: [
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Pair success percentage",
          category: "universal",
        },
        {
          id: "total_matches",
          label: "Matches Logged",
          description: "Partidos recorded",
          category: "universal",
        },
        {
          id: "matches_this_year",
          label: "This Season",
          description: "Events played this year",
          category: "universal",
        },
        {
          id: "sets_won",
          label: "Sets Won",
          description: "Sets captured across matches",
          category: "sport_specific",
        },
        {
          id: "sets_lost",
          label: "Sets Dropped",
          description: "Sets conceded",
          category: "sport_specific",
        },
        {
          id: "tiebreaks_won",
          label: "Tie-break Wins",
          description: "Deciding tie-break successes",
          category: "sport_specific",
        },
      ],
      secondary: [
        {
          id: "net_points_won",
          label: "Net Points Won",
          description: "Points secured at the net",
          category: "sport_specific",
        },
        {
          id: "lob_accuracy",
          label: "Lob Accuracy",
          description: "Effective lob percentage",
          category: "sport_specific",
        },
      ],
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
    defaultScoreFormat: pickleballBestOf3,
    supportedScoreFormats: [
      pickleballBestOf3,
      pickleballSingleTo11,
      pickleballSingleTo15,
      pickleballSingleTo21,
    ],
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
    stats: {
      primary: [
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Match success percentage",
          category: "universal",
        },
        {
          id: "total_matches",
          label: "Matches Logged",
          description: "Games recorded",
          category: "universal",
        },
        {
          id: "matches_this_year",
          label: "This Season",
          description: "Events played this year",
          category: "universal",
        },
        {
          id: "sets_won",
          label: "Games Won",
          description: "Games captured to 11",
          category: "sport_specific",
        },
        {
          id: "sets_lost",
          label: "Games Dropped",
          description: "Games conceded",
          category: "sport_specific",
        },
        {
          id: "tiebreaks_won",
          label: "Deciders Won",
          description: "Tie-breaker success",
          category: "sport_specific",
        },
      ],
      secondary: [
        {
          id: "dink_success",
          label: "Dink Success",
          description: "Soft game conversion rate",
          category: "sport_specific",
        },
        {
          id: "third_shot_quality",
          label: "Third Shot Quality",
          description: "Effective third-shot drops",
          category: "sport_specific",
        },
      ],
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
    defaultScoreFormat: badmintonBestOf3,
    supportedScoreFormats: [
      badmintonBestOf3,
      badmintonSingleGame,
    ],
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
    stats: {
      primary: [
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Match success percentage",
          category: "universal",
        },
        {
          id: "total_matches",
          label: "Matches Logged",
          description: "Fixtures recorded",
          category: "universal",
        },
        {
          id: "matches_this_year",
          label: "This Season",
          description: "Fixtures this year",
          category: "universal",
        },
        {
          id: "sets_won",
          label: "Games Won",
          description: "Rally games to 21 secured",
          category: "sport_specific",
        },
        {
          id: "sets_lost",
          label: "Games Dropped",
          description: "Games conceded to opponents",
          category: "sport_specific",
        },
        {
          id: "tiebreaks_won",
          label: "Rubbers Won",
          description: "Third-game victories",
          category: "sport_specific",
        },
      ],
      secondary: [
        {
          id: "smash_conversion",
          label: "Smash Conversion",
          description: "Smashes resulting in winners",
          category: "sport_specific",
        },
        {
          id: "net_kills",
          label: "Net Kills",
          description: "Successful net interceptions",
          category: "sport_specific",
        },
      ],
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
    defaultScoreFormat: squashBestOf5,
    supportedScoreFormats: [
      squashBestOf5,
      squashBestOf3,
    ],
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
    stats: {
      primary: [
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Match conversion rate",
          category: "universal",
        },
        {
          id: "total_matches",
          label: "Matches Logged",
          description: "Fixtures recorded",
          category: "universal",
        },
        {
          id: "matches_this_year",
          label: "This Season",
          description: "Matches played this year",
          category: "universal",
        },
        {
          id: "sets_won",
          label: "Games Won",
          description: "Games secured to 11",
          category: "sport_specific",
        },
        {
          id: "sets_lost",
          label: "Games Dropped",
          description: "Games conceded",
          category: "sport_specific",
        },
        {
          id: "tiebreaks_won",
          label: "Deciding Games",
          description: "Fifth-game successes",
          category: "sport_specific",
        },
      ],
      secondary: [
        {
          id: "length_accuracy",
          label: "Length Accuracy",
          description: "Drives landing deep in court",
          category: "sport_specific",
        },
        {
          id: "volley_pressure",
          label: "Volley Pressure",
          description: "Points won volleying from the T",
          category: "sport_specific",
        },
      ],
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
    stats: {
      primary: [
        {
          id: "personal_best",
          label: "Personal Best",
          description: "Fastest recorded 100m",
          category: "sport_specific",
        },
        {
          id: "season_best",
          label: "Season Best",
          description: "Quickest time this season",
          category: "sport_specific",
        },
        {
          id: "avg_reaction",
          label: "Reaction Time",
          description: "Average block reaction time",
          category: "sport_specific",
        },
        {
          id: "races_completed",
          label: "Races Completed",
          description: "Total races logged",
          category: "universal",
        },
        {
          id: "podiums",
          label: "Podium Finishes",
          description: "Top-three results",
          category: "sport_specific",
        },
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Sprint success percentage",
          category: "universal",
        },
      ],
      secondary: [
        {
          id: "max_velocity",
          label: "Max Velocity",
          description: "Peak speed reached",
          category: "sport_specific",
        },
        {
          id: "split_consistency",
          label: "Split Consistency",
          description: "Variance between 0-30m and 30-60m splits",
          category: "sport_specific",
        },
      ],
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
    stats: {
      primary: [
        {
          id: "personal_best",
          label: "Personal Best",
          description: "Fastest recorded 400m",
          category: "sport_specific",
        },
        {
          id: "season_best",
          label: "Season Best",
          description: "Quickest lap this season",
          category: "sport_specific",
        },
        {
          id: "avg_split",
          label: "200m Split",
          description: "Average first/second 200m split",
          category: "sport_specific",
        },
        {
          id: "races_completed",
          label: "Races Completed",
          description: "Total races logged",
          category: "universal",
        },
        {
          id: "podiums",
          label: "Podium Finishes",
          description: "Top-three results",
          category: "sport_specific",
        },
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Race success percentage",
          category: "universal",
        },
      ],
      secondary: [
        {
          id: "split_balancing",
          label: "Split Balance",
          description: "Difference between first and second laps",
          category: "sport_specific",
        },
        {
          id: "closing_speed",
          label: "Closing Speed",
          description: "Final 100m pace vs average",
          category: "sport_specific",
        },
      ],
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
    stats: {
      primary: [
        {
          id: "personal_best",
          label: "Personal Best",
          description: "Fastest recorded 5K",
          category: "sport_specific",
        },
        {
          id: "season_best",
          label: "Season Best",
          description: "Quickest 5K this season",
          category: "sport_specific",
        },
        {
          id: "avg_pace",
          label: "Average Pace",
          description: "Mean pace per kilometre",
          category: "sport_specific",
        },
        {
          id: "races_completed",
          label: "Races Completed",
          description: "Total races logged",
          category: "universal",
        },
        {
          id: "negative_splits",
          label: "Negative Splits",
          description: "Races with faster second half",
          category: "sport_specific",
        },
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Race success percentage",
          category: "universal",
        },
      ],
      secondary: [
        {
          id: "avg_heart_rate",
          label: "Average Heart Rate",
          description: "Mean heart rate across races",
          category: "sport_specific",
        },
        {
          id: "elevation_gain",
          label: "Elevation Gain",
          description: "Total climb per race",
          category: "sport_specific",
        },
      ],
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
    stats: {
      primary: [
        {
          id: "personal_best",
          label: "Personal Best",
          description: "Fastest marathon time",
          category: "sport_specific",
        },
        {
          id: "season_best",
          label: "Season Best",
          description: "Quickest marathon this season",
          category: "sport_specific",
        },
        {
          id: "avg_pace",
          label: "Average Pace",
          description: "Mean pace per kilometre",
          category: "sport_specific",
        },
        {
          id: "races_completed",
          label: "Races Completed",
          description: "Marathons logged",
          category: "universal",
        },
        {
          id: "negative_splits",
          label: "Negative Splits",
          description: "Races with faster second half",
          category: "sport_specific",
        },
        {
          id: "win_rate",
          label: "Podium Rate",
          description: "Top finishes percentage",
          category: "sport_specific",
        },
      ],
      secondary: [
        {
          id: "fueling_success",
          label: "Fuel Stops",
          description: "Effective fuelling execution",
          category: "sport_specific",
        },
        {
          id: "avg_cadence",
          label: "Average Cadence",
          description: "Steps per minute average",
          category: "sport_specific",
        },
      ],
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
    stats: {
      primary: [
        {
          id: "personal_best",
          label: "Personal Best",
          description: "Fastest swim time",
          category: "sport_specific",
        },
        {
          id: "season_best",
          label: "Season Best",
          description: "Quickest swim this season",
          category: "sport_specific",
        },
        {
          id: "avg_split",
          label: "Split Time",
          description: "Average split per lap",
          category: "sport_specific",
        },
        {
          id: "races_completed",
          label: "Races Completed",
          description: "Events logged",
          category: "universal",
        },
        {
          id: "turn_efficiency",
          label: "Turn Efficiency",
          description: "Average turn time",
          category: "sport_specific",
        },
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Meet success percentage",
          category: "universal",
        },
      ],
      secondary: [
        {
          id: "stroke_rate",
          label: "Stroke Rate",
          description: "Average strokes per minute",
          category: "sport_specific",
        },
        {
          id: "underwater_distance",
          label: "Underwater Distance",
          description: "Metres travelled off the wall",
          category: "sport_specific",
        },
      ],
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
    stats: {
      primary: [
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Bout success percentage",
          category: "universal",
        },
        {
          id: "total_matches",
          label: "Bouts Logged",
          description: "Fights recorded",
          category: "universal",
        },
        {
          id: "knockouts",
          label: "Knockouts",
          description: "KO/TKO victories",
          category: "sport_specific",
        },
        {
          id: "rounds_won",
          label: "Rounds Won",
          description: "Rounds scored in your favour",
          category: "sport_specific",
        },
        {
          id: "rounds_lost",
          label: "Rounds Dropped",
          description: "Rounds scored against you",
          category: "sport_specific",
        },
        {
          id: "decision_wins",
          label: "Decision Wins",
          description: "Points victories",
          category: "sport_specific",
        },
      ],
      secondary: [
        {
          id: "jab_accuracy",
          label: "Jab Accuracy",
          description: "Percentage of jabs landed",
          category: "sport_specific",
        },
        {
          id: "power_punch_accuracy",
          label: "Power Accuracy",
          description: "Power shots landed",
          category: "sport_specific",
        },
      ],
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
    stats: {
      primary: [
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Fight success percentage",
          category: "universal",
        },
        {
          id: "total_matches",
          label: "Fights Logged",
          description: "Bouts recorded",
          category: "universal",
        },
        {
          id: "finishes",
          label: "Finishes",
          description: "KO/TKO and submission wins",
          category: "sport_specific",
        },
        {
          id: "control_time",
          label: "Control Time",
          description: "Average cage/ground control",
          category: "sport_specific",
        },
        {
          id: "takedown_accuracy",
          label: "Takedown Accuracy",
          description: "Successful takedown percentage",
          category: "sport_specific",
        },
        {
          id: "significant_strikes",
          label: "Significant Strikes",
          description: "Avg significant strikes landed",
          category: "sport_specific",
        },
      ],
      secondary: [
        {
          id: "submission_attempts",
          label: "Submission Attempts",
          description: "Attempts per fight",
          category: "sport_specific",
        },
        {
          id: "striking_defence",
          label: "Striking Defence",
          description: "Percentage of strikes avoided",
          category: "sport_specific",
        },
      ],
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
    stats: {
      primary: [
        {
          id: "win_rate",
          label: "Win Rate",
          description: "Shiai success percentage",
          category: "universal",
        },
        {
          id: "total_matches",
          label: "Bouts Logged",
          description: "Contests recorded",
          category: "universal",
        },
        {
          id: "ippon_wins",
          label: "Ippon Wins",
          description: "Clean victories",
          category: "sport_specific",
        },
        {
          id: "waza_ari",
          label: "Waza-ari Scored",
          description: "Waza-ari tallied",
          category: "sport_specific",
        },
        {
          id: "shido_count",
          label: "Shido Count",
          description: "Penalties conceded",
          category: "sport_specific",
        },
        {
          id: "golden_score",
          label: "Golden Score Wins",
          description: "Sudden-death victories",
          category: "sport_specific",
        },
      ],
      secondary: [
        {
          id: "grip_dominance",
          label: "Grip Dominance",
          description: "Sequences with superior grip",
          category: "sport_specific",
        },
        {
          id: "transition_success",
          label: "Ne-waza Success",
          description: "Ground transitions converted",
          category: "sport_specific",
        },
      ],
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
    stats: {
      primary: [
        {
          id: "personal_best",
          label: "Personal Best",
          description: "Fastest course time",
          category: "sport_specific",
        },
        {
          id: "ftp",
          label: "Functional Threshold",
          description: "Current FTP estimate",
          category: "sport_specific",
        },
        {
          id: "avg_power",
          label: "Average Power",
          description: "Mean power across rides",
          category: "sport_specific",
        },
        {
          id: "rides_logged",
          label: "Rides Logged",
          description: "Sessions recorded",
          category: "universal",
        },
        {
          id: "elevation_gain",
          label: "Elevation Gain",
          description: "Metres climbed",
          category: "sport_specific",
        },
        {
          id: "win_rate",
          label: "Win / Podium Rate",
          description: "Race success percentage",
          category: "sport_specific",
        },
      ],
      secondary: [
        {
          id: "sprint_power",
          label: "Sprint Power",
          description: "Peak 5s wattage",
          category: "sport_specific",
        },
        {
          id: "aerobic_load",
          label: "Aerobic Load",
          description: "Training stress balance",
          category: "sport_specific",
        },
      ],
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
    stats: {
      primary: [
        {
          id: "avg_score",
          label: "Average Score",
          description: "Mean routine total",
          category: "sport_specific",
        },
        {
          id: "difficulty_value",
          label: "Difficulty Value",
          description: "Average D-score",
          category: "sport_specific",
        },
        {
          id: "execution_score",
          label: "Execution Score",
          description: "Average E-score",
          category: "sport_specific",
        },
        {
          id: "routines_logged",
          label: "Routines Logged",
          description: "Performances recorded",
          category: "universal",
        },
        {
          id: "stuck_landings",
          label: "Stuck Landings",
          description: "Landings with no deductions",
          category: "sport_specific",
        },
        {
          id: "podiums",
          label: "Podium Finishes",
          description: "Top-three placements",
          category: "sport_specific",
        },
      ],
      secondary: [
        {
          id: "event_balance",
          label: "Event Balance",
          description: "Performance across apparatus",
          category: "sport_specific",
        },
        {
          id: "upgrade_progress",
          label: "Upgrade Progress",
          description: "New skills added this season",
          category: "sport_specific",
        },
      ],
    },
  },
};

export const DEFAULT_SPORT_ID = SPORTS.tennis.id;
export type SupportedSportId = keyof typeof SPORTS;
