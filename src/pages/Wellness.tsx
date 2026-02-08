
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { useSport } from "@/context/SportContext";
import { useWellness } from "@/hooks/useWellness";
import { WellnessQuestionnaire } from "@/components/wellness/WellnessQuestionnaire";
import { WellnessTrendChart, WellnessBreakdownChart } from "@/components/wellness/WellnessTrendChart";
import { getWellnessZone, getWellnessZoneColor, getWellnessZoneLabel } from "@/utils/wellnessCalc";
import { WELLNESS_QUESTIONS } from "@/types/wellness";
import { Plus, Heart, Trash2, AlertTriangle, AlertCircle, Info, Flame } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const ALERT_ICONS = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const ALERT_STYLES = {
  critical: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const Wellness = () => {
  const { sport } = useSport();
  const { entries, isLoading, submitEntry, deleteEntry, todayEntry, metrics } = useWellness();
  const [showDialog, setShowDialog] = useState(false);

  const recentEntries = [...entries].reverse().slice(0, 14);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <Header userProfile={null} />
      <div className="container mx-auto px-4 py-6 pb-24 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <Heart className="h-6 w-6 text-rose-500" /> Wellness
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Daily wellness check-in for {sport.shortName}
              </p>
            </div>
          </div>
          {entries.length > 0 && (
            <div className="flex gap-2 mt-3">
              <Button onClick={() => setShowDialog(true)} size="lg" className="shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                {todayEntry ? "Update Check-in" : "Check In"}
              </Button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {metrics.alerts.length > 0 && (
          <div className="space-y-2 mb-6">
            {metrics.alerts.map((alert, i) => {
              const AlertIcon = ALERT_ICONS[alert.type];
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2 p-3 rounded-lg border text-sm",
                    ALERT_STYLES[alert.type]
                  )}
                >
                  <AlertIcon className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{alert.message}</span>
                </div>
              );
            })}
          </div>
        )}

        {entries.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center bg-gradient-to-r from-rose-50 to-purple-50">
            <Heart className="h-12 w-12 mx-auto mb-4 text-rose-500 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Check-ins Yet</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Start your daily wellness check-in to track sleep, fatigue, soreness, stress, and mood.
            </p>
            <Button onClick={() => setShowDialog(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" /> Your First Check-in
            </Button>
          </Card>
        ) : (
          <>
            {/* Recent entries */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Recent Check-ins</h2>
              <div className="space-y-2">
                {recentEntries.map((entry) => {
                  const zone = getWellnessZone(entry.total_wellness_score);
                  const zoneColor = getWellnessZoneColor(zone);
                  return (
                    <Card key={entry.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ backgroundColor: zoneColor }}
                        >
                          {entry.total_wellness_score}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {format(parseISO(entry.entry_date), "EEEE, MMM dd")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            S:{entry.sleep_quality} F:{entry.fatigue} M:{entry.muscle_soreness} St:{entry.stress_level} Mo:{entry.mood}
                            {entry.sleep_duration_hours ? ` · ${entry.sleep_duration_hours}h sleep` : ""}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive/60 hover:text-destructive"
                        onClick={() => deleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Card className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Today</p>
                {metrics.todayScore !== null && metrics.todayZone !== null ? (
                  <>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: getWellnessZoneColor(metrics.todayZone) }}
                    >
                      {metrics.todayScore}
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{ color: getWellnessZoneColor(metrics.todayZone) }}
                    >
                      {getWellnessZoneLabel(metrics.todayZone)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </Card>
              <Card className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">7-Day Avg</p>
                <p className="text-2xl font-bold text-foreground">{metrics.weeklyAverage}</p>
                <p className="text-xs text-muted-foreground">/25</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Streak</p>
                <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                  <Flame className="h-5 w-5 text-orange-500" />
                  {metrics.streak}
                </p>
                <p className="text-xs text-muted-foreground">days</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Entries</p>
                <p className="text-2xl font-bold text-foreground">{entries.length}</p>
                <p className="text-xs text-muted-foreground">last 30 days</p>
              </Card>
            </div>

            {/* Trend chart */}
            <Card className="p-4 mb-6">
              <h2 className="text-sm font-semibold mb-3">Wellness Trend</h2>
              <WellnessTrendChart data={metrics.trend} />
            </Card>

            {/* Breakdown chart */}
            <Card className="p-5 mb-8 bg-gradient-to-br from-slate-50/50 to-white border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-white rounded-full" />
                </div>
                <h2 className="text-sm font-semibold text-slate-800">Construct Breakdown</h2>
              </div>
              <WellnessBreakdownChart data={metrics.trend} />
            </Card>
          </>
        )}

        <WellnessQuestionnaire
          open={showDialog}
          onOpenChange={setShowDialog}
          onSubmit={submitEntry}
        />
      </div>
    </div>
  );
};

export default Wellness;
