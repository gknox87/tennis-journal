
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import { MatchForm } from "@/components/match/MatchForm";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const AddMatch = () => {
  const { sport } = useSport();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save matches.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Check if user's email is confirmed
      if (!session.user.email_confirmed_at) {
        toast({
          title: "Email not confirmed",
          description: "Please check your email and confirm your account before saving matches.",
          variant: "destructive",
        });
        return;
      }

      // Build score string with tiebreak support
      console.log('[SAVE-TRACE] formData.sets at save time:', JSON.stringify(formData.sets.map((s: any) => ({p: s.playerScore, pType: typeof s.playerScore, o: s.opponentScore, oType: typeof s.opponentScore}))));
      const score = formData.sets
        .filter((set: any) => set.playerScore !== "" || set.opponentScore !== "")
        .map((set: any) => {
          console.log(`[SAVE-TRACE] building score: player="${set.playerScore}" opponent="${set.opponentScore}" → "${set.playerScore}-${set.opponentScore}"`);
          let setScore = `${set.playerScore}-${set.opponentScore}`;
          if (set.playerTiebreak && set.opponentTiebreak) {
            setScore += ` (${set.playerTiebreak}-${set.opponentTiebreak})`;
          }
          return setScore;
        })
        .join(", ");
      console.log('[SAVE-TRACE] final score string:', JSON.stringify(score));

      // Insert match first (without opponent) to avoid orphan opponents if save fails
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          date: formData.date.toISOString().split('T')[0],
          opponent_id: null,
          score,
          is_win: formData.isWin,
          notes: formData.notes || null,
          user_id: session.user.id,
          final_set_tiebreak: formData.finalSetTiebreak,
          court_type: formData.courtType || null,
          sport_id: sport.id,
          reflection_prompt_used: formData.reflectionPromptUsed || null,
          reflection_prompt_level: formData.reflectionPromptLevel || null,
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Match saved successfully — now get or create opponent and link them
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
            .eq('id', matchData.id)
            .eq('user_id', session.user.id);
        }
      }

      // Analyze notes with AI if present (run in background)
      if (formData.notes) {
        supabase.functions.invoke('analyze-match-notes', {
          body: { notes: formData.notes }
        }).then(({ data: aiResponse, error: aiError }) => {
          if (!aiError && aiResponse?.suggestions) {
            supabase
              .from('improvement_points')
              .insert(
                aiResponse.suggestions.map((point: string) => ({
                  user_id: session.user.id,
                  point,
                  source_match_id: matchData.id
                }))
              );
          }
        });
      }

      toast({
        title: "Match saved!",
        description: "Your match has been recorded successfully.",
      });

      // Navigate immediately to the match detail page
      navigate(`/match/${matchData.id}`);
    } catch (error: any) {
      console.error('Error saving match:', error);
      const message = error?.message || "Failed to save match. Please try again.";
      // Detect RLS / permission errors that may stem from unconfirmed email
      const isPermissionError = message.toLowerCase().includes('policy') ||
        message.toLowerCase().includes('permission') ||
        message.toLowerCase().includes('rls') ||
        error?.code === '42501';
      toast({
        title: isPermissionError ? "Permission denied" : "Error saving match",
        description: isPermissionError
          ? "You may need to confirm your email before saving matches. Check your inbox for a confirmation link."
          : message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header userProfile={null} />
      
      {/* Back Navigation */}
      <div className="relative z-10 container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-purple-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-32 w-24 h-24 bg-green-400/20 rounded-full animate-bounce" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 pb-24 sm:pb-28 max-w-2xl">
        {/* Form Section */}
        <MatchForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default AddMatch;
