
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import { MatchForm } from "@/components/match/MatchForm";
import type { MatchFormData } from "@/components/match/MatchForm";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mic, PenTool } from "lucide-react";
import { SetScore } from "@/types/match";
import { VoiceMatchEntry } from "@/components/voice/VoiceMatchEntry";
import { analytics } from "@/lib/analytics";

const AddMatch = () => {
  const { sport } = useSport();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = async (formData: MatchFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save matches.",
          variant: "destructive",
        });
        return;
      }

      const score = formData.sets
        .filter((set: SetScore) => set.playerScore !== "" || set.opponentScore !== "")
        .map((set: SetScore) => {
          let setScore = `${set.playerScore}-${set.opponentScore}`;
          if (set.playerTiebreak && set.opponentTiebreak) {
            setScore += ` (${set.playerTiebreak}-${set.opponentTiebreak})`;
          }
          return setScore;
        })
        .join(", ");

      // Handle partner_id for doubles matches
      let partnerId: string | null = null;
      if (formData.matchType === 'doubles' && formData.partner) {
        const { data: partnerData } = await supabase
          .rpc('get_or_create_partner', {
            p_name: formData.partner,
            p_user_id: session.user.id,
            p_sport_id: sport.id
          });
        partnerId = partnerData;
      }

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
          match_type: formData.matchType || 'singles',
          partner_id: partnerId,
        })
        .select()
        .single();

      if (matchError) throw matchError;

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
        }).catch((err) => {
          console.error('AI analysis failed:', err);
        });
      }

      toast({
        title: "Match saved!",
        description: "Your match has been recorded successfully.",
      });

      analytics.matchLogged(
        sport.slug,
        formData.matchType ?? 'singles',
        score,
        formData.isWin ?? false
      );

      navigate(`/match/${matchData.id}`);
    } catch (error: unknown) {
      console.error('Error saving match:', error);
      const message = error instanceof Error ? error.message : "Failed to save match. Please try again.";
      const isPermissionError = message.toLowerCase().includes('policy') ||
        message.toLowerCase().includes('permission') ||
        message.toLowerCase().includes('rls') ||
        (error as { code?: string })?.code === '42501';
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
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-y-auto pb-24 pt-16">
{/* Back Navigation */}
      <div className="relative z-10 container mx-auto px-4 pt-16">
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
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-white/50 backdrop-blur-sm p-1 mb-6 shadow-lg">
            <TabsTrigger
              value="manual"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger
              value="voice"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <MatchForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </TabsContent>

          <TabsContent value="voice">
            <Card className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-purple-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl">
              <VoiceMatchEntry />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AddMatch;
