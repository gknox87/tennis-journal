export interface PreMatchState {
  nerves?: number | null;
  confidence?: number | null;
  arousal?: number | null;
  process_goal?: string | null;
  emotion_tags?: string[];
  logged_at?: string;
}

export interface MentalGameFields {
  pre_nerves?: number | null;
  pre_confidence?: number | null;
  pre_arousal?: number | null;
  process_goal?: string | null;
  pre_emotion_tags?: string[];
  post_emotion_tags?: string[];
  scheduled_event_id?: string | null;
}
