import type { ScoreFormat } from "@/types/sport";

/**
 * Auto-complete scoring logic for different racket sports
 * Follows official rules for each sport
 */

/**
 * Tennis/Padel Auto-Complete Rules:
 * - If player enters 0-5, opponent gets 6
 * - If player enters 6, opponent gets 4 (most common winning score)
 * - If player enters 7, opponent gets 5 or 6
 * - Handles tiebreaks at 6-6
 */
export function autoCompleteTennisScore(
  playerScore: number,
  currentOpponentScore: number | null
): number | null {
  // Don't override if opponent already has a valid score (including 0)
  if (currentOpponentScore !== null && !isNaN(currentOpponentScore) && currentOpponentScore >= 0) {
    // If both scores are set, check if they make sense together
    if (playerScore === 6 && currentOpponentScore === 6) {
      // 6-6 is valid (tiebreak scenario)
      return 6;
    }
    return currentOpponentScore;
  }

  // Auto-complete logic based on player score
  if (playerScore <= 4) {
    // Player lost the set 0-6, 1-6, 2-6, 3-6, 4-6
    return 6;
  } else if (playerScore === 5) {
    // Player lost 5-7
    return 7;
  } else if (playerScore === 6) {
    // Player won 6-4 (most common)
    return 4;
  } else if (playerScore === 7) {
    // Player won 7-5 or 7-6 (prefer 7-5)
    return 5;
  }

  return null;
}

/**
 * Table Tennis Auto-Complete Rules:
 * - Games to 11 points, must win by 2
 * - Enter the LOWER score, get the HIGHER (winning) score
 * - If player enters 0-9, opponent gets 11 (standard loss)
 * - If player enters 10+, opponent gets playerScore + 2 (deuce loss - opponent wins by 2)
 */
export function autoCompleteTableTennisScore(
  playerScore: number,
  currentOpponentScore: number | null
): number | null {
  // Don't override if opponent already has a valid score (including 0)
  if (currentOpponentScore !== null && !isNaN(currentOpponentScore) && currentOpponentScore >= 0) {
    return currentOpponentScore;
  }

  // If player entered 11 or higher, this could be a winning score
  // Don't auto-complete opponent score for potential wins
  if (playerScore >= 11) {
    return null;
  }

  if (playerScore <= 9) {
    // Player lost 0-11 through 9-11 (standard loss)
    return 11;
  } else if (playerScore === 10) {
    // Player lost 10-12 (deuce loss)
    return 12;
  }

  return null;
}

/**
 * Badminton Auto-Complete Rules:
 * - Games to 21 points, must win by 2, capped at 30
 * - Enter the LOWER score, get the HIGHER (winning) score
 * - If player enters 0-19, opponent gets 21 (standard loss)
 * - If player enters 20-28, opponent gets playerScore + 2 (deuce loss)
 * - If player enters 29, opponent gets 30 (maximum - golden point)
 */
export function autoCompleteBadmintonScore(
  playerScore: number,
  currentOpponentScore: number | null
): number | null {
  // Don't override if opponent already has a valid score (including 0)
  if (currentOpponentScore !== null && !isNaN(currentOpponentScore) && currentOpponentScore >= 0) {
    return currentOpponentScore;
  }

  // If player entered 21 or higher, this could be a winning score
  // Don't auto-complete opponent score for potential wins
  if (playerScore >= 21) {
    return null;
  }

  if (playerScore <= 19) {
    // Player lost 0-21 through 19-21 (standard loss)
    return 21;
  } else if (playerScore === 20) {
    // Player lost 20-22 (deuce loss)
    return 22;
  } else if (playerScore >= 21 && playerScore <= 28) {
    // These could be winning scores, don't auto-complete
    return null;
  } else if (playerScore === 29) {
    // This could be a winning score (29-30), don't auto-complete
    return null;
  }

  return null;
}

/**
 * Squash Auto-Complete Rules:
 * - Games to 11 points, must win by 2
 * - Same logic as table tennis
 */
export function autoCompleteSquashScore(
  playerScore: number,
  currentOpponentScore: number | null
): number | null {
  // Squash uses same rules as table tennis
  return autoCompleteTableTennisScore(playerScore, currentOpponentScore);
}

/**
 * Pickleball Auto-Complete Rules:
 * - Games can be to 11, 15, or 21 points, must win by 2
 * - Only auto-complete for clear losing scores
 * - Don't auto-complete for potential winning scores
 */
export function autoCompletePickleballScore(
  playerScore: number,
  currentOpponentScore: number | null,
  pointsToWin: number = 11
): number | null {
  // Don't override if opponent already has a valid score (including 0)
  if (currentOpponentScore !== null && !isNaN(currentOpponentScore) && currentOpponentScore >= 0) {
    return currentOpponentScore;
  }

  // If player entered pointsToWin or higher, this could be a winning score
  // Don't auto-complete opponent score for potential wins
  if (playerScore >= pointsToWin) {
    return null;
  }

  const deucePoint = pointsToWin - 1;

  if (playerScore < deucePoint) {
    // Player lost (e.g., 0-10 for pointsToWin=11 → opponent gets 11)
    return pointsToWin;
  } else if (playerScore === deucePoint) {
    // Player at deuce and lost (e.g., 10 for pointsToWin=11 → opponent gets 12)
    return pointsToWin + 1;
  }

  return null;
}

/**
 * Main auto-complete function that routes to the appropriate sport-specific logic
 */
export function autoCompleteScore(
  playerScore: string | number,
  currentOpponentScore: string | number,
  format: ScoreFormat,
  sportId?: string
): string {
  const playerNum = typeof playerScore === 'string' ? parseInt(playerScore) : playerScore;
  const opponentNum = typeof currentOpponentScore === 'string' ? parseInt(currentOpponentScore) : currentOpponentScore;

  // If player score is invalid, return current opponent score
  if (isNaN(playerNum) || playerNum < 0) {
    return currentOpponentScore.toString();
  }

  // Get current opponent score (null if invalid or empty)
  // Preserve 0 as a valid score — only treat empty/NaN as null
  const currentOpponent = (isNaN(opponentNum) || currentOpponentScore === "") ? null : opponentNum;

  let autoCompletedScore: number | null = null;

  // Route to appropriate auto-complete logic based on format type
  if (format.type === "sets") {
    // Tennis or Padel
    autoCompletedScore = autoCompleteTennisScore(playerNum, currentOpponent);
  } else if (format.type === "rally") {
    // Table Tennis, Badminton, Squash, or Pickleball
    const pointsToWin = format.pointsToWin;

    if (pointsToWin === 11) {
      // Could be Table Tennis, Squash, or Pickleball
      if (sportId === "table_tennis") {
        autoCompletedScore = autoCompleteTableTennisScore(playerNum, currentOpponent);
      } else if (sportId === "squash") {
        autoCompletedScore = autoCompleteSquashScore(playerNum, currentOpponent);
      } else if (sportId === "pickleball") {
        autoCompletedScore = autoCompletePickleballScore(playerNum, currentOpponent, 11);
      } else {
        // Default to table tennis rules for 11-point games
        autoCompletedScore = autoCompleteTableTennisScore(playerNum, currentOpponent);
      }
    } else if (pointsToWin === 15) {
      // Pickleball 15
      autoCompletedScore = autoCompletePickleballScore(playerNum, currentOpponent, 15);
    } else if (pointsToWin === 21) {
      // Badminton or Pickleball 21
      if (sportId === "badminton") {
        autoCompletedScore = autoCompleteBadmintonScore(playerNum, currentOpponent);
      } else if (sportId === "pickleball") {
        autoCompletedScore = autoCompletePickleballScore(playerNum, currentOpponent, 21);
      } else {
        // Default to badminton rules for 21-point games
        autoCompletedScore = autoCompleteBadmintonScore(playerNum, currentOpponent);
      }
    }
  }

  // Return auto-completed score or empty string if nothing to auto-complete
  if (autoCompletedScore !== null) {
    return autoCompletedScore.toString();
  }

  // If no auto-complete happened, return current opponent score (preserving "0")
  return currentOpponentScore === "" ? "" : currentOpponentScore.toString();
}

/**
 * Auto-complete tiebreak scores for tennis/padel
 * Standard tiebreaks: first to 7, must win by 2
 * Match tiebreaks: first to 10, must win by 2
 */
export function autoCompleteTiebreakScore(
  playerScore: number,
  currentOpponentScore: number | null,
  isMatchTiebreak: boolean = false
): number | null {
  const targetPoints = isMatchTiebreak ? 10 : 7;
  const deucePoint = targetPoints - 1;

  // Don't override if opponent already has a valid score (including 0)
  if (currentOpponentScore !== null && !isNaN(currentOpponentScore) && currentOpponentScore >= 0) {
    return currentOpponentScore;
  }

  if (playerScore < deucePoint) {
    // Player lost (e.g., 0-7 through 5-7 for standard tiebreak)
    return targetPoints;
  } else if (playerScore === deucePoint) {
    // Deuce situation: player lost (e.g., 6-8 for standard tiebreak)
    return targetPoints + 1;
  } else if (playerScore === targetPoints) {
    // Player won (e.g., 7-5 for standard tiebreak)
    return deucePoint - 1;
  } else if (playerScore === targetPoints + 1) {
    // Player won in deuce (e.g., 8-6 for standard tiebreak)
    return deucePoint;
  } else if (playerScore > targetPoints + 1) {
    // Extended deuce: player won by 2
    return playerScore - 2;
  }

  return null;
}
