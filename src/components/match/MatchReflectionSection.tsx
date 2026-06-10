import { Match } from '@/types/match';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Heart } from 'lucide-react';
import {
  parseReflectionNotes,
  getReflectionLevelLabel,
  parseNervesRating,
  isGuidedReflection,
} from '@/utils/reflectionNotes';
import { cn } from '@/lib/utils';
import { EmotionTagChips } from '@/components/mental/EmotionTagPicker';

interface MatchReflectionSectionProps {
  match: Match;
}

const NERVES_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-800 border-green-200',
  2: 'bg-green-100 text-green-800 border-green-200',
  3: 'bg-lime-100 text-lime-800 border-lime-200',
  4: 'bg-lime-100 text-lime-800 border-lime-200',
  5: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  6: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  7: 'bg-orange-100 text-orange-800 border-orange-200',
  8: 'bg-orange-100 text-orange-800 border-orange-200',
  9: 'bg-red-100 text-red-800 border-red-200',
  10: 'bg-red-100 text-red-800 border-red-200',
};

function NervesBadge({ rating }: { rating: number }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold mb-3',
        NERVES_COLORS[rating]
      )}
    >
      <Heart className="h-3.5 w-3.5" />
      <span>Nerves: {rating}/10</span>
    </div>
  );
}

export function hasReflectionData(match: Match): boolean {
  const hasNotes = Boolean(match.notes?.trim());
  const hasEmotions = Boolean(match.post_emotion_tags?.length);
  return hasNotes || hasEmotions;
}

export const MatchReflectionSection = ({ match }: MatchReflectionSectionProps) => {
  if (!hasReflectionData(match)) return null;

  const entries = match.notes?.trim() ? parseReflectionNotes(match.notes) : [];
  const isGuided = isGuidedReflection(match);
  const levelLabel = getReflectionLevelLabel(match.reflection_prompt_level);

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/50">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-100 to-teal-100 flex-shrink-0">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
            </div>
            <span className="text-base sm:text-xl">
              {isGuided ? 'Guided Reflection' : 'Match Reflection'}
            </span>
          </CardTitle>
          {levelLabel && (
            <Badge
              variant="secondary"
              className="bg-teal-100 text-teal-800 hover:bg-teal-100 font-semibold"
            >
              {levelLabel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
        {match.post_emotion_tags && match.post_emotion_tags.length > 0 && (
          <div className="pb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Post-match emotions
            </p>
            <EmotionTagChips tags={match.post_emotion_tags} />
          </div>
        )}
        {entries.length === 0 && match.notes?.trim() && (
          <div className="p-4 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-to-r from-teal-50/80 to-emerald-50/80 border border-teal-100">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {match.notes}
            </p>
          </div>
        )}
        {entries.map((entry, index) => {
          const nervesRating = parseNervesRating(entry.answer);
          const answerText = nervesRating
            ? entry.answer.replace(/^\d{1,2}\/10\s*-?\s*/, '').trim()
            : entry.answer;

          return (
            <div
              key={`${entry.question}-${index}`}
              className="p-4 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-to-r from-teal-50/80 to-emerald-50/80 border border-teal-100"
            >
              {entry.question && (
                <p className="text-sm sm:text-base font-semibold text-teal-900 mb-2 sm:mb-3">
                  {entry.question}
                </p>
              )}
              {nervesRating && <NervesBadge rating={nervesRating} />}
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {answerText || (nervesRating ? 'No additional notes' : entry.answer)}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
