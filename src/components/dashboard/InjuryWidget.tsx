
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useInjuryReports } from "@/hooks/useInjuryReports";
import { getPainColor, getRegionLabel } from "@/types/injury";
import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

export const InjuryWidget = () => {
  const navigate = useNavigate();
  const { activeInjuries, isLoading } = useInjuryReports();

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  const hasInjuries = activeInjuries.length > 0;
  const worstPain = hasInjuries
    ? Math.max(...activeInjuries.map((i) => i.pain_level))
    : 0;

  const accentColor = hasInjuries ? getPainColor(worstPain) : "#22c55e";

  return (
    <Card
      className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 via-white to-amber-50"
      onClick={() => navigate("/injury-tracker")}
    >
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ background: hasInjuries ? `linear-gradient(to right, ${accentColor}, ${accentColor}aa)` : 'linear-gradient(to right, #22c55e, #4ade80)' }}
      />
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: accentColor + "18" }}
            >
              {hasInjuries ? (
                <AlertTriangle className="h-4 w-4" style={{ color: accentColor }} />
              ) : (
                <ShieldCheck className="h-4 w-4 text-green-500" />
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Injury Tracker</h3>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </div>

        {hasInjuries ? (
          <div className="space-y-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold" style={{ color: accentColor }}>
                {activeInjuries.length}
              </span>
              <span className="text-sm text-gray-500">
                active injur{activeInjuries.length === 1 ? "y" : "ies"}
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                Worst: {worstPain}/10
              </span>
            </div>
            <div className="space-y-1.5">
              {activeInjuries.slice(0, 2).map((injury) => (
                <div
                  key={injury.id}
                  className="flex items-center gap-2 text-xs text-gray-600 bg-white/60 rounded-lg px-2.5 py-1.5"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getPainColor(injury.pain_level) }}
                  />
                  <span className="truncate font-medium">{injury.body_part}</span>
                  <span className="text-gray-400 ml-auto shrink-0">
                    Pain {injury.pain_level}/10
                  </span>
                </div>
              ))}
              {activeInjuries.length > 2 && (
                <p className="text-[11px] text-gray-400 text-center">
                  +{activeInjuries.length - 2} more
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <p className="text-sm text-green-600 font-medium">All clear — no active injuries</p>
          </div>
        )}
      </div>
    </Card>
  );
};
