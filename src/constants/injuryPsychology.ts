import { WellnessScaleDescriptor } from "@/types/wellness";

export const REHAB_MOOD_DESCRIPTORS: WellnessScaleDescriptor[] = [
  { value: 1, label: "Very frustrated / low mood" },
  { value: 2, label: "Struggling with motivation" },
  { value: 3, label: "Up and down" },
  { value: 4, label: "Mostly positive" },
  { value: 5, label: "Optimistic about recovery" },
];

export const RTP_CONFIDENCE_DESCRIPTORS: WellnessScaleDescriptor[] = [
  { value: 1, label: "Afraid to return — expect re-injury" },
  { value: 2, label: "Low confidence in the affected area" },
  { value: 3, label: "Uncertain — hesitant at full intensity" },
  { value: 4, label: "Mostly confident, still cautious" },
  { value: 5, label: "Fully confident — ready to compete" },
];

const REHAB_MOOD_EMOJIS = ["😫", "😕", "😐", "🙂", "😄"];
const SCALE_TEXT_COLORS = [
  "text-red-700",
  "text-orange-700",
  "text-yellow-700",
  "text-lime-700",
  "text-green-700",
];

export function getRehabMoodLabel(value: number | null | undefined): string | null {
  if (value == null) return null;
  return REHAB_MOOD_DESCRIPTORS.find((d) => d.value === value)?.label ?? null;
}

export function getRtpConfidenceLabel(value: number | null | undefined): string | null {
  if (value == null) return null;
  return RTP_CONFIDENCE_DESCRIPTORS.find((d) => d.value === value)?.label ?? null;
}

export function getRehabMoodEmoji(value: number | null | undefined): string | null {
  if (value == null || value < 1 || value > 5) return null;
  return REHAB_MOOD_EMOJIS[value - 1];
}

export function getPsychScaleTextColor(value: number | null | undefined): string {
  if (value == null || value < 1 || value > 5) return "text-gray-600";
  return SCALE_TEXT_COLORS[value - 1];
}
