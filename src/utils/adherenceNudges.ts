import { Match } from '@/types/match';
import { hasReflectionData } from '@/components/match/MatchReflectionSection';

const REFLECTION_FRESH_MS = 2 * 60 * 60 * 1000; // 2 hours — emotional recall window

export interface ReflectionNudgeMatch {
  id: string;
  opponent_name?: string | null;
  created_at: string;
  minutesAgo: number;
}

export function findReflectionNudgeMatch(matches: Match[]): ReflectionNudgeMatch | null {
  const now = Date.now();

  const candidate = [...matches]
    .filter((m) => {
      if (hasReflectionData(m)) return false;
      if (!m.created_at) return false;
      const age = now - new Date(m.created_at).getTime();
      return age >= 0 && age <= REFLECTION_FRESH_MS;
    })
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())[0];

  if (!candidate?.created_at) return null;

  const minutesAgo = Math.round((now - new Date(candidate.created_at).getTime()) / 60000);

  return {
    id: candidate.id,
    opponent_name: candidate.opponent_name,
    created_at: candidate.created_at,
    minutesAgo,
  };
}

export function formatNotificationBody(body: string | null): string {
  if (!body) return '';
  return body
    .replace(/\s*\(match:[a-f0-9-]+\)/gi, '')
    .replace(/\s*\(event:[a-f0-9-]+\)/gi, '')
    .trim();
}
