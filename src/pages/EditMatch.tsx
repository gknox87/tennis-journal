import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Match, SetScore } from "@/types/match";
import { MatchForm } from "@/components/match/MatchForm";

const EditMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication required",
            description: "Please log in to edit matches.",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

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

        const scoreArray = matchData.score.split(' ');
        const parsedSets: SetScore[] = scoreArray.map(set => {
          const [playerScore, opponentScore] = set.split('-');
          return { playerScore, opponentScore };
        });

        setMatch({
          ...matchData,
          opponent_name: matchData.opponents?.name || "Unknown Opponent",
          tags: matchData.tags || [],
          sets: parsedSets
        });
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

  const handleSubmit = async (formData: any) => {
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
      const validSets = formData.sets.filter((set: SetScore) => 
        set.playerScore !== "" && set.opponentScore !== ""
      );
      const scoreString = validSets
        .map((set: SetScore) => `${set.playerScore}-${set.opponentScore}`)
        .join(' ');

      // Get or create opponent
      const { data: opponentId } = await supabase
        .rpc('get_or_create_opponent', {
          p_name: formData.opponent,
          p_user_id: session.user.id
        });

      if (!opponentId) {
        throw new Error("Failed to get or create opponent");
      }

      // Update match
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          date: formData.date.toISOString().split('T')[0],
          score: scoreString,
          is_win: formData.isWin,
          notes: formData.notes || null,
          opponent_id: opponentId,
          final_set_tiebreak: formData.finalSetTiebreak,
          court_type: formData.courtType || null
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
      if (formData.selectedTags.length > 0) {
        const { error: tagError } = await supabase
          .from("match_tags")
          .insert(
            formData.selectedTags.map((tag: any) => ({
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

  if (!match) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <h1 className="text-2xl font-bold mb-6">Edit Match</h1>

      <MatchForm
        onSubmit={handleSubmit}
        initialData={{
          date: new Date(match.date),
          opponent: match.opponent_name,
          courtType: match.court_type || "",
          sets: match.sets || [],
          isWin: match.is_win,
          notes: match.notes || "",
          selectedTags: match.tags || [],
          finalSetTiebreak: match.final_set_tiebreak || false,
        }}
      />
    </div>
  );
};

export default EditMatch;