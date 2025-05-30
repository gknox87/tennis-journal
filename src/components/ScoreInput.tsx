
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Trophy, Target } from "lucide-react";

interface SetScore {
  playerScore: string;
  opponentScore: string;
}

interface ScoreInputProps {
  sets: SetScore[];
  onSetsChange: (sets: SetScore[]) => void;
  isBestOfFive: boolean;
  onBestOfFiveChange: (value: boolean) => void;
  onIsWinChange?: (value: boolean) => void;
  onFinalSetTiebreakChange?: (value: boolean) => void;
}

export const ScoreInput = ({
  sets,
  onSetsChange,
  isBestOfFive,
  onBestOfFiveChange,
  onIsWinChange,
  onFinalSetTiebreakChange,
}: ScoreInputProps) => {
  const autoPopulateScore = (score: string, setIndex: number): string => {
    const numScore = parseInt(score);
    if (!isNaN(numScore)) {
      const isFinalSet = (setIndex === 2 && !isBestOfFive) || (setIndex === 4 && isBestOfFive);
      
      if (isFinalSet) {
        // In final set, allow scores over 7 for tiebreak
        if (numScore <= 4) return "6";
        if (numScore === 5) return "7";
        return ""; // Don't auto-populate in tiebreak situations
      } else {
        // Regular set scoring
        if (numScore <= 4) return "6";
        if (numScore === 5) return "7";
        if (numScore === 6) return "7";
        if (numScore === 7) return "6";
        if (numScore > 7) return (numScore - 2).toString();
      }
    }
    return "";
  };

  const checkForMatchWin = (updatedSets: SetScore[]) => {
    if (!onIsWinChange) return;

    let playerSetsWon = 0;
    let opponentSetsWon = 0;
    
    updatedSets.forEach(set => {
      const playerScore = parseInt(set.playerScore);
      const opponentScore = parseInt(set.opponentScore);
      
      if (!isNaN(playerScore) && !isNaN(opponentScore)) {
        if (playerScore > opponentScore) {
          playerSetsWon++;
        } else if (opponentScore > playerScore) {
          opponentSetsWon++;
        }
      }
    });

    const setsNeededToWin = isBestOfFive ? 3 : 2;
    onIsWinChange(playerSetsWon >= setsNeededToWin);
  };

  const checkForTiebreak = (updatedSets: SetScore[]) => {
    if (!onFinalSetTiebreakChange) return;

    const lastPlayedSetIndex = updatedSets.findIndex(set => 
      set.playerScore === "" && set.opponentScore === ""
    ) - 1;

    const lastPlayedSet = lastPlayedSetIndex >= 0 ? updatedSets[lastPlayedSetIndex] : updatedSets[updatedSets.length - 1];
    
    if (lastPlayedSet && lastPlayedSet.playerScore && lastPlayedSet.opponentScore) {
      const playerScore = parseInt(lastPlayedSet.playerScore);
      const opponentScore = parseInt(lastPlayedSet.opponentScore);
      
      // Check if it's a tiebreak situation (scores higher than normal set scores)
      const isTiebreak = !isNaN(playerScore) && !isNaN(opponentScore) && 
        (playerScore > 7 || opponentScore > 7) &&
        Math.abs(playerScore - opponentScore) >= 2;
      
      onFinalSetTiebreakChange(isTiebreak);
    }
  };

  const handleSetScoreChange = (index: number, field: keyof SetScore, value: string) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };

    if (value !== "") {
      const otherField = field === 'playerScore' ? 'opponentScore' : 'playerScore';
      const currentValue = parseInt(value);
      const otherValue = parseInt(newSets[index][otherField]);
      
      // Only auto-populate if we're not in a tiebreak situation
      if (isNaN(currentValue) || isNaN(otherValue) || (currentValue <= 7 && otherValue <= 7)) {
        newSets[index][otherField] = autoPopulateScore(value, index);
      }
    }

    onSetsChange(newSets);
    checkForMatchWin(newSets);
    checkForTiebreak(newSets);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600">
            <Target className="w-5 h-5 text-white" />
          </div>
          <Label className="text-lg font-bold text-gray-800">Set Scores</Label>
        </div>
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border-2 border-purple-200/50">
          <Switch
            id="best-of-five"
            checked={isBestOfFive}
            onCheckedChange={onBestOfFiveChange}
            className="data-[state=checked]:bg-purple-500"
          />
          <Label htmlFor="best-of-five" className="font-semibold text-gray-700">
            Best of {isBestOfFive ? '5' : '3'}
          </Label>
        </div>
      </div>
      
      <Card className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-orange-50/30 backdrop-blur-sm border-2 border-orange-200/30">
        <div className="space-y-6">
          {sets.map((set, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  Set {index + 1}
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
                    className="h-12 text-xl font-bold text-center rounded-2xl bg-white/90 border-2 border-blue-200/50 focus:border-blue-400 transition-all duration-300 hover:shadow-lg"
                    min="0"
                    placeholder="0"
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
                    className="h-12 text-xl font-bold text-center rounded-2xl bg-white/90 border-2 border-red-200/50 focus:border-red-400 transition-all duration-300 hover:shadow-lg"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              
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
            💡 <strong>Quick Tip:</strong> Enter your score and the opponent's score will auto-fill based on tennis scoring rules!
          </p>
        </div>
      </Card>
    </div>
  );
};
