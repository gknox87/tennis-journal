import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { MatchForm } from "@/components/match/MatchForm";
import { useEffect } from "react";

const AddMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to add matches",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleSubmit = async (formData: any) => {
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

      const score = formData.sets
        .filter((set: any) => set.playerScore !== "" || set.opponentScore !== "")
        .map((set: any) => `${set.playerScore}-${set.opponentScore}`)
        .join(", ");

      // Get or create opponent
      const { data: opponentId } = await supabase
        .rpc('get_or_create_opponent', {
          p_name: formData.opponent,
          p_user_id: session.user.id
        });

      if (!opponentId) {
        throw new Error("Failed to get or create opponent");
      }

      // Insert match
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          date: formData.date.toISOString().split('T')[0],
          opponent_id: opponentId,
          score,
          is_win: formData.isWin,
          notes: formData.notes || null,
          user_id: session.user.id,
          final_set_tiebreak: formData.finalSetTiebreak,
          court_type: formData.courtType || null
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Analyze notes with AI if present
      if (formData.notes) {
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('analyze-match-notes', {
          body: { notes: formData.notes }
        });

        if (!aiError && aiResponse.suggestions) {
          const { error: pointsError } = await supabase
            .from('improvement_points')
            .insert(
              aiResponse.suggestions.map((point: string) => ({
                user_id: session.user.id,
                point,
                source_match_id: matchData.id
              }))
            );

          if (pointsError) {
            console.error('Error saving improvement points:', pointsError);
          }
        }
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

      <MatchForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddMatch;
