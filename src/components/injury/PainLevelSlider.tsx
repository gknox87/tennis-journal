
import { PAIN_SCALE } from "@/types/injury";
import { cn } from "@/lib/utils";

interface PainLevelSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const PainLevelSlider = ({ value, onChange }: PainLevelSliderProps) => {
  const descriptor = PAIN_SCALE[value];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground text-center">
        How much pain are you experiencing?
      </p>
      <div className="flex gap-3 items-stretch">
        {/* Vertical scale labels */}
        <div className="flex flex-col-reverse justify-between py-1 min-w-0">
          {PAIN_SCALE.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={cn(
                "flex items-center gap-2 min-h-[32px] px-2 py-0.5 rounded-lg text-left transition-all text-xs",
                value === item.value
                  ? "ring-2 ring-primary font-bold scale-105"
                  : "opacity-60 hover:opacity-100"
              )}
              style={{ backgroundColor: item.color + "40" }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  backgroundColor: item.color,
                  color: item.value >= 9 ? "#fff" : "#000",
                }}
              >
                {item.value}
              </span>
              <span className="truncate hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Current selection display */}
        <div
          className="flex flex-col items-center justify-center flex-1 rounded-xl p-4"
          style={{ backgroundColor: descriptor.color + "30" }}
        >
          <span
            className="text-5xl font-black mb-2"
            style={{
              color:
                descriptor.color === "#FFF59D" ||
                descriptor.color === "#FFE082" ||
                descriptor.color === "#FFD54F"
                  ? "#7B6900"
                  : descriptor.value >= 8
                  ? descriptor.color
                  : undefined,
            }}
          >
            {value}
          </span>
          <span className="text-sm font-semibold text-center">{descriptor.label}</span>
          <div className="mt-3 w-full h-3 rounded-full overflow-hidden bg-muted">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(value / 10) * 100}%`,
                backgroundColor: descriptor.color,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
