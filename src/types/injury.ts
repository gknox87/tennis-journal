
export type BodyRegion =
  | "head_neck"
  | "shoulder_arm"
  | "elbow_forearm"
  | "wrist_hand"
  | "chest_upper_back"
  | "lower_back"
  | "hip_groin"
  | "thigh"
  | "knee"
  | "lower_leg"
  | "ankle_foot";

export type PainType =
  | "sharp"
  | "dull"
  | "aching"
  | "burning"
  | "stabbing"
  | "throbbing"
  | "tingling"
  | "stiffness";

export type OnsetType = "sudden" | "gradual" | "unknown";

export type ImpactLevel = "none" | "minor" | "moderate" | "severe" | "unable";

export type InjuryTrend = "improving" | "stable" | "worsening" | "new";

export type InjuryDuration = "acute" | "recurring" | "chronic";

export interface InjuryReport {
  id: string;
  user_id: string;
  sport_id?: string | null;
  created_at: string;
  updated_at: string;
  body_region: BodyRegion;
  body_part: string;
  coordinates?: { x: number; y: number } | null;
  pain_level: number;
  impact_on_training: ImpactLevel;
  pain_types: PainType[];
  onset_type: OnsetType;
  duration: InjuryDuration;
  trend: InjuryTrend;
  previous_report_id?: string | null;
  treatment_notes?: string | null;
  sought_medical_attention: boolean;
  restricted_from_training: boolean;
  photo_urls?: string[];
  shared_with_coach: boolean;
  coach_notified: boolean;
}

export interface BodyRegionDescriptor {
  value: BodyRegion;
  label: string;
  bodyParts: string[];
}

export const BODY_REGIONS: BodyRegionDescriptor[] = [
  {
    value: "head_neck",
    label: "Head & Neck",
    bodyParts: ["Head", "Neck - Left", "Neck - Right", "Jaw", "Throat"],
  },
  {
    value: "shoulder_arm",
    label: "Shoulder & Upper Arm",
    bodyParts: [
      "Left Shoulder - Anterior",
      "Left Shoulder - Posterior",
      "Right Shoulder - Anterior",
      "Right Shoulder - Posterior",
      "Left Upper Arm",
      "Right Upper Arm",
    ],
  },
  {
    value: "elbow_forearm",
    label: "Elbow & Forearm",
    bodyParts: [
      "Left Elbow - Medial",
      "Left Elbow - Lateral",
      "Right Elbow - Medial",
      "Right Elbow - Lateral",
      "Left Forearm",
      "Right Forearm",
    ],
  },
  {
    value: "wrist_hand",
    label: "Wrist & Hand",
    bodyParts: [
      "Left Wrist",
      "Right Wrist",
      "Left Hand",
      "Right Hand",
      "Left Fingers",
      "Right Fingers",
    ],
  },
  {
    value: "chest_upper_back",
    label: "Chest & Upper Back",
    bodyParts: [
      "Chest - Left",
      "Chest - Right",
      "Upper Back - Left",
      "Upper Back - Right",
      "Ribs - Left",
      "Ribs - Right",
    ],
  },
  {
    value: "lower_back",
    label: "Lower Back",
    bodyParts: [
      "Lower Back - Central",
      "Lower Back - Left",
      "Lower Back - Right",
      "Sacrum",
    ],
  },
  {
    value: "hip_groin",
    label: "Hip & Groin",
    bodyParts: [
      "Left Hip - Anterior",
      "Left Hip - Lateral",
      "Right Hip - Anterior",
      "Right Hip - Lateral",
      "Groin - Left",
      "Groin - Right",
    ],
  },
  {
    value: "thigh",
    label: "Thigh",
    bodyParts: [
      "Left Quadriceps",
      "Right Quadriceps",
      "Left Hamstring",
      "Right Hamstring",
      "Left Adductor",
      "Right Adductor",
    ],
  },
  {
    value: "knee",
    label: "Knee",
    bodyParts: [
      "Left Knee - Anterior",
      "Left Knee - Posterior",
      "Left Knee - Medial",
      "Left Knee - Lateral",
      "Right Knee - Anterior",
      "Right Knee - Posterior",
      "Right Knee - Medial",
      "Right Knee - Lateral",
    ],
  },
  {
    value: "lower_leg",
    label: "Lower Leg",
    bodyParts: [
      "Left Shin",
      "Right Shin",
      "Left Calf",
      "Right Calf",
      "Left Achilles",
      "Right Achilles",
    ],
  },
  {
    value: "ankle_foot",
    label: "Ankle & Foot",
    bodyParts: [
      "Left Ankle - Medial",
      "Left Ankle - Lateral",
      "Right Ankle - Medial",
      "Right Ankle - Lateral",
      "Left Foot",
      "Right Foot",
      "Left Toes",
      "Right Toes",
    ],
  },
];

export interface PainTypeDescriptor {
  value: PainType;
  label: string;
}

export const PAIN_TYPES: PainTypeDescriptor[] = [
  { value: "sharp", label: "Sharp" },
  { value: "dull", label: "Dull" },
  { value: "aching", label: "Aching" },
  { value: "burning", label: "Burning" },
  { value: "stabbing", label: "Stabbing" },
  { value: "throbbing", label: "Throbbing" },
  { value: "tingling", label: "Tingling" },
  { value: "stiffness", label: "Stiffness" },
];

export interface OnsetTypeDescriptor {
  value: OnsetType;
  label: string;
  description: string;
}

export const ONSET_TYPES: OnsetTypeDescriptor[] = [
  { value: "sudden", label: "Sudden", description: "Acute injury" },
  { value: "gradual", label: "Gradual", description: "Overuse" },
  { value: "unknown", label: "Unknown", description: "Not sure" },
];

export interface ImpactLevelDescriptor {
  value: ImpactLevel;
  label: string;
  description: string;
  color: string;
}

export const IMPACT_LEVELS: ImpactLevelDescriptor[] = [
  { value: "none", label: "None", description: "Can train normally", color: "#22c55e" },
  { value: "minor", label: "Minor", description: "Modified training", color: "#eab308" },
  { value: "moderate", label: "Moderate", description: "Significant restrictions", color: "#f97316" },
  { value: "severe", label: "Severe", description: "Cannot train", color: "#ef4444" },
  { value: "unable", label: "Unable", description: "Complete rest required", color: "#991b1b" },
];

export interface TrendDescriptor {
  value: InjuryTrend;
  label: string;
  icon: string;
  color: string;
}

export const INJURY_TRENDS: TrendDescriptor[] = [
  { value: "improving", label: "Improving", icon: "↑", color: "#22c55e" },
  { value: "stable", label: "Same", icon: "→", color: "#eab308" },
  { value: "worsening", label: "Worsening", icon: "↓", color: "#ef4444" },
  { value: "new", label: "New", icon: "●", color: "#3b82f6" },
];

export const DURATION_OPTIONS: { value: InjuryDuration; label: string }[] = [
  { value: "acute", label: "Acute (recent)" },
  { value: "recurring", label: "Recurring" },
  { value: "chronic", label: "Chronic (ongoing)" },
];

export interface PainLevelDescriptor {
  value: number;
  label: string;
  color: string;
}

export const PAIN_SCALE: PainLevelDescriptor[] = [
  { value: 0, label: "No Pain", color: "#E8F5E9" },
  { value: 1, label: "Minimal", color: "#C8E6C9" },
  { value: 2, label: "Mild", color: "#A5D6A7" },
  { value: 3, label: "Uncomfortable", color: "#81C784" },
  { value: 4, label: "Moderate", color: "#FFF59D" },
  { value: 5, label: "Distracting", color: "#FFE082" },
  { value: 6, label: "Distressing", color: "#FFD54F" },
  { value: 7, label: "Unmanageable", color: "#FFB74D" },
  { value: 8, label: "Intense", color: "#FF8A65" },
  { value: 9, label: "Severe", color: "#EF5350" },
  { value: 10, label: "Worst Possible", color: "#C62828" },
];

export function getPainColor(painLevel: number): string {
  if (painLevel <= 2) return "#22c55e";
  if (painLevel <= 4) return "#eab308";
  if (painLevel <= 6) return "#f97316";
  return "#ef4444";
}

export function getRegionLabel(region: BodyRegion): string {
  return BODY_REGIONS.find((r) => r.value === region)?.label ?? region;
}
