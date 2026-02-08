
import { Card } from "@/components/ui/card";
import { useTrainingLoad } from "@/hooks/useTrainingLoad";
import { getRiskZone, getRiskZoneColor } from "@/utils/trainingLoadCalc";
import { Activity, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const TrainingLoadWidget = () => {
  const { metrics, isLoading, sessions } = useTrainingLoad();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  const riskZone = getRiskZone(metrics.acwr);
  const riskColor = getRiskZoneColor(riskZone);
  const riskLabel = riskZone.charAt(0).toUpperCase() + riskZone.slice(1);
  const hasSessions = sessions.length > 0;

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
          <p className="text-xs text-muted-foreground">ACWR</p>
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
