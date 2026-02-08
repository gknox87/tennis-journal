
import { cn } from "@/lib/utils";
import { WellnessScaleDescriptor } from "@/types/wellness";

const SCALE_COLORS = [
  { bg: "bg-red-100", ring: "ring-red-500", text: "text-red-700", fill: "#ef4444" },
  { bg: "bg-orange-100", ring: "ring-orange-500", text: "text-orange-700", fill: "#f97316" },
  { bg: "bg-yellow-100", ring: "ring-yellow-500", text: "text-yellow-700", fill: "#eab308" },
  { bg: "bg-lime-100", ring: "ring-lime-500", text: "text-lime-700", fill: "#84cc16" },
  { bg: "bg-green-100", ring: "ring-green-500", text: "text-green-700", fill: "#22c55e" },
];

interface WellnessScaleSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  descriptors: WellnessScaleDescriptor[];
}

export const WellnessScaleSelector = ({
  value,
  onChange,
  descriptors,
}: WellnessScaleSelectorProps) => {
  return (
    <div className="space-y-3">
      {descriptors.map((descriptor, index) => {
        const colors = SCALE_COLORS[index];
        const isSelected = value === descriptor.value;

        return (
          <button
            key={descriptor.value}
            type="button"
            onClick={() => onChange(descriptor.value)}
            className={cn(
              "w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200",
              "min-h-[56px] text-left",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              colors.ring.replace("ring-", "focus:ring-"),
              isSelected
                ? cn(colors.bg, "border-current shadow-md scale-[1.02]", colors.text)
                : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-all duration-200",
                isSelected
                  ? "text-white shadow-lg scale-110"
                  : "bg-gray-100 text-gray-500"
              )}
              style={isSelected ? { backgroundColor: colors.fill } : undefined}
            >
              {descriptor.value}
            </div>
            <span
              className={cn(
                "text-sm sm:text-base font-medium leading-snug",
                isSelected ? colors.text : "text-gray-600"
              )}
            >
              {descriptor.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
