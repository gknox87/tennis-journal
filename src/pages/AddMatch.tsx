import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { ScoreInput } from "@/components/ScoreInput";
import { MatchSettings } from "@/components/MatchSettings";
import { Card } from "@/components/ui/card";
import { OpponentInput } from "@/components/OpponentInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SetScore {
  playerScore: string;
  opponentScore: string;
}

interface Tag {
  id: string;
  name: string;
}

const courtTypes = ["Hard", "Artificial Grass", "Clay", "Grass", "Carpet"] as const;
type CourtType = typeof courtTypes[number];

const AddMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [opponent, setOpponent] = useState("");
  const [isKeyOpponent, setIsKeyOpponent] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [notes, setNotes] = useState("");
  const [courtType, setCourtType] = useState<CourtType | "">("");
  const [isBestOfFive, setIsBestOfFive] = useState(false);
  const [finalSetTiebreak, setFinalSetTiebreak] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [sets, setSets] = useState<SetScore[]>([
    { playerScore: "", opponentScore: "" },
    { playerScore: "", opponentScore: "" },
    { playerScore: "", opponentScore: "" },
  ]);

  const formatScore = () => {
    return sets
      .filter(set => set.playerScore !== "" || set.opponentScore !== "")
      .map(set => `${set.playerScore}-${set.opponentScore}`)
      .join(", ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add matches.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const score = formatScore();

      // Get or create opponent with key opponent status
      const { data: opponentData, error: opponentError } = await supabase
        .from('opponents')
        .insert({
          name: opponent,
          user_id: session.user.id,
          is_key_opponent: isKeyOpponent
        })
        .select('id')
        .single();

      if (opponentError) throw opponentError;

      // Insert match with court type
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          date: date.toISOString().split('T')[0],
          opponent_id: opponentData.id,
          score,
          is_win: isWin,
          notes: notes || null,
          user_id: session.user.id,
          final_set_tiebreak: finalSetTiebreak,
          court_type: courtType || null
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Insert tags if any exist
      if (selectedTags.length > 0 && matchData) {
        const { error: tagError } = await supabase
          .from("match_tags")
          .insert(
            selectedTags.map((tag) => ({
              match_id: matchData.id,
              tag_id: tag.id,
            }))
          );

        if (tagError) throw tagError;
      }

      toast({
        title: "Match recorded",
        description: "Your match has been successfully saved.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error('Error saving match:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save match. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Record Match</h1>
        </div>
      </div>

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
            isKeyOpponent={isKeyOpponent}
            onKeyOpponentChange={setIsKeyOpponent}
          />

          <div className="space-y-2">
            <Label>Court Type</Label>
            <Select value={courtType} onValueChange={(value) => setCourtType(value as CourtType)}>
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
          />

          <MatchSettings
            isWin={isWin}
            onIsWinChange={setIsWin}
            notes={notes}
            onNotesChange={setNotes}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
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
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddMatch;