import { supabase } from '@/integrations/supabase/client';
import type { PreMatchState } from '@/types/mental';
import { scheduledStateToPreMatchState } from '@/components/mental/PreMatchStateForm';

export async function findMatchingScheduledEvent(
  userId: string,
  matchDate: string,
  opponentName?: string
): Promise<{ id: string; pre_match_state: PreMatchState | null } | null> {
  const dayStart = `${matchDate}T00:00:00`;
  const dayEnd = `${matchDate}T23:59:59`;

  const { data: events } = await supabase
    .from('scheduled_events')
    .select('id, title, pre_match_state, start_time')
    .eq('user_id', userId)
    .eq('session_type', 'match')
    .gte('start_time', dayStart)
    .lte('start_time', dayEnd);

  if (!events?.length) return null;

  if (opponentName?.trim()) {
    const normalized = opponentName.trim().toLowerCase();
    const matched = events.find((e) =>
      e.title.toLowerCase().includes(normalized)
    );
    if (matched) {
      return {
        id: matched.id,
        pre_match_state: scheduledStateToPreMatchState(
          matched.pre_match_state as PreMatchState | null
        ),
      };
    }
  }

  const first = events[0];
  return {
    id: first.id,
    pre_match_state: scheduledStateToPreMatchState(
      first.pre_match_state as PreMatchState | null
    ),
  };
}

export async function saveScheduledPreMatchState(
  eventId: string,
  state: PreMatchState
): Promise<void> {
  const { error } = await supabase
    .from('scheduled_events')
    .update({ pre_match_state: state })
    .eq('id', eventId);

  if (error) throw error;
}
