
import { useEffect } from "react";
import { AthletePattern } from "@/types/athletePattern";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, AlertCircle, Info, TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

const SEVERITY_ICONS = {
  warning: AlertCircle,
  info: Info,
  positive: TrendingUp,
  caution: AlertTriangle,
};

const SEVERITY_STYLES = {
  warning: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  positive: "bg-green-50 border-green-200 text-green-800",
  caution: "bg-amber-50 border-amber-200 text-amber-800",
};

interface PatternInsightCardProps {
  pattern: AthletePattern;
  onDismiss?: (id: string, patternKey: string) => void;
  compact?: boolean;
  trackView?: boolean;
}

export const PatternInsightCard = ({
  pattern,
  onDismiss,
  compact = false,
  trackView = false,
}: PatternInsightCardProps) => {
  const severity = pattern.severity in SEVERITY_ICONS ? pattern.severity : "info";
  const Icon = SEVERITY_ICONS[severity as keyof typeof SEVERITY_ICONS];

  useEffect(() => {
    if (trackView) {
      analytics.aiInsightsViewed(pattern.pattern_key);
    }
  }, [trackView, pattern.pattern_key]);

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border text-sm",
        compact ? "p-2.5" : "p-3",
        SEVERITY_STYLES[severity as keyof typeof SEVERITY_STYLES]
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="font-semibold cursor-default">{pattern.headline}</p>
              </TooltipTrigger>
              {pattern.evidence?.sampleSize && (
                <TooltipContent>
                  <p>Based on {pattern.evidence.sampleSize} data points</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-60 hover:opacity-100"
              onClick={() => onDismiss(pattern.id, pattern.pattern_key)}
              aria-label="Dismiss pattern"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <p className={cn("mt-0.5", compact && "line-clamp-2")}>{pattern.message}</p>
        {pattern.action && !compact && (
          <p className="mt-1 text-xs opacity-80">{pattern.action}</p>
        )}
      </div>
    </div>
  );
};
