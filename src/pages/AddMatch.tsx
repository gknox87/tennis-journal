import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagInput } from "@/components/TagInput";

interface SetScore {
  playerScore: string;
  opponentScore: string;
}

interface Tag {
  id: string;
  name: string;
}

const AddMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [opponent, setOpponent] = useState("");
  const [isWin, setIsWin] = useState(false);
  const [notes, setNotes] = useState("");
  const [isBestOfFive, setIsBestOfFive] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [sets, setSets] = useState<SetScore[]>([
    { playerScore: "", opponentScore: "" },
    { playerScore: "", opponentScore: "" },
    { playerScore: "", opponentScore: "" },
  ]);

  const handleSetScoreChange = (index: number, field: keyof SetScore, value: string) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
  };

  const toggleBestOfFive = () => {
    setIsBestOfFive(!isBestOfFive);
    if (!isBestOfFive) {
      setSets([...sets, { playerScore: "", opponentScore: "" }, { playerScore: "", opponentScore: "" }]);
    } else {
      setSets(sets.slice(0, 3));
    }
  };

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

      // Insert match
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          date: date.toISOString().split('T')[0],
          opponent,
          score,
          is_win: isWin,
          notes: notes || null,
          user_id: session.user.id
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
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
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

            <div className="flex-1">
              <Label htmlFor="opponent">Opponent Name</Label>
              <Input
                id="opponent"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder="Enter opponent's name"
                required
              />
            </div>
          </div>

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

          <div className="flex items-center space-x-2">
            <Switch
              id="isWin"
              checked={isWin}
              onCheckedChange={setIsWin}
            />
            <Label htmlFor="isWin">Won the match</Label>
          </div>

          <div>
            <Label>Tags</Label>
            <TagInput
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>

          <div>
            <Label htmlFor="notes">Match Notes</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What went well? What could be improved?"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

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