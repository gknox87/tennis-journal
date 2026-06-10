import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Match } from '@/types/match';
import { useArousalTrend } from '@/hooks/useArousalTrend';
import { computeOptimalZoneInsight, AROUSAL_MIN_ENTRIES } from '@/utils/arousalTrendCalc';
import { hasMatchPreMatchData } from '@/components/match/PreMatchStateCard';
import { Brain, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

interface MindsetWidgetProps {
  matches: Match[];
}

export const MindsetWidget = ({ matches }: MindsetWidgetProps) => {
  const navigate = useNavigate();
  const { data: arousalData, isLoading } = useArousalTrend();

  const latestMentalMatch = [...matches]
    .filter(hasMatchPreMatchData)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  const insight = computeOptimalZoneInsight(arousalData);
  const hasArousalData = arousalData.length > 0;
  const hasContent = latestMentalMatch || hasArousalData;

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  if (!hasContent) {
    return null;
  }

  return (
    <Card
      className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50"
      onClick={() => navigate('/wellness')}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-500" />
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Brain className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Performance Mindset</h3>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </div>

        {latestMentalMatch && (
          <div className="mb-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1.5">
              Latest pre-match · vs {latestMentalMatch.opponent_name}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {latestMentalMatch.pre_confidence != null && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Confidence {latestMentalMatch.pre_confidence}/10
                </Badge>
              )}
              {latestMentalMatch.pre_arousal != null && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  Arousal {latestMentalMatch.pre_arousal}/10
                </Badge>
              )}
              {latestMentalMatch.pre_nerves != null && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  Nerves {latestMentalMatch.pre_nerves}/10
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {format(parseISO(latestMentalMatch.date), 'MMM d, yyyy')}
            </p>
          </div>
        )}

        {insight ? (
          <p className="text-xs text-purple-800 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 leading-relaxed">
            {insight.message}
          </p>
        ) : hasArousalData ? (
          <p className="text-xs text-muted-foreground">
            Log {AROUSAL_MIN_ENTRIES - arousalData.length} more arousal entries to discover your optimal zone.
          </p>
        ) : null}
      </div>
    </Card>
  );
};
