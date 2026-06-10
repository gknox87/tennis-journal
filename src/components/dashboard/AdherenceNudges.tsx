import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Match } from '@/types/match';
import { useWellness } from '@/hooks/useWellness';
import { findReflectionNudgeMatch } from '@/utils/adherenceNudges';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdherenceNudgesProps {
  matches: Match[];
}

export const AdherenceNudges = ({ matches }: AdherenceNudgesProps) => {
  const navigate = useNavigate();
  const { todayEntry, isLoading } = useWellness();

  if (isLoading) return null;

  const reflectionNudge = findReflectionNudgeMatch(matches);
  const needsWellness = !todayEntry;

  if (!reflectionNudge && !needsWellness) return null;

  return (
    <div className="space-y-3">
      {reflectionNudge && (
        <Card className="p-4 border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-teal-100 flex-shrink-0">
              <Sparkles className="h-5 w-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-teal-900">While it&apos;s fresh</p>
              <p className="text-sm text-teal-800 mt-0.5">
                You logged vs {reflectionNudge.opponent_name || 'your opponent'}{' '}
                {reflectionNudge.minutesAgo < 60
                  ? `${reflectionNudge.minutesAgo} min ago`
                  : `${Math.round(reflectionNudge.minutesAgo / 60)}h ago`}
                — add a quick reflection while emotion and recall are vivid.
              </p>
              <Button
                size="sm"
                className="mt-3 bg-teal-600 hover:bg-teal-700"
                onClick={() => navigate(`/edit-match/${reflectionNudge.id}?reflect=1`)}
              >
                Add reflection
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {needsWellness && (
        <Card className="p-4 border-2 border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-rose-100 flex-shrink-0">
              <Heart className="h-5 w-5 text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-rose-900">Daily wellness check-in</p>
              <p className="text-sm text-rose-800 mt-0.5">
                A 30-second check-in on sleep, mood, and confidence keeps your mind–body trends accurate.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 border-rose-300 text-rose-800 hover:bg-rose-100"
                onClick={() => navigate('/wellness?from=reminder')}
              >
                Check in now
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
