
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useTrainingLoad } from "@/hooks/useTrainingLoad";
import { useWellness } from "@/hooks/useWellness";
import { useSubscription } from "@/hooks/useSubscription";
import { getRiskZone, getRiskZoneColor, getRiskZoneLabel, getTrainingHistoryDays } from "@/utils/trainingLoadCalc";
import { generateLoadInterpretations } from "@/utils/loadWellnessCalc";
import { Activity, TrendingUp, ArrowRight, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const TrainingLoadWidget = () => {
  const { metrics, isLoading, sessions } = useTrainingLoad();
  const { entries: wellnessEntries } = useWellness({ fetchDays: 28 });
  const { canAccessWellnessLoadInsights } = useSubscription();
  const navigate = useNavigate();

  const topInterpretation = useMemo(() => {
    if (!canAccessWellnessLoadInsights()) return null;
    const interpretations = generateLoadInterpretations(sessions, metrics, wellnessEntries);
    const actionable = interpretations.find((i) => i.severity !== "info");
    return actionable ?? interpretations[0] ?? null;
  }, [sessions, metrics, wellnessEntries, canAccessWellnessLoadInsights]);

  const daysOfData = getTrainingHistoryDays(sessions);
  const acwrAvailable = metrics.acwrReliable && metrics.acwr !== null;

  const hasSessions = sessions.length > 0;

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  if (!hasSessions) {
    return null;
  }

  const riskZone = acwrAvailable ? getRiskZone(metrics.acwr!) : null;
  const riskColor = acwrAvailable ? getRiskZoneColor(riskZone!) : "#6b7280";
  const riskLabel = acwrAvailable ? getRiskZoneLabel(riskZone!) : "Not enough data";

  return (
    <Card className="p-4 sm:p-5 bg-white/60 backdrop-blur-sm border-border/50 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-primary" />
          Training Load
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-primary gap-1 h-7 px-2"
          onClick={() => navigate("/training-load")}
        >
          Details <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">ACWR</p>
            {!acwrAvailable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  ACWR needs at least 4 weeks of logged sessions.
                  You currently have {daysOfData} day{daysOfData !== 1 ? "s" : ""} of history.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-2xl font-bold" style={{ color: riskColor }}>
            {acwrAvailable ? metrics.acwr!.toFixed(2) : "—"}
          </p>
          <p className="text-xs" style={{ color: riskColor }}>{riskLabel}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Weekly Load</p>
          <p className="text-2xl font-bold text-foreground">
            {metrics.weeklyTotalLoad.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />
            {Math.round(metrics.dailyAverageLoad)}/day avg
          </p>
        </div>
      </div>

      {topInterpretation && topInterpretation.severity !== "info" && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3 leading-relaxed">
          <span className="font-semibold">{topInterpretation.headline}: </span>
          {topInterpretation.message}
        </p>
      )}
    </Card>
  );
};
