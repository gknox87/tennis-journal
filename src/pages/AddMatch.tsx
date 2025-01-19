import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const AddMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [opponent, setOpponent] = useState("");
  const [score, setScore] = useState("");
  const [isWin, setIsWin] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, just show a success message and navigate back
    // Later this will be connected to Supabase
    toast({
      title: "Match recorded",
      description: "Your match has been successfully saved.",
    });
    
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Record Match</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>

          <div>
            <Label htmlFor="opponent">Opponent Name</Label>
            <Input
              id="opponent"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="Enter opponent's name"
              required
            />
          </div>

          <div>
            <Label htmlFor="score">Score</Label>
            <Input
              id="score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 6-4, 7-5"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isWin"
              checked={isWin}
              onCheckedChange={(checked) => setIsWin(checked as boolean)}
            />
            <Label htmlFor="isWin">Won the match</Label>
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
          <Button type="submit">Save Match</Button>
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