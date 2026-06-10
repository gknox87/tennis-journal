
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrainingSession, WeeklyLoadMetrics } from "@/types/trainingLoad";
import { WellnessEntry } from "@/types/wellness";
import { getDailyLoadChartData, getACWRChartData, getWeeklyTotals, getActivityDistribution } from "@/utils/trainingLoadCalc";
import { getLoadWellnessTimeline, generateLoadInterpretations } from "@/utils/loadWellnessCalc";
import { LoadMetricCards } from "./LoadMetricCards";
import { LoadInterpretations } from "./LoadInterpretations";
import { DailyLoadChart } from "./DailyLoadChart";
import { LoadWellnessChart } from "./LoadWellnessChart";
import { ACWRChart } from "./ACWRChart";
import { WeeklyTrendChart } from "./WeeklyTrendChart";
import { ActivityDistribution } from "./ActivityDistribution";

interface LoadDashboardProps {
  sessions: TrainingSession[];
  metrics: WeeklyLoadMetrics;
  wellnessEntries?: WellnessEntry[];
  canAccessInsights?: boolean;
}

export const LoadDashboard = ({
  sessions,
  metrics,
  wellnessEntries = [],
  canAccessInsights = false,
}: LoadDashboardProps) => {
  const dailyData = useMemo(() => getDailyLoadChartData(sessions), [sessions]);
  const acwrData = useMemo(() => getACWRChartData(sessions), [sessions]);
  const weeklyTotals = useMemo(() => getWeeklyTotals(sessions), [sessions]);
  const activityDist = useMemo(() => getActivityDistribution(sessions), [sessions]);
  const loadWellnessTimeline = useMemo(
    () => getLoadWellnessTimeline(sessions, wellnessEntries),
    [sessions, wellnessEntries]
  );
  const interpretations = useMemo(
    () => generateLoadInterpretations(sessions, metrics, wellnessEntries),
    [sessions, metrics, wellnessEntries]
  );

  return (
    <div className="space-y-4">
      <LoadMetricCards metrics={metrics} />

      <LoadInterpretations
        interpretations={interpretations}
        canAccessInsights={canAccessInsights}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DailyLoadChart data={dailyData} />
          <LoadWellnessChart
            data={loadWellnessTimeline}
            canAccessInsights={canAccessInsights}
            hasWellnessEntries={wellnessEntries.length > 0}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <ACWRChart data={acwrData} />
          <WeeklyTrendChart data={weeklyTotals} />
        </TabsContent>

        <TabsContent value="distribution">
          <ActivityDistribution data={activityDist} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
