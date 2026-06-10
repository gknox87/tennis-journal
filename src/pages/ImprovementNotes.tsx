import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, RefreshCw, Sparkles } from "lucide-react";
import { PatternInsightCard } from "@/components/PatternInsightCard";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { useAthletePatterns } from "@/hooks/useAthletePatterns";
import { useSport } from "@/context/SportContext";
import { MIN_MATCHES_FOR_PATTERNS } from "@/types/athletePattern";

interface ImprovementPoint {
  id: string;
  point: string;
  is_completed: boolean;
  source_match_id: string | null;
  created_at: string;
  matches?: {
    date: string;
    score: string;
    opponent_id: string | null;
    opponents?: {
      name: string;
    };
  };
}

const ImprovementNotes = () => {
  const { toast } = useToast();
  const { sport } = useSport();
  const [improvementPoints, setImprovementPoints] = useState<ImprovementPoint[]>([]);
  const [matchCount, setMatchCount] = useState(0);

  const {
    patterns,
    isLoading: patternsLoading,
    isRefreshing,
    unlockProgress,
    canAccessPatternInsights,
    canRefreshNow,
    refreshPatterns,
    dismissPattern,
  } = useAthletePatterns({ autoRefresh: true, matchCount });

  const fetchImprovementPoints = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) return;

      const { data, error } = await supabase
        .from("improvement_points")
        .select(`
          *,
          matches (
            date,
            score,
            opponent_id,
            opponents (
              name
            )
          )
        `)
        .eq("user_id", session.session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImprovementPoints((data || []) as unknown as ImprovementPoint[]);
    } catch (error) {
      console.error("Error fetching improvement points:", error);
      toast({
        title: "Error",
        description: "Failed to fetch improvement points",
        variant: "destructive",
      });
    }
  };

  const fetchMatchCount = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) return;

      const { count, error } = await supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.session.user.id)
        .eq("sport_id", sport.id);

      if (error) throw error;
      setMatchCount(count ?? 0);
    } catch (error) {
      console.error("Error fetching match count:", error);
    }
  };

  const toggleImprovementPoint = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("improvement_points")
        .update({ is_completed: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      await fetchImprovementPoints();

      toast({
        title: !currentStatus ? "Point completed!" : "Point uncompleted",
        description: "Your progress has been updated",
      });
    } catch (error) {
      console.error("Error updating improvement point:", error);
      toast({
        title: "Error",
        description: "Failed to update improvement point",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchImprovementPoints();
    fetchMatchCount();

    const channel = supabase
      .channel("improvement_points_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "improvement_points",
        },
        () => {
          fetchImprovementPoints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sport.id]);

  const handleRefreshPatterns = () => {
    refreshPatterns(true);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-y-auto">
      <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-8 max-w-7xl">
        <div className="mt-4 flex items-center gap-4">
          <h1 className="text-2xl font-bold">AI Improvement Notes</h1>
        </div>

        {/* Patterns section */}
        {matchCount >= MIN_MATCHES_FOR_PATTERNS && (
          <section className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Patterns
                {!canAccessPatternInsights && (
                  <span className="text-xs font-normal text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    Pro
                  </span>
                )}
              </h2>
              {canAccessPatternInsights && unlockProgress.unlocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshPatterns}
                  disabled={isRefreshing || !canRefreshNow}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {isRefreshing ? "Analysing..." : "Refresh patterns"}
                </Button>
              )}
            </div>

            {!canAccessPatternInsights ? (
              <UpgradePrompt message="Unlock pattern detection — see what your data reveals. Spot trends like three-setter struggles or mood dips after heavy load." />
            ) : patternsLoading ? (
              <Card className="p-6">
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
                </div>
              </Card>
            ) : !unlockProgress.unlocked ? (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  Log {unlockProgress.remaining} more match
                  {unlockProgress.remaining === 1 ? "" : "es"} to unlock pattern detection
                </p>
              </Card>
            ) : patterns.length === 0 ? (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  {isRefreshing
                    ? "Analysing your data for patterns..."
                    : "No patterns detected yet. Keep logging matches, wellness, and training — then refresh."}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {patterns.map((pattern) => (
                  <PatternInsightCard
                    key={pattern.id}
                    pattern={pattern}
                    onDismiss={dismissPattern}
                    trackView
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Match tips section */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Match tips</h2>
          <div className="space-y-4">
            {improvementPoints.length === 0 ? (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  No improvement points found. Play some matches and add notes to get AI-generated improvement suggestions.
                </p>
              </Card>
            ) : (
              improvementPoints.map((point) => (
                <Card key={point.id} className="p-6">
                  <div className="flex items-start gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-0.5"
                      onClick={() => toggleImprovementPoint(point.id, point.is_completed)}
                    >
                      {point.is_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <p className={point.is_completed ? "line-through text-gray-500" : ""}>
                        {point.point}
                      </p>
                      {point.matches && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          From match on{" "}
                          {new Date(point.matches.date).toLocaleDateString()} against{" "}
                          {point.matches.opponents?.name} ({point.matches.score})
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ImprovementNotes;
