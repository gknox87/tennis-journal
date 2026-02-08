
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InjuryReport,
  getPainColor,
  getRegionLabel,
  INJURY_TRENDS,
  IMPACT_LEVELS,
} from "@/types/injury";
import { format, parseISO } from "date-fns";
import { Trash2, TrendingUp, TrendingDown, Minus, Circle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveInjuryCardProps {
  injury: InjuryReport;
  onDelete: (id: string) => void;
  onUpdate?: (id: string) => void;
}

const TrendIcon = ({ trend }: { trend: string }) => {
  switch (trend) {
    case "improving":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "worsening":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    case "stable":
      return <Minus className="h-4 w-4 text-yellow-500" />;
    case "new":
      return <Circle className="h-4 w-4 text-blue-500" />;
    default:
      return null;
  }
};

export const ActiveInjuryCard = ({ injury, onDelete, onUpdate }: ActiveInjuryCardProps) => {
  const painColor = getPainColor(injury.pain_level);
  const trendInfo = INJURY_TRENDS.find((t) => t.value === injury.trend);
  const impactInfo = IMPACT_LEVELS.find((l) => l.value === injury.impact_on_training);

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-start gap-3">
        {/* Pain level indicator */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shrink-0"
          style={{
            backgroundColor: painColor + "20",
            color: painColor,
            border: `2px solid ${painColor}`,
          }}
        >
          {injury.pain_level}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold truncate">{injury.body_part}</h3>
            <TrendIcon trend={injury.trend} />
            {injury.shared_with_coach && (
              <Share2 className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {getRegionLabel(injury.body_region)} · {format(parseISO(injury.created_at), "MMM dd, yyyy")}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {injury.pain_types.map((pt) => (
              <span
                key={pt}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground"
              >
                {pt}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            {trendInfo && (
              <span style={{ color: trendInfo.color }}>
                {trendInfo.icon} {trendInfo.label}
              </span>
            )}
            {impactInfo && (
              <span>
                Impact:{" "}
                <span style={{ color: impactInfo.color }} className="font-medium">
                  {impactInfo.label}
                </span>
              </span>
            )}
          </div>
          {injury.restricted_from_training && (
            <div className="mt-1.5 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-block">
              Restricted from training
            </div>
          )}
        </div>

        {/* Actions */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-destructive/60 hover:text-destructive"
          onClick={() => onDelete(injury.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
