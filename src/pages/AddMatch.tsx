
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Trophy, Target, Zap } from "lucide-react";
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
        title: "🎾 Match Recorded!",
        description: "Your match has been successfully saved to your tennis journal.",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-purple-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-32 w-24 h-24 bg-green-400/20 rounded-full animate-bounce" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-2xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="mr-2 h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-700">Back</span>
            </Button>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-8 p-6 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/20">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">Record Your Match</h1>
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Capture every detail of your tennis journey!</p>
            
            {/* Fun stats/motivational elements */}
            <div className="flex justify-center items-center gap-6 mt-6">
              <div className="text-center">
                <div className="p-2 rounded-full bg-green-100 inline-block mb-2">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Quick Entry</p>
              </div>
              <div className="text-center">
                <div className="p-2 rounded-full bg-blue-100 inline-block mb-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Track Progress</p>
              </div>
              <div className="text-center">
                <div className="p-2 rounded-full bg-purple-100 inline-block mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Improve Game</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <MatchForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default AddMatch;
