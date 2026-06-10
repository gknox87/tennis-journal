import type { SetScore } from "@/types/match";
import type { ScoreFormat } from "@/types/sport";
import { validateScoreInput } from "@/utils/sportHelpers";

export interface MatchFormErrors {
  opponent?: string;
  partner?: string;
  score?: string;
  sets?: Record<number, string>;
}

export interface MatchFormValidationInput {
  opponent: string;
  partner?: string;
  matchType?: "singles" | "doubles";
  sets: SetScore[];
  scoreFormat: ScoreFormat;
  sportId?: string;
  universalPlayerScore?: string;
  supportsDoubles?: boolean;
}

function isSetEmpty(set: SetScore): boolean {
  return set.playerScore === "" && set.opponentScore === "";
}

function isValidTiebreak(
  playerTb: number,
  opponentTb: number,
  isMatchTiebreak: boolean
): boolean {
  const target = isMatchTiebreak ? 10 : 7;
  const winner = Math.max(playerTb, opponentTb);
  const loser = Math.min(playerTb, opponentTb);
  return winner >= target && winner - loser >= 2;
}

function validateTennisSet(
  set: SetScore,
  isMatchTiebreak: boolean
): { complete: boolean; error?: string } {
  const p = parseInt(set.playerScore);
  const o = parseInt(set.opponentScore);

  if (isNaN(p) || isNaN(o)) {
    return { complete: false, error: "Scores must be numbers" };
  }

  if (p === 0 && o === 0) {
    return { complete: false, error: "0-0 is not a completed set — enter the final score" };
  }

  if (p === 6 && o === 6) {
    const pt = set.playerTiebreak ?? "";
    const ot = set.opponentTiebreak ?? "";
    if (pt === "" || ot === "") {
      return { complete: false, error: "At 6-6, enter tie-break scores to decide the set" };
    }
    const pTb = parseInt(pt);
    const oTb = parseInt(ot);
    if (isNaN(pTb) || isNaN(oTb)) {
      return { complete: false, error: "Tie-break scores must be numbers" };
    }
    if (!isValidTiebreak(pTb, oTb, isMatchTiebreak)) {
      const target = isMatchTiebreak ? 10 : 7;
      return { complete: false, error: `Tie-break must reach ${target} points and be won by 2` };
    }
    return { complete: true };
  }

  if ((p === 7 && o === 6) || (p === 6 && o === 7)) {
    return { complete: true };
  }

  if ((p === 6 && o >= 0 && o <= 4) || (o === 6 && p >= 0 && p <= 4)) {
    return { complete: true };
  }

  if ((p === 7 && o === 5) || (o === 7 && p === 5)) {
    return { complete: true };
  }

  if (isMatchTiebreak && p > 7 && o > 7) {
    if (isValidTiebreak(p, o, true)) {
      return { complete: true };
    }
    return { complete: false, error: "Match tie-break must reach 10 points and be won by 2" };
  }

  return {
    complete: false,
    error: "Not a valid set score (e.g. 6-4, 7-5, 7-6, or 6-6 with tie-break)",
  };
}

function validateRallyGame(
  set: SetScore,
  format: ScoreFormat & { type: "rally" },
  sportId?: string
): { complete: boolean; error?: string } {
  const p = parseInt(set.playerScore);
  const o = parseInt(set.opponentScore);

  if (isNaN(p) || isNaN(o)) {
    return { complete: false, error: "Scores must be numbers" };
  }

  if (p === 0 && o === 0) {
    return { complete: false, error: "Enter a completed game score" };
  }

  const diff = Math.abs(p - o);
  const target = format.pointsToWin;
  const winBy = format.winBy;

  if (sportId === "badminton" && ((p === 30 && o === 29) || (o === 30 && p === 29))) {
    return { complete: true };
  }

  const playerWins = p >= target && diff >= winBy && p > o;
  const opponentWins = o >= target && diff >= winBy && o > p;

  if (!playerWins && !opponentWins) {
    return {
      complete: false,
      error: `Game must be won at ${target}+ points, by ${winBy}`,
    };
  }

  if (sportId === "badminton" && Math.max(p, o) > 30) {
    return { complete: false, error: "Badminton games cannot exceed 30 points" };
  }

  return { complete: true };
}

function validateGamesSet(set: SetScore): { complete: boolean; error?: string } {
  const p = parseInt(set.playerScore);
  const o = parseInt(set.opponentScore);

  if (isNaN(p) || isNaN(o)) {
    return { complete: false, error: "Scores must be numbers" };
  }

  if (p === 0 && o === 0) {
    return { complete: false, error: "Enter a completed score" };
  }

  if (p === o) {
    return { complete: false, error: "Scores cannot be tied" };
  }

  return { complete: true };
}

export function validateMatchForm(input: MatchFormValidationInput): MatchFormErrors {
  const errors: MatchFormErrors = {};
  const isSetBased =
    input.scoreFormat.type === "sets" ||
    input.scoreFormat.type === "rally" ||
    input.scoreFormat.type === "games";

  if (!input.opponent.trim()) {
    errors.opponent = "Enter an opponent name";
  }

  if (input.supportsDoubles && input.matchType === "doubles" && !input.partner?.trim()) {
    errors.partner = "Enter your partner's name";
  }

  if (isSetBased) {
    const setErrors: Record<number, string> = {};
    let completedCount = 0;
    let hasEnteredSet = false;

    input.sets.forEach((set, index) => {
      if (isSetEmpty(set)) return;

      hasEnteredSet = true;

      if (set.playerScore === "" || set.opponentScore === "") {
        setErrors[index] = "Enter both scores for this set";
        return;
      }

      let result: { complete: boolean; error?: string };
      if (input.scoreFormat.type === "sets") {
        result = validateTennisSet(set, !!input.scoreFormat.matchTiebreak);
      } else if (input.scoreFormat.type === "rally") {
        result = validateRallyGame(set, input.scoreFormat, input.sportId);
      } else {
        result = validateGamesSet(set);
      }

      if (result.error) {
        setErrors[index] = result.error;
      } else if (result.complete) {
        completedCount++;
      }
    });

    if (Object.keys(setErrors).length > 0) {
      errors.sets = setErrors;
    }

    if (completedCount === 0) {
      errors.score = hasEnteredSet
        ? "Fix the score errors below before saving"
        : "Enter at least one completed set score";
    }
  } else {
    const playerScore = input.universalPlayerScore ?? input.sets[0]?.playerScore ?? "";
    if (!playerScore.trim()) {
      errors.score = "Enter your score";
    } else if (!validateScoreInput(playerScore, input.scoreFormat)) {
      errors.score = "Enter a valid score";
    }
  }

  return errors;
}

export function hasMatchFormErrors(errors: MatchFormErrors): boolean {
  return !!(
    errors.opponent ||
    errors.partner ||
    errors.score ||
    (errors.sets && Object.keys(errors.sets).length > 0)
  );
}
