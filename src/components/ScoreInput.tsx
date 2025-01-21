import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  finalSetTiebreak: boolean;
  onFinalSetTiebreakChange: (value: boolean) => void;
}

export const ScoreInput = ({
  sets,
  onSetsChange,
  isBestOfFive,
  onBestOfFiveChange,
}: ScoreInputProps) => {
  const handleSetScoreChange = (index: number, field: keyof SetScore, value: string) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    onSetsChange(newSets);
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
        <div className="space-y-3">
          {sets.map((set, index) => (
            <div key={index} className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="number"
                  value={set.playerScore}
                  onChange={(e) => handleSetScoreChange(index, 'playerScore', e.target.value)}
                  placeholder={`Set ${index + 1} - Your Score`}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="number"
                  value={set.opponentScore}
                  onChange={(e) => handleSetScoreChange(index, 'opponentScore', e.target.value)}
                  placeholder={`Opponent Score`}
                  className="w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};