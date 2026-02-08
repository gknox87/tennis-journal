
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrainingSession } from "@/types/trainingLoad";
import { WeeklyLoadMetrics } from "@/types/trainingLoad";
import { getDailyLoadChartData, getACWRChartData, getWeeklyTotals, getActivityDistribution } from "@/utils/trainingLoadCalc";
import { LoadMetricCards } from "./LoadMetricCards";
import { DailyLoadChart } from "./DailyLoadChart";
import { ACWRChart } from "./ACWRChart";
import { WeeklyTrendChart } from "./WeeklyTrendChart";
import { ActivityDistribution } from "./ActivityDistribution";

interface LoadDashboardProps {
  sessions: TrainingSession[];
  metrics: WeeklyLoadMetrics;
}

export const LoadDashboard = ({ sessions, metrics }: LoadDashboardProps) => {
  const dailyData = useMemo(() => getDailyLoadChartData(sessions), [sessions]);
  const acwrData = useMemo(() => getACWRChartData(sessions), [sessions]);
  const weeklyTotals = useMemo(() => getWeeklyTotals(sessions), [sessions]);
  const activityDist = useMemo(() => getActivityDistribution(sessions), [sessions]);

  return (
    <div className="space-y-4">
      <LoadMetricCards metrics={metrics} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DailyLoadChart data={dailyData} />
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
