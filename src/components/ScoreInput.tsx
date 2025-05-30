
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Trophy, Target } from "lucide-react";

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
}

export const ScoreInput = ({
  sets,
  onSetsChange,
  isBestOfFive,
  onBestOfFiveChange,
  onIsWinChange,
  onFinalSetTiebreakChange,
}: ScoreInputProps) => {
  
  const calculateWinner = (updatedSets: SetScore[]) => {
    if (!onIsWinChange) return;

    let playerSetsWon = 0;
    let opponentSetsWon = 0;
    
    updatedSets.forEach(set => {
      const playerScore = parseInt(set.playerScore);
      const opponentScore = parseInt(set.opponentScore);
      
      if (!isNaN(playerScore) && !isNaN(opponentScore)) {
        // Handle tiebreak scenarios
        if (playerScore === 6 && opponentScore === 6) {
          const playerTiebreak = parseInt(set.playerTiebreak || "0");
          const opponentTiebreak = parseInt(set.opponentTiebreak || "0");
          
          if (!isNaN(playerTiebreak) && !isNaN(opponentTiebreak) && 
              Math.abs(playerTiebreak - opponentTiebreak) >= 2) {
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

    // Auto-populate logic for regular scores
    if ((field === 'playerScore' || field === 'opponentScore') && value !== "") {
      const currentValue = parseInt(value);
      const otherField = field === 'playerScore' ? 'opponentScore' : 'playerScore';
      const otherValue = parseInt(newSets[index][otherField]);
      
      // Standard tennis scoring auto-complete
      if (!isNaN(currentValue) && currentValue <= 7) {
        if (currentValue <= 4) {
          newSets[index][otherField] = "6";
        } else if (currentValue === 5) {
          newSets[index][otherField] = "7";
        } else if (currentValue === 6) {
          if (isNaN(otherValue) || otherValue < 6) {
            newSets[index][otherField] = "4";
          } else if (otherValue === 6) {
            // 6-6, might need tiebreak
          } else {
            newSets[index][otherField] = "7";
          }
        } else if (currentValue === 7) {
          if (isNaN(otherValue) || otherValue < 5) {
            newSets[index][otherField] = "5";
          } else {
            newSets[index][otherField] = "6";
          }
        }
      }
    }

    onSetsChange(newSets);
    calculateWinner(newSets);
    checkForTiebreak(newSets);
  };

  const needsTiebreak = (set: SetScore) => {
    const playerScore = parseInt(set.playerScore);
    const opponentScore = parseInt(set.opponentScore);
    return playerScore === 6 && opponentScore === 6;
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
                    max="7"
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
                    max="7"
                    placeholder="0"
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
            💡 <strong>Quick Tip:</strong> Enter scores and the winner will be calculated automatically! For 6-6 sets, tiebreak inputs will appear.
          </p>
        </div>
      </Card>
    </div>
  );
};
