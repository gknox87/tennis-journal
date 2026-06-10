
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Trophy, Target, CheckCircle2, Award } from "lucide-react";
import type { SportMetadata, ScoreFormat } from "@/types/sport";
import { parseTimeToSeconds } from "@/utils/sportHelpers";
import { autoCompleteScore, autoCompleteTiebreakScore } from "@/utils/scoreAutoComplete";

interface SetScore {
  playerScore: string;
  opponentScore: string;
  playerTiebreak?: string;
  opponentTiebreak?: string;
}

interface ScoreInputProps {
  sets: SetScore[];
  onSetsChange: (sets: SetScore[]) => void;
  isBestOfFive: boolean;
  onBestOfFiveChange: (value: boolean) => void;
  onIsWinChange?: (value: boolean) => void;
  onFinalSetTiebreakChange?: (value: boolean) => void;
  sport: SportMetadata;
  activeFormat?: ScoreFormat;
  setErrors?: Record<number, string>;
  scoreError?: string;
}

export const ScoreInput = ({
  sets,
  onSetsChange,
  isBestOfFive,
  onBestOfFiveChange,
  onIsWinChange,
  onFinalSetTiebreakChange,
  sport,
  activeFormat,
  setErrors,
  scoreError,
}: ScoreInputProps) => {
  const format = activeFormat ?? sport.defaultScoreFormat;
  const isSetBased = format.type === "sets";
  const isRallyFormat = format.type === "rally";
  const isGamesFormat = format.type === "games";
  const showBestOfToggle = isSetBased;
  const rallyPointsTarget = format.type === "rally" ? format.pointsToWin : undefined;
  const rallyWinBy = format.type === "rally" ? format.winBy : undefined;
  const scoreMaxValue = format.type === "sets" ? 7 : undefined;

  const [matchStatus, setMatchStatus] = useState<{
    playerWon: boolean;
    matchComplete: boolean;
    playerSetsWon?: number;
    opponentSetsWon?: number;
    playerGamesWon?: number;
    opponentGamesWon?: number;
  }>({ playerWon: false, matchComplete: false });

  // Local state for immediate visual feedback on keystroke
  const [localSets, setLocalSets] = useState<SetScore[]>(sets);

  // Sync local state when parent prop changes (e.g. auto-complete, reset)
  useEffect(() => {
    setLocalSets(sets);
  }, [sets]);

  // Pure match status computation (no side effects like onIsWinChange)
  const computeMatchStatus = (updatedSets: SetScore[]) => {
    if (isSetBased) {
      let playerSetsWon = 0;
      let opponentSetsWon = 0;

      updatedSets.forEach((set) => {
        const playerScore = parseInt(set.playerScore);
        const opponentScore = parseInt(set.opponentScore);

        if (!isNaN(playerScore) && !isNaN(opponentScore)) {
          if (playerScore === 6 && opponentScore === 6) {
            const playerTiebreak = parseInt(set.playerTiebreak || "0");
            const opponentTiebreak = parseInt(set.opponentTiebreak || "0");

            if (
              !isNaN(playerTiebreak) &&
              !isNaN(opponentTiebreak) &&
              Math.abs(playerTiebreak - opponentTiebreak) >= 2
            ) {
              if (playerTiebreak > opponentTiebreak) {
                playerSetsWon++;
              } else {
                opponentSetsWon++;
              }
            }
          } else if (playerScore === 7 && opponentScore === 6) {
            playerSetsWon++;
          } else if (playerScore === 6 && opponentScore === 7) {
            opponentSetsWon++;
          } else if (playerScore > opponentScore && playerScore >= 6) {
            playerSetsWon++;
          } else if (opponentScore > playerScore && opponentScore >= 6) {
            opponentSetsWon++;
          }
        }
      });

      const setsNeededToWin = isBestOfFive ? 3 : 2;
      const matchComplete = playerSetsWon >= setsNeededToWin || opponentSetsWon >= setsNeededToWin;
      const playerWon = playerSetsWon >= setsNeededToWin;

      return { playerWon, matchComplete, playerSetsWon, opponentSetsWon };
    }

    if (isRallyFormat) {
      let playerGamesWon = 0;
      let opponentGamesWon = 0;

      updatedSets.forEach((set) => {
        const playerScore = parseInt(set.playerScore);
        const opponentScore = parseInt(set.opponentScore);
        if (isNaN(playerScore) || isNaN(opponentScore)) return;

        const diff = Math.abs(playerScore - opponentScore);
        const playerWins =
          playerScore >= (rallyPointsTarget ?? 0) &&
          diff >= (rallyWinBy ?? 2) &&
          playerScore > opponentScore;
        const opponentWins =
          opponentScore >= (rallyPointsTarget ?? 0) &&
          diff >= (rallyWinBy ?? 2) &&
          opponentScore > playerScore;

        if (playerWins) playerGamesWon++;
        if (opponentWins) opponentGamesWon++;
      });

      const seriesLength = format.bestOf ?? updatedSets.length;
      const gamesNeeded = Math.floor(seriesLength / 2) + 1;
      const matchComplete = playerGamesWon >= gamesNeeded || opponentGamesWon >= gamesNeeded;
      const playerWon = playerGamesWon >= gamesNeeded && playerGamesWon > opponentGamesWon;

      return { playerWon, matchComplete, playerGamesWon, opponentGamesWon };
    }

    return { playerWon: false, matchComplete: false };
  };

  // Calculate match status whenever sets change — pure computation only, no parent state updates
  useEffect(() => {
    const status = computeMatchStatus(sets);
    setMatchStatus(status);
  }, [sets]);

  const unitLabel = (() => {
    switch (format.type) {
      case "sets":
        return "Set";
      case "rally":
        return "Game";
      case "games":
        return "Set";
      case "time":
        return "Result";
      case "distance":
        return format.unit ? `${format.unit} Entry` : "Distance";
      case "numeric":
        return format.unit ? `${format.unit} Entry` : "Score";
      case "rounds":
        return "Round";
      default:
        return "Entry";
    }
  })();
  
  const calculateWinner = (updatedSets: SetScore[]) => {
    if (!onIsWinChange) return { playerWon: false, matchComplete: false };

    if (isSetBased) {
      let playerSetsWon = 0;
      let opponentSetsWon = 0;

      updatedSets.forEach((set) => {
        const playerScore = parseInt(set.playerScore);
        const opponentScore = parseInt(set.opponentScore);

        if (!isNaN(playerScore) && !isNaN(opponentScore)) {
          if (playerScore === 6 && opponentScore === 6) {
            const playerTiebreak = parseInt(set.playerTiebreak || "0");
            const opponentTiebreak = parseInt(set.opponentTiebreak || "0");

            if (
              !isNaN(playerTiebreak) &&
              !isNaN(opponentTiebreak) &&
              Math.abs(playerTiebreak - opponentTiebreak) >= 2
            ) {
              if (playerTiebreak > opponentTiebreak) {
                playerSetsWon++;
              } else {
                opponentSetsWon++;
              }
            }
          } else if (playerScore === 7 && opponentScore === 6) {
            playerSetsWon++;
          } else if (playerScore === 6 && opponentScore === 7) {
            opponentSetsWon++;
          } else if (playerScore > opponentScore && playerScore >= 6) {
            playerSetsWon++;
          } else if (opponentScore > playerScore && opponentScore >= 6) {
            opponentSetsWon++;
          }
        }
      });

      const setsNeededToWin = isBestOfFive ? 3 : 2;
      const matchComplete = playerSetsWon >= setsNeededToWin || opponentSetsWon >= setsNeededToWin;
      const playerWon = playerSetsWon >= setsNeededToWin;

      onIsWinChange(playerWon);
      return { playerWon, matchComplete, playerSetsWon, opponentSetsWon };
    }

    if (isRallyFormat) {
      let playerGamesWon = 0;
      let opponentGamesWon = 0;

      updatedSets.forEach((set) => {
        const playerScore = parseInt(set.playerScore);
        const opponentScore = parseInt(set.opponentScore);
        if (isNaN(playerScore) || isNaN(opponentScore)) return;

        const diff = Math.abs(playerScore - opponentScore);
        const playerWins =
          playerScore >= (rallyPointsTarget ?? 0) &&
          diff >= (rallyWinBy ?? 2) &&
          playerScore > opponentScore;
        const opponentWins =
          opponentScore >= (rallyPointsTarget ?? 0) &&
          diff >= (rallyWinBy ?? 2) &&
          opponentScore > playerScore;

        if (playerWins) playerGamesWon++;
        if (opponentWins) opponentGamesWon++;
      });

      const seriesLength = format.bestOf ?? updatedSets.length;
      const gamesNeeded = Math.floor(seriesLength / 2) + 1;
      const matchComplete = playerGamesWon >= gamesNeeded || opponentGamesWon >= gamesNeeded;
      const playerWon = playerGamesWon >= gamesNeeded && playerGamesWon > opponentGamesWon;

      onIsWinChange(playerWon);
      return { playerWon, matchComplete, playerGamesWon, opponentGamesWon };
    }

    return { playerWon: false, matchComplete: false };
  };

  const checkForTiebreak = (updatedSets: SetScore[]) => {
    if (!onFinalSetTiebreakChange || !isSetBased) return;

    const lastPlayedSetIndex = updatedSets.findIndex(set => 
      set.playerScore === "" && set.opponentScore === ""
    ) - 1;

    const lastPlayedSet = lastPlayedSetIndex >= 0 ? updatedSets[lastPlayedSetIndex] : updatedSets[updatedSets.length - 1];
    
    if (lastPlayedSet && lastPlayedSet.playerScore !== "" && lastPlayedSet.playerScore !== undefined && lastPlayedSet.opponentScore !== "" && lastPlayedSet.opponentScore !== undefined) {
      const playerScore = parseInt(lastPlayedSet.playerScore);
      const opponentScore = parseInt(lastPlayedSet.opponentScore);
      
      // Check if it's a tiebreak situation:
      // 1. Both players at 6-6 AND tiebreak scores exist (set-level tiebreak)
      // 2. BOTH scores > 7 (extended tiebreak format, e.g. padel match tiebreak at 1-1)
      // Score like 10-5 or 8-3 is NOT a tiebreak — invalid in any format
      const isTiebreak = !isNaN(playerScore) && !isNaN(opponentScore) &&
        ((playerScore === 6 && opponentScore === 6 && (lastPlayedSet.playerTiebreak || lastPlayedSet.opponentTiebreak)) ||
         (playerScore > 7 && opponentScore > 7));
      
      // Ensure we pass a boolean value
      onFinalSetTiebreakChange(Boolean(isTiebreak));
    }
  };

  const handleSetScoreChange = (index: number, field: keyof SetScore, value: string) => {
    const newSets = [...localSets];
    newSets[index] = { ...newSets[index], [field]: value };

    // Auto-complete logic for regular scores
    //   1. The user is editing the PLAYER score field
    //   2. The player score is non-empty
    //   3. The opponent score is genuinely empty ("" or undefined)
    // NEVER overwrite an existing opponent value — including "0"
    if (field === 'playerScore' && value !== "") {
      const currentValue = parseInt(value);
      const existingOpponent = newSets[index].opponentScore;

      // Only auto-complete if opponent field is truly empty
      if ((existingOpponent === "" || existingOpponent === undefined) && !isNaN(currentValue) && currentValue >= 0) {
        const autoCompletedValue = autoCompleteScore(
          currentValue,
          "",
          format,
          sport.id
        );

        if (autoCompletedValue !== "") {
          newSets[index].opponentScore = autoCompletedValue;
        }
      }
    }

    // Auto-complete tiebreak scores for set-based formats
    if (
      isSetBased &&
      (field === 'playerTiebreak' || field === 'opponentTiebreak') &&
      value !== ""
    ) {
      const currentValue = parseInt(value);
      const otherField = field === 'playerTiebreak' ? 'opponentTiebreak' : 'playerTiebreak';
      const currentOtherValue = newSets[index][otherField];

      if (!isNaN(currentValue) && currentValue >= 0) {
        const isMatchTiebreak = format.type === "sets" && format.matchTiebreak;
        const autoCompletedValue = autoCompleteTiebreakScore(
          currentValue,
          currentOtherValue ? parseInt(currentOtherValue) : null,
          isMatchTiebreak
        );

        // Only auto-complete if the other field is empty
        if (!currentOtherValue || currentOtherValue === "") {
          newSets[index][otherField] = autoCompletedValue !== null ? autoCompletedValue.toString() : "";
        }
      }
    }

    // Update local state immediately for instant visual feedback
    console.log(`[SCORE-TRACE] newSets AFTER all logic:`, JSON.stringify(newSets.map(s => ({p: s.playerScore, o: s.opponentScore}))));
    setLocalSets(newSets);
    onSetsChange(newSets);
    const status = calculateWinner(newSets);
    setMatchStatus(status || { playerWon: false, matchComplete: false });
    checkForTiebreak(newSets);
  };

  const needsTiebreak = (set: SetScore) => {
    if (!isSetBased) return false;
    const playerScore = parseInt(set.playerScore);
    const opponentScore = parseInt(set.opponentScore);
    return playerScore === 6 && opponentScore === 6;
  };

  // Smart filtering: only show sets up to match completion + 1 empty set
  const getVisibleSets = () => {
    if (!matchStatus.matchComplete) {
      // Match not complete - show all sets
      return localSets;
    }

    // Match complete - find last completed set and show only up to there
    const lastCompletedIndex = localSets.findIndex((set, index) => {
      const isEmpty = !set.playerScore && !set.opponentScore;
      return isEmpty;
    });

    if (lastCompletedIndex === -1) {
      // All sets have scores
      return localSets;
    }

    // Show completed sets only
    return localSets.slice(0, lastCompletedIndex);
  };

  const visibleSets = getVisibleSets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600">
            <Target className="w-5 h-5 text-white" />
          </div>
          <Label className="text-lg font-bold text-gray-800">{unitLabel} Scores</Label>
        </div>
        {showBestOfToggle && (
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border-2 border-purple-200/50">
            <Switch
              id="best-of-five"
              checked={isBestOfFive}
              onCheckedChange={onBestOfFiveChange}
              className="data-[state=checked]:bg-purple-500"
            />
            <Label htmlFor="best-of-five" className="font-semibold text-gray-700">
              Best of {isBestOfFive ? "5" : "3"}
            </Label>
          </div>
        )}
      </div>

      {/* Match Complete Banner */}
      {matchStatus.matchComplete && (
        <div className={`p-4 rounded-2xl border-2 ${matchStatus.playerWon ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300'}`}>
          <div className="flex items-center justify-center gap-3">
            {matchStatus.playerWon ? (
              <>
                <Award className="w-6 h-6 text-green-600" />
                <p className="text-lg font-bold text-green-800">
                  Match Won!
                  {isSetBased && ` ${matchStatus.playerSetsWon}-${matchStatus.opponentSetsWon}`}
                  {isRallyFormat && ` ${matchStatus.playerGamesWon}-${matchStatus.opponentGamesWon}`}
                </p>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </>
            ) : (
              <>
                <Target className="w-6 h-6 text-orange-600" />
                <p className="text-lg font-bold text-orange-800">
                  Match Complete
                  {isSetBased && ` ${matchStatus.playerSetsWon}-${matchStatus.opponentSetsWon}`}
                  {isRallyFormat && ` ${matchStatus.playerGamesWon}-${matchStatus.opponentGamesWon}`}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {scoreError && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-200" data-field-error="score">
          {scoreError}
        </p>
      )}

      <Card className={`p-6 rounded-2xl bg-gradient-to-br from-white/80 to-orange-50/30 backdrop-blur-sm border-2 ${
        scoreError || setErrors ? "border-red-300/60" : "border-orange-200/30"
      }`}>
        <div className="space-y-6">
          {visibleSets.map((set, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  {unitLabel} {index + 1}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-500" />
                    You
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={set.playerScore}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, '');
                      if (scoreMaxValue === undefined || v === '' || parseInt(v) <= scoreMaxValue) {
                        handleSetScoreChange(index, 'playerScore', v);
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    aria-invalid={!!setErrors?.[index]}
                    className={`h-12 text-xl font-bold text-center rounded-2xl bg-white/90 border-2 transition-all duration-300 hover:shadow-lg ${
                      setErrors?.[index]
                        ? "border-red-400 bg-red-50/50 focus:border-red-500"
                        : "border-blue-200/50 focus:border-blue-400"
                    }`}
                    placeholder="0"
                    aria-label={`Your score for ${unitLabel} ${index + 1}`}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-500" />
                    Opponent
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={set.opponentScore}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, '');
                      if (scoreMaxValue === undefined || v === '' || parseInt(v) <= scoreMaxValue) {
                        handleSetScoreChange(index, 'opponentScore', v);
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    aria-invalid={!!setErrors?.[index]}
                    className={`h-12 text-xl font-bold text-center rounded-2xl bg-white/90 border-2 transition-all duration-300 hover:shadow-lg ${
                      setErrors?.[index]
                        ? "border-red-400 bg-red-50/50 focus:border-red-500"
                        : "border-red-200/50 focus:border-red-400"
                    }`}
                    placeholder="0"
                    aria-label={`Opponent score for ${unitLabel} ${index + 1}`}
                  />
                </div>
              </div>

              {setErrors?.[index] && (
                <p className="text-sm text-red-500 text-center" data-field-error={`set-${index}`}>
                  {setErrors[index]}
                </p>
              )}

              {/* Tiebreak inputs when scores are 6-6 */}
              {needsTiebreak(set) && (
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200/50">
                  <div className="text-center mb-3">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      🎾 Tiebreak
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-600">Your Tiebreak</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={set.playerTiebreak || ""}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, '');
                          handleSetScoreChange(index, 'playerTiebreak', v);
                        }}
                        onFocus={(e) => e.target.select()}
                        className="h-10 text-lg font-bold text-center rounded-xl bg-white/90 border-2 border-blue-200/50 focus:border-blue-400"
                        placeholder="0"
                        aria-label={`Your tiebreak score for ${unitLabel} ${index + 1}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-600">Opponent Tiebreak</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={set.opponentTiebreak || ""}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, '');
                          handleSetScoreChange(index, 'opponentTiebreak', v);
                        }}
                        onFocus={(e) => e.target.select()}
                        className="h-10 text-lg font-bold text-center rounded-xl bg-white/90 border-2 border-red-200/50 focus:border-red-400"
                        placeholder="0"
                        aria-label={`Opponent tiebreak score for ${unitLabel} ${index + 1}`}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {index < localSets.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/30">
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>Quick Tip:</strong> Enter YOUR score (the lower one) and the opponent's winning score will be auto-filled!
            {format.type === "sets" && " Tennis/Padel: 4 → 6, 5 → 7. "}
            {format.type === "rally" && format.pointsToWin === 11 && " Table Tennis/Squash: 9 → 11, 10 → 12, 11 → 13. "}
            {format.type === "rally" && format.pointsToWin === 21 && " Badminton: 19 → 21, 20 → 22, 21 → 23. "}
            {format.type === "sets" && "Tie-breaks appear at 6-6."}
          </p>
        </div>
      </Card>
    </div>
  );
};
