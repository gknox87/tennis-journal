
export interface Opponent {
  id: string;
  name: string;
  matches: {
    is_win: boolean;
    date: string;
    score: string;
  }[];
}
