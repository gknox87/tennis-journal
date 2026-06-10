import { Input } from '@/components/ui/input';
import { ScalePicker } from '@/components/mental/ScalePicker';
import { EmotionTagPicker } from '@/components/mental/EmotionTagPicker';
import { PROCESS_GOAL_SUGGESTIONS } from '@/constants/emotionTags';
import type { PreMatchState } from '@/types/mental';
import { cn } from '@/lib/utils';

interface PreMatchStateFormProps {
  value: PreMatchState;
  onChange: (value: PreMatchState) => void;
  compact?: boolean;
}

export function PreMatchStateForm({ value, onChange, compact = false }: PreMatchStateFormProps) {
  const update = (patch: Partial<PreMatchState>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className={cn('space-y-5', compact && 'space-y-4')}>
      <ScalePicker
        label="Nerves"
        value={value.nerves ?? null}
        onChange={(nerves) => update({ nerves })}
        lowLabel="Calm"
        highLabel="Very nervous"
      />
      <ScalePicker
        label="Confidence"
        value={value.confidence ?? null}
        onChange={(confidence) => update({ confidence })}
        lowLabel="Low"
        highLabel="High"
      />
      <ScalePicker
        label="Arousal / energy"
        value={value.arousal ?? null}
        onChange={(arousal) => update({ arousal })}
        lowLabel="Low energy"
        highLabel="Fired up"
      />

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-800">Process goal</p>
        <Input
          value={value.process_goal ?? ''}
          onChange={(e) => update({ process_goal: e.target.value || null })}
          placeholder="What will you focus on during the match?"
          className="rounded-xl border-2"
        />
        <div className="flex flex-wrap gap-2">
          {PROCESS_GOAL_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => update({ process_goal: suggestion })}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-colors',
                value.process_goal === suggestion
                  ? 'border-teal-400 bg-teal-50 text-teal-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-teal-200'
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <EmotionTagPicker
        label="Pre-match emotions"
        value={value.emotion_tags ?? []}
        onChange={(emotion_tags) => update({ emotion_tags })}
      />
    </div>
  );
}

export function hasPreMatchData(state: PreMatchState | null | undefined): boolean {
  if (!state) return false;
  return Boolean(
    state.nerves != null ||
    state.confidence != null ||
    state.arousal != null ||
    state.process_goal?.trim() ||
    (state.emotion_tags && state.emotion_tags.length > 0)
  );
}

export function preMatchStateToMatchFields(state: PreMatchState) {
  return {
    pre_nerves: state.nerves ?? null,
    pre_confidence: state.confidence ?? null,
    pre_arousal: state.arousal ?? null,
    process_goal: state.process_goal?.trim() || null,
    pre_emotion_tags: state.emotion_tags ?? [],
  };
}

export function matchToPreMatchState(match: {
  pre_nerves?: number | null;
  pre_confidence?: number | null;
  pre_arousal?: number | null;
  process_goal?: string | null;
  pre_emotion_tags?: string[] | null;
}): PreMatchState {
  return {
    nerves: match.pre_nerves ?? null,
    confidence: match.pre_confidence ?? null,
    arousal: match.pre_arousal ?? null,
    process_goal: match.process_goal ?? null,
    emotion_tags: match.pre_emotion_tags ?? [],
  };
}

export function scheduledStateToPreMatchState(
  raw: PreMatchState | null | undefined
): PreMatchState {
  if (!raw || typeof raw !== 'object') return {};
  return {
    nerves: raw.nerves ?? null,
    confidence: raw.confidence ?? null,
    arousal: raw.arousal ?? null,
    process_goal: raw.process_goal ?? null,
    emotion_tags: raw.emotion_tags ?? [],
    logged_at: raw.logged_at,
  };
}
