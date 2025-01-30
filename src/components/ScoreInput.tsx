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

    // Auto-populate the opponent's score
    if (value !== "") {
      const otherField = field === 'playerScore' ? 'opponentScore' : 'playerScore';
      newSets[index][otherField] = autoPopulateScore(value);
    }

    onSetsChange(newSets);
    checkForMatchWin(newSets);
    checkForTiebreak(newSets);
  };

  const toggleBestOfFive = () => {
    const newValue = !isBestOfFive;
    onBestOfFiveChange(newValue);
    if (newValue) {
      onSetsChange([...sets, { playerScore: "", opponentScore: "" }, { playerScore: "", opponentScore: "" }]);
    } else {
      onSetsChange(sets.slice(0, 3));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Label>Score</Label>
        <div className="flex items-center space-x-2">
          <Label htmlFor="best-of-five">Best of 5</Label>
          <Switch
            id="best-of-five"
            checked={isBestOfFive}
            onCheckedChange={toggleBestOfFive}
          />
        </div>
      </div>
      
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-4">
          {sets.map((set, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <Label className="text-center">Set {index + 1}</Label>
              <div className="flex flex-col space-y-2">
                <Input
                  type="number"
                  value={set.playerScore}
                  onChange={(e) => handleSetScoreChange(index, 'playerScore', e.target.value)}
                  placeholder="You"
                  className="w-full h-8 text-sm"
                  min="0"
                  max="7"
                />
                <Input
                  type="number"
                  value={set.opponentScore}
                  onChange={(e) => handleSetScoreChange(index, 'opponentScore', e.target.value)}
                  placeholder="Opp"
                  className="w-full h-8 text-sm"
                  min="0"
                  max="7"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};