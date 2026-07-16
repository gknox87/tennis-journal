
import { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceDot,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LoadWellnessTimelinePoint,
  WellnessOverlayMetric,
} from "@/types/trainingLoad";
import { Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const METRIC_CONFIG: Record<
  WellnessOverlayMetric,
  { label: string; color: string; dataKey: keyof LoadWellnessTimelinePoint; scale: string }
> = {
  mood: { label: "Mood", color: "#10b981", dataKey: "mood", scale: "1–5" },
  confidence: { label: "Confidence", color: "#3b82f6", dataKey: "confidence", scale: "1–5" },
  stress: { label: "Stress", color: "#f59e0b", dataKey: "stress", scale: "1–5" },
  totalWellness: { label: "Total wellness", color: "#8b5cf6", dataKey: "totalWellness", scale: "score" },
};

interface LoadWellnessChartProps {
  data: LoadWellnessTimelinePoint[];
  canAccessInsights: boolean;
  hasWellnessEntries: boolean;
}

export const LoadWellnessChart = ({
  data,
  canAccessInsights,
  hasWellnessEntries,
}: LoadWellnessChartProps) => {
  const navigate = useNavigate();
  const [activeMetrics, setActiveMetrics] = useState<WellnessOverlayMetric[]>([
    "mood",
    "confidence",
  ]);

  const toggleMetric = (metric: WellnessOverlayMetric) => {
    setActiveMetrics((prev) => {
      if (prev.includes(metric)) {
        return prev.length > 1 ? prev.filter((m) => m !== metric) : prev;
      }
      return prev.length < 2 ? [...prev, metric] : [prev[1], metric];
    });
  };

  const matchMarkerDays = data.filter(
    (d) => d.matchArousal != null || d.matchConfidence != null
  );

  const teaserData = data.slice(-7);
  const hasTeaserPoints = teaserData.some((d) => d.load > 0 || d.mood != null);

  if (!canAccessInsights && hasWellnessEntries && hasTeaserPoints) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-1">Mind & Body</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Your recent load and mood — a preview of how training and wellbeing connect.
        </p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={teaserData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis yAxisId="load" tick={{ fontSize: 10 }} width={32} />
              <YAxis yAxisId="wellness" orientation="right" domain={[1, 5]} ticks={[1, 3, 5]} tick={{ fontSize: 10 }} width={28} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as LoadWellnessTimelinePoint;
                  return (
                    <div className="bg-white border rounded-lg shadow-lg p-3 text-xs space-y-1">
                      <p className="font-semibold">{d.dateLabel}</p>
                      <p>Load: <strong>{d.load}</strong></p>
                      <p>Mood: <strong>{d.mood != null ? `${d.mood}/5` : '—'}</strong></p>
                    </div>
                  );
                }}
              />
              <Bar yAxisId="load" dataKey="load" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Training load" />
              <Line yAxisId="wellness" type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} connectNulls={false} name="Mood" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  }

  if (!hasWellnessEntries) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Mind & Body</h3>
        <div className="flex flex-col items-center justify-center h-40 text-center px-4">
          <Heart className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No wellness check-ins yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mb-4">
            Log daily check-ins to see how mood and confidence track with your training load.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/wellness")}>
            Go to Wellness
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </Card>
    );
  }

  const rightAxisDomain =
    activeMetrics.includes("totalWellness") && activeMetrics.length === 1
      ? [0, 30]
      : [1, 5];

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-1">Mind & Body</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Training load with wellness signals on one timeline (14 days)
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(Object.keys(METRIC_CONFIG) as WellnessOverlayMetric[]).map((metric) => {
          const config = METRIC_CONFIG[metric];
          const isActive = activeMetrics.includes(metric);
          return (
            <button
              key={metric}
              type="button"
              onClick={() => toggleMetric(metric)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                isActive
                  ? "font-semibold text-white border-transparent"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              )}
              style={isActive ? { backgroundColor: config.color } : undefined}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {matchMarkerDays.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {matchMarkerDays.map((d) => (
            <Badge
              key={d.date}
              variant="outline"
              className="text-[10px] bg-purple-50 text-purple-700 border-purple-200"
            >
              {d.dateLabel}
              {d.matchArousal != null && ` · Arousal ${d.matchArousal}`}
              {d.matchConfidence != null && ` · Conf ${d.matchConfidence}`}
            </Badge>
          ))}
        </div>
      )}

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis
              yAxisId="load"
              tick={{ fontSize: 10 }}
              label={{ value: "Load", angle: -90, position: "insideLeft", fontSize: 10 }}
            />
            <YAxis
              yAxisId="wellness"
              orientation="right"
              domain={rightAxisDomain as [number, number]}
              tick={{ fontSize: 10 }}
              label={{
                value: activeMetrics.map((m) => METRIC_CONFIG[m].scale).join(" / "),
                angle: 90,
                position: "insideRight",
                fontSize: 10,
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as LoadWellnessTimelinePoint;
                return (
                  <div className="bg-white border rounded-lg shadow-lg p-3 text-xs space-y-1">
                    <p className="font-semibold">{d.dateLabel}</p>
                    <p>
                      Load: <strong>{d.load}</strong>
                    </p>
                    {d.mood != null && <p>Mood: <strong>{d.mood}/5</strong></p>}
                    {d.confidence != null && (
                      <p>Confidence: <strong>{d.confidence}/5</strong></p>
                    )}
                    {d.stress != null && <p>Stress: <strong>{d.stress}/5</strong></p>}
                    {d.totalWellness != null && (
                      <p>Total wellness: <strong>{d.totalWellness}</strong></p>
                    )}
                    {d.matchArousal != null && (
                      <p className="text-purple-700">Match arousal: <strong>{d.matchArousal}/10</strong></p>
                    )}
                    {d.matchConfidence != null && (
                      <p className="text-purple-700">Match confidence: <strong>{d.matchConfidence}/10</strong></p>
                    )}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar
              yAxisId="load"
              dataKey="load"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="Training load"
            />
            {activeMetrics.map((metric) => {
              const config = METRIC_CONFIG[metric];
              return (
                <Line
                  key={metric}
                  yAxisId="wellness"
                  type="monotone"
                  dataKey={config.dataKey}
                  stroke={config.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: config.color }}
                  activeDot={{ r: 5 }}
                  connectNulls={false}
                  name={config.label}
                />
              );
            })}
            {data.map((d) =>
              d.matchArousal != null ? (
                <ReferenceDot
                  key={`arousal-${d.date}`}
                  x={d.dateLabel}
                  y={d.matchArousal / 2}
                  yAxisId="wellness"
                  r={5}
                  fill="#9333ea"
                  stroke="#fff"
                  strokeWidth={2}
                  label={{ value: "M", position: "top", fontSize: 9, fill: "#9333ea" }}
                />
              ) : null
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Purple dots mark match days (arousal scaled to wellness axis). Toggle up to 2 wellness lines.
      </p>
    </Card>
  );
};
