
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

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
  const autoPopulateScore = (score: string): string => {
    const numScore = parseInt(score);
    if (!isNaN(numScore)) {
      if (numScore <= 4) return "6";
      if (numScore === 5) return "7";
      if (numScore === 6) return "7";
      if (numScore === 7) return "6";
      if (numScore > 7) return (numScore - 2).toString();
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
      const isTiebreak = 
        (lastPlayedSet.playerScore === "7" && lastPlayedSet.opponentScore === "6") ||
        (lastPlayedSet.playerScore === "6" && lastPlayedSet.opponentScore === "7");
      
      onFinalSetTiebreakChange(isTiebreak);
    }
  };

  const handleSetScoreChange = (index: number, field: keyof SetScore, value: string) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };

    if (value !== "") {
      const otherField = field === 'playerScore' ? 'opponentScore' : 'playerScore';
      newSets[index][otherField] = autoPopulateScore(value);
    }

    onSetsChange(newSets);
    checkForMatchWin(newSets);
    checkForTiebreak(newSets);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Score</Label>
        <div className="flex items-center gap-2">
          <Switch
            id="best-of-five"
            checked={isBestOfFive}
            onCheckedChange={onBestOfFiveChange}
          />
          <Label htmlFor="best-of-five" className="text-sm">Best of 5</Label>
        </div>
      </div>
      
      <Card className="p-4">
        {sets.map((set, index) => (
          <div key={index} className="mb-4 last:mb-0">
            <Label className="text-sm mb-2 block">Set {index + 1}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">You</Label>
                <Input
                  type="number"
                  value={set.playerScore}
                  onChange={(e) => handleSetScoreChange(index, 'playerScore', e.target.value)}
                  className="h-10 text-lg font-medium"
                  min="0"
                  max="7"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Opponent</Label>
                <Input
                  type="number"
                  value={set.opponentScore}
                  onChange={(e) => handleSetScoreChange(index, 'opponentScore', e.target.value)}
                  className="h-10 text-lg font-medium"
                  min="0"
                  max="7"
                />
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};
