import { WellnessScaleDescriptor } from "@/types/wellness";

export interface SessionFeelOption {
  value: number;
  emoji: string;
  label: string;
}

export const SESSION_FEEL_OPTIONS: SessionFeelOption[] = [
  { value: 1, emoji: "😫", label: "Rough" },
  { value: 2, emoji: "😕", label: "Off" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

export const ENJOYMENT_DESCRIPTORS: WellnessScaleDescriptor[] = [
  { value: 1, label: "Didn't enjoy it at all" },
  { value: 2, label: "Mostly unenjoyable" },
  { value: 3, label: "Neutral — neither good nor bad" },
  { value: 4, label: "Mostly enjoyable" },
  { value: 5, label: "Really enjoyed it" },
];

export function getSessionFeelEmoji(value: number | null | undefined): string | null {
  if (value == null) return null;
  const option = SESSION_FEEL_OPTIONS.find((o) => o.value === value);
  return option?.emoji ?? null;
}

export function getSessionFeelLabel(value: number | null | undefined): string | null {
  if (value == null) return null;
  const option = SESSION_FEEL_OPTIONS.find((o) => o.value === value);
  return option?.label ?? null;
}

export function getEnjoymentLabel(value: number | null | undefined): string | null {
  if (value == null) return null;
  const descriptor = ENJOYMENT_DESCRIPTORS.find((d) => d.value === value);
  return descriptor?.label ?? null;
}

const ENJOYMENT_TEXT_COLORS = [
  "text-red-700",
  "text-orange-700",
  "text-yellow-700",
  "text-lime-700",
  "text-green-700",
];

export function getEnjoymentTextColor(value: number | null | undefined): string {
  if (value == null || value < 1 || value > 5) return "text-gray-600";
  return ENJOYMENT_TEXT_COLORS[value - 1];
}
