import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/types/match";
import { OpponentInput } from "@/components/OpponentInput";
import { ScoreInput } from "@/components/ScoreInput";
import { MatchSettings } from "@/components/MatchSettings";

interface Tag {
  id: string;
  name: string;
}

interface SetScore {
  playerScore: string;
  opponentScore: string;
}

const EditMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [opponentName, setOpponentName] = useState("");
  const [sets, setSets] = useState<SetScore[]>([
    { playerScore: "", opponentScore: "" },
    { playerScore: "", opponentScore: "" },
    { playerScore: "", opponentScore: "" },
  ]);
  const [isBestOfFive, setIsBestOfFive] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    is_win: false,
    notes: "",
    final_set_tiebreak: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to edit matches.",
          variant: "destructive",
        });
        navigate('/login');
        return false;
      }
      return true;
    };

    const fetchMatch = async () => {
      try {
        setIsLoading(true);
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) return;

        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select(`
            *,
            opponents (
              name
            ),
            tags!match_tags (
              id,
              name
            )
          `)
          .eq("id", id)
          .single();

        if (matchError) throw matchError;

        if (!matchData) {
          toast({
            title: "Match not found",
            description: "The requested match could not be found.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Create a proper Match object with opponent_name
        const matchWithOpponent: Match = {
          ...matchData,
          opponent_name: matchData.opponents?.name || "Unknown Opponent"
        };

        // Parse score into sets
        const scoreArray = matchData.score.split(' ');
        const parsedSets = scoreArray.map(set => {
          const [playerScore, opponentScore] = set.split('-');
          return { playerScore, opponentScore };
        });

        // Initialize sets state
        if (parsedSets.length === 5) {
          setIsBestOfFive(true);
          setSets(parsedSets);
        } else {
          setSets([...parsedSets, ...Array(5 - parsedSets.length).fill({ playerScore: "", opponentScore: "" })]);
        }

        setMatch(matchWithOpponent);
        setOpponentName(matchData.opponents?.name || "");
        setFormData({
          date: matchData.date,
          is_win: matchData.is_win,
          notes: matchData.notes || "",
          final_set_tiebreak: matchData.final_set_tiebreak || false,
        });
        setSelectedTags(matchData.tags || []);

      } catch (error: any) {
        console.error("Error in fetchMatch:", error);
        toast({
          title: "Error",
          description: "Failed to load match details. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatch();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to update matches.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Format score string from sets
      const validSets = sets.filter(set => set.playerScore !== "" && set.opponentScore !== "");
      const scoreString = validSets
        .map(set => `${set.playerScore}-${set.opponentScore}`)
        .join(' ');

      // Get or create opponent
      const { data: opponentId } = await supabase
        .rpc('get_or_create_opponent', {
          p_name: opponentName,
          p_user_id: session.user.id
        });

      if (!opponentId) {
        throw new Error("Failed to get or create opponent");
      }

      // Update match
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          ...formData,
          score: scoreString,
          opponent_id: opponentId,
          user_id: session.user.id
        })
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (matchError) throw matchError;

      // Delete existing tags
      const { error: deleteError } = await supabase
        .from("match_tags")
        .delete()
        .eq("match_id", id);

      if (deleteError) throw deleteError;

      // Insert new tags if any exist
      if (selectedTags.length > 0) {
        const { error: tagError } = await supabase
          .from("match_tags")
          .insert(
            selectedTags.map(tag => ({
              match_id: id,
              tag_id: tag.id
            }))
          );

        if (tagError) throw tagError;
      }

      toast({
        title: "Success",
        description: "Match updated successfully.",
      });
      navigate(`/match/${id}`);
    } catch (error: any) {
      console.error("Error updating match:", error);
      toast({
        title: "Error",
        description: "Failed to update match. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center justify-center">
          <p>Loading match details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Match</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <OpponentInput
                value={opponentName}
                onChange={setOpponentName}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              />
            </div>

            <ScoreInput
              sets={sets}
              onSetsChange={setSets}
              isBestOfFive={isBestOfFive}
              onBestOfFiveChange={setIsBestOfFive}
            />

            <MatchSettings
              isWin={formData.is_win}
              onIsWinChange={(value) => setFormData({ ...formData, is_win: value })}
              notes={formData.notes}
              onNotesChange={(value) => setFormData({ ...formData, notes: value })}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              finalSetTiebreak={formData.final_set_tiebreak}
              onFinalSetTiebreakChange={(value) => 
                setFormData({ ...formData, final_set_tiebreak: value })
              }
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMatch;