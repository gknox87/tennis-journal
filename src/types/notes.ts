export interface PlayerNote {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  image_url?: string | null;
  sport_id?: string | null;
}