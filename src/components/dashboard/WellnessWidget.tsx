
import { Card } from "@/components/ui/card";
import { useWellness } from "@/hooks/useWellness";
import { getWellnessZoneColor, getWellnessZoneLabel } from "@/utils/wellnessCalc";
import { Heart, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export const WellnessWidget = () => {
  const { metrics, isLoading, todayEntry } = useWellness();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  const hasData = metrics.todayScore !== null;
  const zoneColor = metrics.todayZone ? getWellnessZoneColor(metrics.todayZone) : undefined;
  const zoneLabel = metrics.todayZone ? getWellnessZoneLabel(metrics.todayZone) : undefined;

  // Last 7 days for sparkline
  const sparkData = metrics.trend.slice(-7);

  return (
    <Card
      className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-rose-50 via-white to-pink-50"
      onClick={() => navigate("/wellness")}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-pink-500" />
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <Heart className="h-4 w-4 text-rose-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Wellness</h3>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </div>

        {hasData ? (
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-0.5">Today</p>
                <p className="text-3xl font-bold tracking-tight" style={{ color: zoneColor }}>
                  {metrics.todayScore}<span className="text-base font-medium text-gray-400">/25</span>
                </p>
                <p className="text-xs font-medium mt-0.5" style={{ color: zoneColor }}>
                  {zoneLabel}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-0.5">7-Day Avg</p>
                <p className="text-2xl font-bold text-gray-800">
                  {metrics.weeklyAverage}
                </p>
                <div className="text-xs text-gray-500 flex items-center justify-end gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  {metrics.streak} day streak
                </div>
              </div>
            </div>
            {sparkData.length > 1 && (
              <div className="h-10 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={zoneColor || "#f43f5e"}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 mb-2">No check-in today</p>
            <span className="text-xs font-medium text-rose-500">Tap to check in</span>
          </div>
        )}
      </div>
    </Card>
  );
};
