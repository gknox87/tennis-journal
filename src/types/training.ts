
export interface TrainingNote {
  id: string;
  user_id: string;
  coach_name?: string;
  training_date: string;
  training_time?: string;
  what_worked_on?: string;
  what_felt_good?: string;
  what_didnt_feel_good?: string;
  created_at: string;
  updated_at: string;
}
