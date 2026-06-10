import { cn } from '@/lib/utils';
import { EMOTION_TAGS } from '@/constants/emotionTags';

interface EmotionTagPickerProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  maxTags?: number;
}

export function EmotionTagPicker({
  value,
  onChange,
  label = 'How did you feel?',
  maxTags = 3,
}: EmotionTagPickerProps) {
  const toggleTag = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter((t) => t !== tagId));
      return;
    }
    if (value.length >= maxTags) return;
    onChange([...value, tagId]);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <div className="flex flex-wrap gap-2">
        {EMOTION_TAGS.map((tag) => {
          const isSelected = value.includes(tag.id);
          const isDisabled = !isSelected && value.length >= maxTags;

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              disabled={isDisabled}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200',
                isSelected
                  ? 'border-purple-400 bg-purple-50 text-purple-800 shadow-sm scale-105'
                  : isDisabled
                    ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-200 hover:bg-purple-50/50'
              )}
              aria-pressed={isSelected}
            >
              <span>{tag.emoji}</span>
              <span>{tag.label}</span>
            </button>
          );
        })}
      </div>
      {maxTags > 1 && (
        <p className="text-xs text-gray-500">Select up to {maxTags}</p>
      )}
    </div>
  );
}

interface EmotionTagChipsProps {
  tags: string[];
  className?: string;
}

export function EmotionTagChips({ tags, className }: EmotionTagChipsProps) {
  if (!tags.length) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tagId) => {
        const tag = EMOTION_TAGS.find((t) => t.id === tagId);
        if (!tag) return null;
        return (
          <span
            key={tagId}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200"
          >
            <span>{tag.emoji}</span>
            <span>{tag.label}</span>
          </span>
        );
      })}
    </div>
  );
}
