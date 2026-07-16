
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatternInsightCard } from "@/components/PatternInsightCard";
import { useAthletePatterns } from "@/hooks/useAthletePatterns";
import { MIN_MATCHES_FOR_PATTERNS } from "@/types/athletePattern";
import { Sparkles, ArrowRight } from "lucide-react";

interface PatternInsightsWidgetProps {
  matchCount: number;
}

export const PatternInsightsWidget = ({ matchCount }: PatternInsightsWidgetProps) => {
  const navigate = useNavigate();
  const {
    patterns,
    isLoading,
    unlockProgress,
  } = useAthletePatterns({ matchCount });

  if (matchCount < MIN_MATCHES_FOR_PATTERNS) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="p-4 bg-white/70 backdrop-blur-sm border border-gray-200/50">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
        </div>
      </Card>
    );
  }

  const preview = patterns.slice(0, 2);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Pattern Insights
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-600"
          onClick={() => navigate("/improvement-notes")}
        >
          See all
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <Card className="p-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 space-y-2">
        {!unlockProgress.unlocked ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            Log {unlockProgress.remaining} more match
            {unlockProgress.remaining === 1 ? "" : "es"} to unlock pattern detection
          </p>
        ) : preview.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            Keep logging matches and wellness check-ins — patterns will appear as your data builds.
          </p>
        ) : (
          preview.map((pattern) => (
            <PatternInsightCard
              key={pattern.id}
              pattern={pattern}
              compact
              trackView
            />
          ))
        )}
      </Card>
    </section>
  );
};
