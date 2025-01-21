export interface Match {
  id: string;
  date: string;
  opponent_id: string | null;
  opponent_name: string;
  score: string;
  is_win: boolean;
  final_set_tiebreak?: boolean;
  notes?: string;
  tags?: { id: string; name: string; }[];
  created_at?: string;
  user_id?: string;
}