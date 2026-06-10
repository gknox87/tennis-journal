
export type PatternCategory = "match" | "wellness" | "reflection";
export type PatternConfidence = "low" | "medium" | "high";
export type PatternSeverity = "info" | "warning" | "positive";

export interface PatternEvidence {
  sampleSize: number;
  metric: number;
  baseline?: number;
  matchIds?: string[];
  dates?: string[];
  detail?: string;
}

export interface DetectedPattern {
  key: string;
  category: PatternCategory;
  headline: string;
  evidence: PatternEvidence;
  confidence: PatternConfidence;
}

export interface AthletePattern {
  id: string;
  user_id: string;
  sport_id: string | null;
  pattern_key: string;
  category: PatternCategory;
  headline: string;
  message: string;
  action: string | null;
  evidence: PatternEvidence | null;
  severity: PatternSeverity;
  is_dismissed: boolean;
  generated_at: string;
  expires_at: string | null;
}

export interface NarratedPattern {
  pattern_key: string;
  message: string;
  action: string;
  severity: PatternSeverity;
}

export const MIN_MATCHES_FOR_PATTERNS = 5;
export const PATTERN_EXPIRY_DAYS = 7;
export const PATTERN_REFRESH_COOLDOWN_MS = 24 * 60 * 60 * 1000;
