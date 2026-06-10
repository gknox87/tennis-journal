import type { PromptLevel } from '@/types/reflection';

export interface ReflectionEntry {
  question: string;
  answer: string;
}

export function formatAnswersToNotes(
  prompts: Array<{ id: string; question: string }>,
  answers: Record<string, string>
): string {
  const sections = prompts
    .filter((prompt) => answers[prompt.id]?.trim())
    .map((prompt) => {
      const answer = answers[prompt.id].trim();
      return `${prompt.question}\n${answer}`;
    });

  return sections.join('\n\n');
}

export function parseReflectionNotes(notes: string): ReflectionEntry[] {
  if (!notes?.trim()) return [];

  return notes
    .split('\n\n')
    .filter((section) => section.trim())
    .map((section) => {
      const lines = section.split('\n');
      if (lines.length >= 2) {
        return {
          question: lines[0].trim(),
          answer: lines.slice(1).join('\n').trim(),
        };
      }
      return { question: '', answer: section.trim() };
    })
    .filter((entry) => entry.answer);
}

export function isGuidedReflection(match: {
  reflection_prompt_used?: string | null;
  notes?: string | null;
}): boolean {
  if (match.reflection_prompt_used) return true;
  const entries = parseReflectionNotes(match.notes || '');
  return entries.length >= 2;
}

export function getReflectionLevelLabel(level?: string | null): string | null {
  if (!level) return null;
  const labels: Record<PromptLevel, string> = {
    quick: 'Quick',
    standard: 'Standard',
    deep: 'Deep',
  };
  return labels[level as PromptLevel] || null;
}

export function parseNervesRating(answer: string): number | null {
  const match = answer.match(/^(\d{1,2})\/10\b/);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  return value >= 1 && value <= 10 ? value : null;
}
