
import { Card } from "@/components/ui/card";
import { useTrainingLoad } from "@/hooks/useTrainingLoad";
import { getRiskZone, getRiskZoneColor } from "@/utils/trainingLoadCalc";
import { Activity, TrendingUp, ArrowRight, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo } from "react";
import { differenceInDays, parseISO } from "date-fns";

export const TrainingLoadWidget = () => {
  const { metrics, isLoading, sessions } = useTrainingLoad();
  const navigate = useNavigate();

  // Check if we have at least 7 days of data for reliable ACWR — must be before any early return
  const daysOfData = useMemo(() => {
    if (sessions.length === 0) return 0;
    const dates = sessions.map((s) => parseISO(s.session_date));
    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    return differenceInDays(new Date(), earliest) + 1;
  }, [sessions]);

  const isACWRReliable = daysOfData >= 7;

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

  const riskZone = isACWRReliable ? getRiskZone(metrics.acwr) : "optimal";
  const riskColor = isACWRReliable ? getRiskZoneColor(riskZone) : "#6b7280";
  const riskLabel = isACWRReliable
    ? riskZone.charAt(0).toUpperCase() + riskZone.slice(1)
    : "Not enough data";

  if (!hasSessions) {
    return null;
  }

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
            {!isACWRReliable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  ACWR accuracy improves after 2–4 weeks of data.
                  You currently have {daysOfData} day{daysOfData > 1 ? "s" : ""}.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-2xl font-bold" style={{ color: riskColor }}>
            {metrics.acwr.toFixed(2)}
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
    </Card>
  );
};
