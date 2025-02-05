
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
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="isWin"
            checked={isWin}
            onCheckedChange={onIsWinChange}
          />
          <Label htmlFor="isWin">Won the match</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="finalSetTiebreak"
            checked={finalSetTiebreak}
            onCheckedChange={onFinalSetTiebreakChange}
          />
          <Label htmlFor="finalSetTiebreak">Tiebreak final set</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Match Notes</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="What went well? What could be improved?"
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
};
