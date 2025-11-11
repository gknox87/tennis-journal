export type PromptLevel = 'quick' | 'standard' | 'deep';

export type PromptType = 'post_match_win' | 'post_match_loss' | 'post_training';

export interface PromptQuestion {
  id: string;
  question: string;
  placeholder?: string;
  required?: boolean;
}

export type PromptAnswers = Record<string, string>;

export interface JournalingPreferences {
  prompt_level?: PromptLevel;
  [key: string]: unknown;
}

export interface ReflectionPromptMetadata {
  promptType: PromptType;
  promptLevel: PromptLevel;
  promptUsed: string; // e.g., "post_match_win_standard"
}

