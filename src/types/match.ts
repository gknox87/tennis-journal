
export interface SetScore {
  playerScore: string;
  opponentScore: string;
}

export interface Match {
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
  sets?: SetScore[];
}
