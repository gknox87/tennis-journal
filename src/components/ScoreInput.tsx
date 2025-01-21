import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  finalSetTiebreak,
  onFinalSetTiebreakChange,
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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="best-of-five">Best of 5</Label>
            <Switch
              id="best-of-five"
              checked={isBestOfFive}
              onCheckedChange={toggleBestOfFive}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="final-set-tiebreak">
              {isBestOfFive ? "5th" : "3rd"} Set Tiebreak
            </Label>
            <Switch
              id="final-set-tiebreak"
              checked={finalSetTiebreak}
              onCheckedChange={onFinalSetTiebreakChange}
            />
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="sets" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="sets">Sets</TabsTrigger>
        </TabsList>
        <TabsContent value="sets">
          <div className="space-y-4">
            {sets.map((set, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-1">
                  <Label>Set {index + 1} - Your Score</Label>
                  <Input
                    type="number"
                    value={set.playerScore}
                    onChange={(e) => handleSetScoreChange(index, 'playerScore', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <Label>Opponent Score</Label>
                  <Input
                    type="number"
                    value={set.opponentScore}
                    onChange={(e) => handleSetScoreChange(index, 'opponentScore', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};