
export interface SetScore {
  playerScore: string;
  opponentScore: string;
  playerTiebreak?: string;
  opponentTiebreak?: string;
}
import type { MentalGameFields } from './mental';

export interface Match extends MentalGameFields {
  id: string;
  date: string;
  opponent_id: string | null;
  opponent_name: string;
  score: string;
  is_win: boolean;
  final_set_tiebreak?: boolean;
  notes?: string;
  created_at?: string;
  user_id?: string;
  court_type?: string | null;
  sport_id?: string | null;
  sport_slug?: string;
  sport_name?: string;
  sets?: SetScore[];
  reflection_prompt_used?: string | null;
  reflection_prompt_level?: string | null;
}
