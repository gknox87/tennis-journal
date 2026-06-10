import { Match } from '@/types/match';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target } from 'lucide-react';
import { EmotionTagChips } from '@/components/mental/EmotionTagPicker';
import { SCALE_COLORS } from '@/components/mental/ScalePicker';
import { cn } from '@/lib/utils';
import { hasPreMatchData, matchToPreMatchState } from '@/components/mental/PreMatchStateForm';

interface PreMatchStateCardProps {
  match: Match;
}

function MetricBadge({ label, value }: { label: string; value: number }) {
  return (
    <div
      className={cn(
        'inline-flex flex-col items-center px-3 py-2 rounded-xl border text-center min-w-[72px]',
        SCALE_COLORS[value - 1]
      )}
    >
      <span className="text-lg font-bold">{value}/10</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{label}</span>
    </div>
  );
}

export function PreMatchStateCard({ match }: PreMatchStateCardProps) {
  const state = matchToPreMatchState(match);
  if (!hasPreMatchData(state)) return null;

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-purple-200/60">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-100 to-violet-100 flex-shrink-0">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          <span className="text-base sm:text-xl">Pre-match State</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        {(state.nerves != null || state.confidence != null || state.arousal != null) && (
          <div className="flex flex-wrap gap-3">
            {state.nerves != null && <MetricBadge label="Nerves" value={state.nerves} />}
            {state.confidence != null && <MetricBadge label="Confidence" value={state.confidence} />}
            {state.arousal != null && <MetricBadge label="Arousal" value={state.arousal} />}
          </div>
        )}

        {state.process_goal?.trim() && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">
                  Process goal
                </p>
                <p className="text-gray-800 font-medium italic">&ldquo;{state.process_goal}&rdquo;</p>
              </div>
            </div>
          </div>
        )}

        {state.emotion_tags && state.emotion_tags.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Pre-match emotions
            </p>
            <EmotionTagChips tags={state.emotion_tags} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function hasMatchPreMatchData(match: Match): boolean {
  return hasPreMatchData(matchToPreMatchState(match));
}
