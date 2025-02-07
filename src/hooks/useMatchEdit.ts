
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/types/match";

export const useMatchEdit = (id: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          )
        `)
        .eq("id", id)
        .eq("user_id", session.user.id)
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
      const parsedSets = scoreArray.map(set => {
        const [playerScore, opponentScore] = set.split('-');
        return { playerScore, opponentScore };
      });

      setMatch({
        ...matchData,
        opponent_name: matchData.opponents?.name || "Unknown Opponent",
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

      const validSets = formData.sets.filter((set: any) => 
        set.playerScore !== "" && set.opponentScore !== ""
      );
      const scoreString = validSets
        .map((set: any) => `${set.playerScore}-${set.opponentScore}`)
        .join(' ');

      // First get or create the opponent
      const { data: opponentId, error: opponentError } = await supabase
        .rpc('get_or_create_opponent', {
          p_name: formData.opponent,
          p_user_id: session.user.id
        });

      if (opponentError) throw opponentError;

      // Then update the match
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

      toast({
        title: "Success",
        description: "Match updated successfully.",
      });
      navigate(`/match/${id}`);
    } catch (error: any) {
      console.error("Error updating match:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update match. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    match,
    isLoading,
    fetchMatch,
    handleSubmit
  };
};
