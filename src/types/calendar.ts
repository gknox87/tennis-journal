
export type SessionType = 'training' | 'recovery' | 'match';

export interface ScheduledEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  session_type: SessionType;
  notes?: string | null;
}
