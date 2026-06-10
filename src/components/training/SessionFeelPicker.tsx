import { cn } from "@/lib/utils";
import { SESSION_FEEL_OPTIONS } from "@/constants/sessionWellbeing";

interface SessionFeelPickerProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export const SessionFeelPicker = ({ value, onChange }: SessionFeelPickerProps) => {
  return (
    <div className="flex gap-2 sm:gap-3 justify-between">
      {SESSION_FEEL_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(isSelected ? null : option.value)}
            className={cn(
              "flex flex-col items-center gap-1 flex-1 min-h-[48px] p-2 sm:p-3 rounded-xl border-2 transition-all duration-200",
              "touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400",
              isSelected
                ? "border-blue-400 bg-blue-50 shadow-md scale-[1.02]"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
            )}
            aria-label={option.label}
            aria-pressed={isSelected}
          >
            <span className="text-2xl sm:text-3xl leading-none">{option.emoji}</span>
            <span
              className={cn(
                "text-[10px] sm:text-xs font-medium leading-tight text-center",
                isSelected ? "text-blue-700" : "text-gray-500"
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
