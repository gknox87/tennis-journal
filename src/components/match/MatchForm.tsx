
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ScoreInput } from "@/components/ScoreInput";
import { MatchSettings } from "@/components/MatchSettings";
import { Card } from "@/components/ui/card";
import { OpponentInput } from "@/components/OpponentInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SetScore } from "@/types/match";

interface MatchFormProps {
  onSubmit: (formData: any) => Promise<void>;
  initialData?: {
    date: Date;
    opponent: string;
    courtType: string;
    sets: SetScore[];
    isWin: boolean;
    notes: string;
    finalSetTiebreak: boolean;
    isBestOfFive?: boolean;
  };
}

const courtTypes = ["Hard", "Artificial Grass", "Clay", "Grass", "Carpet"] as const;

export const MatchForm = ({ onSubmit, initialData }: MatchFormProps) => {
  const [date, setDate] = useState<Date>(initialData?.date || new Date());
  const [opponent, setOpponent] = useState(initialData?.opponent || "");
  const [courtType, setCourtType] = useState<string>(initialData?.courtType || "");
  const [isBestOfFive, setIsBestOfFive] = useState(initialData?.isBestOfFive || false);
  const [finalSetTiebreak, setFinalSetTiebreak] = useState(initialData?.finalSetTiebreak || false);
  const [isWin, setIsWin] = useState(initialData?.isWin || false);
  const [notes, setNotes] = useState(initialData?.notes || "");

  // Initialize sets with proper logic
  const getInitialSets = (): SetScore[] => {
    if (initialData?.sets?.length) {
      return [...initialData.sets];
    }
    const numberOfSets = isBestOfFive ? 5 : 3;
    return Array(numberOfSets).fill(null).map(() => ({ playerScore: "", opponentScore: "" }));
  };

  const [sets, setSets] = useState<SetScore[]>(getInitialSets());

  // Update sets when isBestOfFive changes (only for new matches)
  useEffect(() => {
    if (!initialData?.sets?.length) {
      const numberOfSets = isBestOfFive ? 5 : 3;
      setSets(Array(numberOfSets).fill(null).map(() => ({ playerScore: "", opponentScore: "" })));
    }
  }, [isBestOfFive, initialData?.sets?.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one set is entered
    const validSets = sets.filter(set => 
      set.playerScore !== "" && set.opponentScore !== ""
    );
    
    if (validSets.length === 0) {
      return; // Let the backend handle the error message
    }

    await onSubmit({
      date,
      opponent,
      courtType,
      sets,
      isWin,
      notes,
      finalSetTiebreak,
      isBestOfFive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-6">
        <div>
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <OpponentInput
          value={opponent}
          onChange={setOpponent}
        />

        <div className="space-y-2">
          <Label>Court Type</Label>
          <Select value={courtType} onValueChange={setCourtType}>
            <SelectTrigger>
              <SelectValue placeholder="Select court type" />
            </SelectTrigger>
            <SelectContent>
              {courtTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScoreInput
          sets={sets}
          onSetsChange={setSets}
          isBestOfFive={isBestOfFive}
          onBestOfFiveChange={setIsBestOfFive}
          onIsWinChange={setIsWin}
          onFinalSetTiebreakChange={setFinalSetTiebreak}
        />

        <MatchSettings
          isWin={isWin}
          onIsWinChange={setIsWin}
          notes={notes}
          onNotesChange={setNotes}
          finalSetTiebreak={finalSetTiebreak}
          onFinalSetTiebreakChange={setFinalSetTiebreak}
        />
      </Card>

      <div className="flex space-x-4">
        <Button type="submit">
          Save Match
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
