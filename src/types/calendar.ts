
export type SessionType = 'training' | 'recovery' | 'match';

export interface ScheduledEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  session_type: SessionType;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
