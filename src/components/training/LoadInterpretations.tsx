
import { LoadInterpretation } from "@/types/trainingLoad";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const INTERPRETATION_ICONS = {
  warning: AlertCircle,
  caution: AlertTriangle,
  info: Info,
};

const INTERPRETATION_STYLES = {
  warning: "bg-red-50 border-red-200 text-red-800",
  caution: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

interface LoadInterpretationsProps {
  interpretations: LoadInterpretation[];
  canAccessInsights: boolean;
}

export const LoadInterpretations = ({
  interpretations,
  canAccessInsights,
}: LoadInterpretationsProps) => {
  if (interpretations.length === 0) {
    return null;
  }

  const visibleInterpretations = canAccessInsights ? interpretations : interpretations.slice(0, 1);

  return (
    <div className="space-y-2">
      {visibleInterpretations.map((interp, i) => {
        const Icon = INTERPRETATION_ICONS[interp.severity];
        return (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2 p-3 rounded-lg border text-sm",
              INTERPRETATION_STYLES[interp.severity]
            )}
          >
            <Icon className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold">{interp.headline}</p>
              <p className="mt-0.5">{interp.message}</p>
              {interp.action && (
                <p className="mt-1 text-xs opacity-80">{interp.action}</p>
              )}
            </div>
          </div>
        );
      })}
      {!canAccessInsights && interpretations.length > 0 && (
        <p className="text-xs text-muted-foreground text-center px-2">
          Pro unlocks all load insights and full mind–body correlation.
        </p>
      )}
    </div>
  );
};
