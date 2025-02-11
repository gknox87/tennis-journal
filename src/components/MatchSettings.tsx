
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MatchSettingsProps {
  isWin: boolean;
  onIsWinChange: (value: boolean) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  finalSetTiebreak: boolean;
  onFinalSetTiebreakChange: (value: boolean) => void;
}

export const MatchSettings = ({
  isWin,
  onIsWinChange,
  notes,
  onNotesChange,
  finalSetTiebreak,
  onFinalSetTiebreakChange,
}: MatchSettingsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center space-x-2 bg-background/50 p-4 rounded-lg">
          <Switch
            id="isWin"
            checked={isWin}
            onCheckedChange={onIsWinChange}
          />
          <Label htmlFor="isWin" className="font-medium">Won the match</Label>
        </div>
        
        <div className="flex items-center space-x-2 bg-background/50 p-4 rounded-lg">
          <Switch
            id="finalSetTiebreak"
            checked={finalSetTiebreak}
            onCheckedChange={onFinalSetTiebreakChange}
          />
          <Label htmlFor="finalSetTiebreak" className="font-medium">Tiebreak final set</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-base font-medium">Match Notes</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="What went well? What could be improved?"
          className="w-full min-h-[120px] rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
};
