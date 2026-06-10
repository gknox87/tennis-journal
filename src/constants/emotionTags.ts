export interface EmotionTag {
  id: string;
  label: string;
  emoji: string;
}

export const EMOTION_TAGS: EmotionTag[] = [
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'fired_up', label: 'Fired up', emoji: '🔥' },
  { id: 'flat', label: 'Flat', emoji: '😶' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😤' },
];

export const PROCESS_GOAL_SUGGESTIONS = [
  'Stay on routine',
  'One point at a time',
  'First serve %',
  'Positive self-talk',
];

export function getEmotionTag(id: string): EmotionTag | undefined {
  return EMOTION_TAGS.find((t) => t.id === id);
}

export function getEmotionTagLabel(id: string): string {
  return getEmotionTag(id)?.label ?? id;
}

export function getEmotionTagEmoji(id: string): string {
  return getEmotionTag(id)?.emoji ?? '';
}
