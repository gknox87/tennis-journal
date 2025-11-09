
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

  // Calculate match status whenever sets change
  useEffect(() => {
    const status = calculateWinner(sets);
    setMatchStatus(status || { playerWon: false, matchComplete: false });
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
    
    if (lastPlayedSet && lastPlayedSet.playerScore && lastPlayedSet.opponentScore) {
      const playerScore = parseInt(lastPlayedSet.playerScore);
      const opponentScore = parseInt(lastPlayedSet.opponentScore);
      
      // Check if it's a tiebreak situation
      const isTiebreak = !isNaN(playerScore) && !isNaN(opponentScore) && 
        ((playerScore === 6 && opponentScore === 6 && (lastPlayedSet.playerTiebreak || lastPlayedSet.opponentTiebreak)) ||
         (playerScore > 7 || opponentScore > 7));
      
      // Ensure we pass a boolean value
      onFinalSetTiebreakChange(Boolean(isTiebreak));
    }
  };

  const handleSetScoreChange = (index: number, field: keyof SetScore, value: string) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };

    // Auto-complete logic for regular scores
    // Only auto-complete when the player enters their score, not when opponent enters theirs
    if (field === 'playerScore' && value !== "") {
      const currentValue = parseInt(value);
      const otherField = 'opponentScore';
      const currentOtherValue = newSets[index][otherField];

      // Use the new auto-complete logic
      if (!isNaN(currentValue) && currentValue >= 0) {
        const autoCompletedValue = autoCompleteScore(
          currentValue,
          "", // Always pass empty to force recalculation
          format,
          sport.id
        );

        // Always update the opponent score when player score changes
        newSets[index][otherField] = autoCompletedValue;
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

    onSetsChange(newSets);
    calculateWinner(newSets);
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
      return sets;
    }

    // Match complete - find last completed set and show only up to there
    const lastCompletedIndex = sets.findIndex((set, index) => {
      const isEmpty = !set.playerScore && !set.opponentScore;
      return isEmpty;
    });

    if (lastCompletedIndex === -1) {
      // All sets have scores
      return sets;
    }

    // Show completed sets only
    return sets.slice(0, lastCompletedIndex);
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

      <Card className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-orange-50/30 backdrop-blur-sm border-2 border-orange-200/30">
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
                    type="number"
                    value={set.playerScore}
                    onChange={(e) => handleSetScoreChange(index, 'playerScore', e.target.value)}
                    className="h-12 text-xl font-bold text-center rounded-2xl bg-white/90 border-2 border-blue-200/50 focus:border-blue-400 transition-all duration-300 hover:shadow-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="0"
                    max={scoreMaxValue}
                    placeholder=""
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-500" />
                    Opponent
                  </Label>
                  <Input
                    type="number"
                    value={set.opponentScore}
                    onChange={(e) => handleSetScoreChange(index, 'opponentScore', e.target.value)}
                    className="h-12 text-xl font-bold text-center rounded-2xl bg-white/90 border-2 border-red-200/50 focus:border-red-400 transition-all duration-300 hover:shadow-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="0"
                    max={scoreMaxValue}
                    placeholder=""
                  />
                </div>
              </div>

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
                        type="number"
                        value={set.playerTiebreak || ""}
                        onChange={(e) => handleSetScoreChange(index, 'playerTiebreak', e.target.value)}
                        className="h-10 text-lg font-bold text-center rounded-xl bg-white/90 border-2 border-blue-200/50 focus:border-blue-400"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-600">Opponent Tiebreak</Label>
                      <Input
                        type="number"
                        value={set.opponentTiebreak || ""}
                        onChange={(e) => handleSetScoreChange(index, 'opponentTiebreak', e.target.value)}
                        className="h-10 text-lg font-bold text-center rounded-xl bg-white/90 border-2 border-red-200/50 focus:border-red-400"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {index < sets.length - 1 && (
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
