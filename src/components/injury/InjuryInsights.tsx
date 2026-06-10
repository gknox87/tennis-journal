
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  InjuryReport,
  InjuryCheckIn,
  BodyRegion,
  getRegionLabel,
  getPainColor,
} from "@/types/injury";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AlertTriangle, Activity, MapPin, TrendingDown, Brain, CheckCircle2, Info } from "lucide-react";
import { InjuryPsychChart } from "./InjuryPsychChart";
import {
  buildPsychChartData,
  getInjuryPsychInterpretations,
} from "@/utils/injuryPsychCalc";
import { cn } from "@/lib/utils";

interface InjuryInsightsProps {
  reports: InjuryReport[];
  checkIns: InjuryCheckIn[];
  frequentRegions: { region: BodyRegion; count: number }[];
}

const SEVERITY_STYLES = {
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  positive: "bg-green-50 border-green-200 text-green-800",
};

const SEVERITY_ICONS = {
  warning: AlertTriangle,
  info: Info,
  positive: CheckCircle2,
};

export const InjuryInsights = ({ reports, checkIns, frequentRegions }: InjuryInsightsProps) => {
  const stats = useMemo(() => {
    if (reports.length === 0) return null;

    const activeCount = reports.filter(
      (r) => r.trend !== "improving" || r.pain_level > 0
    ).length;

    const restrictedCount = reports.filter(
      (r) => r.restricted_from_training
    ).length;

    const avgPain =
      reports.reduce((sum, r) => sum + r.pain_level, 0) / reports.length;

    const medicalCount = reports.filter(
      (r) => r.sought_medical_attention
    ).length;

    const painTypeCounts: Record<string, number> = {};
    reports.forEach((r) => {
      r.pain_types.forEach((pt) => {
        painTypeCounts[pt] = (painTypeCounts[pt] || 0) + 1;
      });
    });
    const topPainTypes = Object.entries(painTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalReports: reports.length,
      activeCount,
      restrictedCount,
      avgPain: avgPain.toFixed(1),
      medicalCount,
      topPainTypes,
    };
  }, [reports]);

  const chartData = useMemo(() => {
    return frequentRegions.slice(0, 6).map((fr) => ({
      name: getRegionLabel(fr.region).split(" ")[0],
      fullName: getRegionLabel(fr.region),
      count: fr.count,
      color: getPainColor(
        Math.max(
          ...reports
            .filter((r) => r.body_region === fr.region)
            .map((r) => r.pain_level),
          0
        )
      ),
    }));
  }, [frequentRegions, reports]);

  const psychInterpretations = useMemo(
    () => getInjuryPsychInterpretations(reports, checkIns),
    [reports, checkIns]
  );

  const activeWithCheckIns = useMemo(
    () =>
      reports.filter(
        (r) =>
          (r.trend !== "improving" || r.pain_level > 0) &&
          checkIns.some((c) => c.injury_report_id === r.id)
      ),
    [reports, checkIns]
  );

  if (!stats || reports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Report injuries to see insights here
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-orange-500" />
          <p className="text-2xl font-bold">{stats.activeCount}</p>
          <p className="text-xs text-muted-foreground">Active Injuries</p>
        </Card>
        <Card className="p-3 text-center">
          <Activity className="h-5 w-5 mx-auto mb-1 text-red-500" />
          <p className="text-2xl font-bold">{stats.avgPain}</p>
          <p className="text-xs text-muted-foreground">Avg Pain Level</p>
        </Card>
        <Card className="p-3 text-center">
          <TrendingDown className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
          <p className="text-2xl font-bold">{stats.restrictedCount}</p>
          <p className="text-xs text-muted-foreground">Training Restricted</p>
        </Card>
        <Card className="p-3 text-center">
          <MapPin className="h-5 w-5 mx-auto mb-1 text-blue-500" />
          <p className="text-2xl font-bold">{stats.totalReports}</p>
          <p className="text-xs text-muted-foreground">Total Reports</p>
        </Card>
      </div>

      {/* Psychological interpretations */}
      {psychInterpretations.length > 0 && (
        <div className="space-y-2">
          {psychInterpretations.map((interp, i) => {
            const Icon = SEVERITY_ICONS[interp.severity];
            return (
              <Card
                key={`${interp.injuryId}-${interp.headline}-${i}`}
                className={cn("p-4 border", SEVERITY_STYLES[interp.severity])}
              >
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">
                      {interp.headline}
                      {interp.bodyPart && (
                        <span className="font-normal text-xs ml-1.5 opacity-75">
                          ({interp.bodyPart})
                        </span>
                      )}
                    </p>
                    <p className="text-xs mt-0.5 opacity-90">{interp.message}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Rehab psychology charts */}
      {activeWithCheckIns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Brain className="h-4 w-4 text-purple-500" />
            Rehab Psychology Trends
          </h3>
          {activeWithCheckIns.map((injury) => (
            <Card key={injury.id} className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {injury.body_part}
              </p>
              <InjuryPsychChart
                data={buildPsychChartData(checkIns, injury)}
                bodyPart={injury.body_part}
              />
            </Card>
          ))}
        </div>
      )}

      {/* Frequent regions chart */}
      {chartData.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Most Affected Areas</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number, _name: string, props: { payload: { fullName: string } }) => [
                  `${value} report(s)`,
                  props.payload.fullName,
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Common pain types */}
      {stats.topPainTypes.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-2">Common Pain Types</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topPainTypes.map(([type, count]) => (
              <div
                key={type}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm"
              >
                <span className="font-medium capitalize">{type}</span>
                <span className="text-xs text-muted-foreground">({count})</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Medical attention summary */}
      {stats.medicalCount > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm">
            <span className="font-semibold text-blue-700">
              {stats.medicalCount} report(s)
            </span>{" "}
            involved seeking medical attention.
          </p>
        </Card>
      )}
    </div>
  );
};
