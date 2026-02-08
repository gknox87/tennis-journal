
import { Card } from "@/components/ui/card";
import { WeeklyLoadMetrics } from "@/types/trainingLoad";
import { getRiskZone, getRiskZoneColor } from "@/utils/trainingLoadCalc";
import { Activity, TrendingUp, BarChart3, AlertTriangle } from "lucide-react";

interface LoadMetricCardsProps {
  metrics: WeeklyLoadMetrics;
}

export const LoadMetricCards = ({ metrics }: LoadMetricCardsProps) => {
  const riskZone = getRiskZone(metrics.acwr);
  const riskColor = getRiskZoneColor(riskZone);

  const cards = [
    {
      title: "ACWR",
      value: metrics.acwr.toFixed(2),
      subtitle: riskZone.charAt(0).toUpperCase() + riskZone.slice(1),
      icon: Activity,
      color: riskColor,
    },
    {
      title: "Weekly Load",
      value: metrics.weeklyTotalLoad.toLocaleString(),
      subtitle: `Avg ${Math.round(metrics.dailyAverageLoad)}/day`,
      icon: TrendingUp,
      color: "#6366f1",
    },
    {
      title: "Monotony",
      value: metrics.trainingMonotony.toFixed(2),
      subtitle: metrics.trainingMonotony > 2 ? "⚠️ High" : "Normal",
      icon: BarChart3,
      color: metrics.trainingMonotony > 2 ? "#F44336" : "#10b981",
    },
    {
      title: "Strain",
      value: Math.round(metrics.trainingStrain).toLocaleString(),
      subtitle: metrics.trainingStrain > 6000 ? "⚠️ High" : "Manageable",
      icon: AlertTriangle,
      color: metrics.trainingStrain > 6000 ? "#F44336" : "#8b5cf6",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-full shrink-0" style={{ backgroundColor: card.color + "20" }}>
                <Icon className="h-4 w-4" style={{ color: card.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className="text-lg sm:text-xl font-bold" style={{ color: card.color }}>
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
