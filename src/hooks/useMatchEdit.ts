
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Match, SetScore } from "@/types/match";
import type { MatchFormData } from "@/components/match/MatchForm";

export const useMatchEdit = (id: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatch = useCallback(async () => {
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

      // Parse the score string into sets with improved logic
      const scoreString = matchData.score || "";
      const scoreArray = scoreString.split(/,\s*|\s+/).filter(s => s.trim()); // Split and filter empty
      
      const parsedSets: SetScore[] = scoreArray.map(set => {
        const parts = set.split('-');
        return { 
          playerScore: parts[0] || "", 
          opponentScore: parts[1] || "" 
        };
      });

      // Determine if it's best of 5 based on existing sets
      const isBestOfFive = parsedSets.length > 3;
      const targetLength = isBestOfFive ? 5 : 3;

      // Ensure we have the correct number of sets
      while (parsedSets.length < targetLength) {
        parsedSets.push({ playerScore: "", opponentScore: "" });
      }

      // Trim if we have too many sets
      if (parsedSets.length > targetLength) {
        parsedSets.splice(targetLength);
      }

      setMatch({
        ...matchData,
        opponent_name: matchData.opponents?.name || "Unknown Opponent",
        sets: parsedSets,
        reflection_prompt_used: matchData.reflection_prompt_used || undefined,
        reflection_prompt_level: matchData.reflection_prompt_level || undefined,
      } as Match);
    } catch (error: unknown) {
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
  }, [id, navigate, toast]);

  const handleSubmit = async (formData: MatchFormData) => {
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

      const validSets = formData.sets.filter((set: SetScore) =>
        set.playerScore !== "" && set.opponentScore !== ""
      );
      
      if (validSets.length === 0) {
        toast({
          title: "Error",
          description: "Please enter at least one set score.",
          variant: "destructive",
        });
        return;
      }

      const scoreString = validSets
        .map((set: SetScore) => `${set.playerScore}-${set.opponentScore}`)
        .join(', ');

      // Update the match first (without changing opponent) to avoid orphan opponents if update fails
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          date: formData.date.toISOString().split('T')[0],
          score: scoreString,
          is_win: formData.isWin,
          notes: formData.notes || null,
          final_set_tiebreak: formData.finalSetTiebreak,
          court_type: formData.courtType || null,
          reflection_prompt_used: formData.reflectionPromptUsed || null,
          reflection_prompt_level: formData.reflectionPromptLevel || null,
          pre_nerves: formData.preNerves ?? null,
          pre_confidence: formData.preConfidence ?? null,
          pre_arousal: formData.preArousal ?? null,
          process_goal: formData.processGoal || null,
          pre_emotion_tags: formData.preEmotionTags ?? [],
          post_emotion_tags: formData.postEmotionTags ?? [],
          scheduled_event_id: formData.scheduledEventId ?? null,
        })
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (matchError) throw matchError;

      // Match updated successfully — now get or create opponent and link them
      if (formData.opponent) {
        const { data: opponentId, error: opponentError } = await supabase
          .rpc('get_or_create_opponent', {
            p_name: formData.opponent,
            p_user_id: session.user.id
          });

        if (!opponentError && opponentId) {
          await supabase
            .from('matches')
            .update({ opponent_id: opponentId })
            .eq('id', id)
            .eq('user_id', session.user.id);
        }
      }

      toast({
        title: "Success",
        description: "Match updated successfully.",
      });
      navigate(`/match/${id}`);
    } catch (error: unknown) {
      console.error("Error updating match:", error);
      const message = error instanceof Error ? error.message : "Failed to update match. Please try again.";
      toast({
        title: "Error",
        description: message,
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
