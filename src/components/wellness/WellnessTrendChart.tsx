
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { WellnessTrendPoint } from "@/utils/wellnessCalc";
import { WELLNESS_ZONE_COLORS, WELLNESS_MAX_SCORE } from "@/types/wellness";
import { WELLNESS_CHART_MIN_ENTRIES } from "@/utils/sportLabels";
import { format, parseISO } from "date-fns";
import { TrendingUp } from "lucide-react";

interface WellnessTrendChartProps {
  data: WellnessTrendPoint[];
}

function WellnessChartEmptyState({
  entryCount,
  minEntries,
}: {
  entryCount: number;
  minEntries: number;
}) {
  const remaining = minEntries - entryCount;
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center px-4">
      <TrendingUp className="h-10 w-10 text-muted-foreground/40 mb-3" />
      <p className="text-sm font-medium text-foreground">
        {entryCount === 0
          ? "No wellness data yet"
          : `${entryCount} check-in${entryCount === 1 ? "" : "s"} logged`}
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        {entryCount === 0
          ? "Complete your first daily check-in to start tracking."
          : `Log ${remaining} more daily check-in${remaining === 1 ? "" : "s"} to see meaningful trends.`}
      </p>
    </div>
  );
}

export const WellnessTrendChart = ({ data }: WellnessTrendChartProps) => {
  if (data.length < WELLNESS_CHART_MIN_ENTRIES) {
    return (
      <WellnessChartEmptyState
        entryCount={data.length}
        minEntries={WELLNESS_CHART_MIN_ENTRIES}
      />
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), "MMM dd"),
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

          <ReferenceArea y1={0} y2={13} fill={WELLNESS_ZONE_COLORS.critical} fillOpacity={0.08} />
          <ReferenceArea y1={14} y2={18} fill={WELLNESS_ZONE_COLORS.concern} fillOpacity={0.08} />
          <ReferenceArea y1={19} y2={24} fill={WELLNESS_ZONE_COLORS.moderate} fillOpacity={0.08} />
          <ReferenceArea y1={25} y2={30} fill={WELLNESS_ZONE_COLORS.good} fillOpacity={0.08} />

          <ReferenceLine y={14} stroke={WELLNESS_ZONE_COLORS.concern} strokeDasharray="4 4" opacity={0.5} />
          <ReferenceLine y={19} stroke={WELLNESS_ZONE_COLORS.moderate} strokeDasharray="4 4" opacity={0.5} />
          <ReferenceLine y={25} stroke={WELLNESS_ZONE_COLORS.good} strokeDasharray="4 4" opacity={0.5} />

          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, WELLNESS_MAX_SCORE]}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            ticks={[6, 12, 18, 24, 30]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border rounded-lg shadow-lg p-3 text-xs space-y-1">
                  <p className="font-semibold">{d.dateLabel}</p>
                  <p>Total: <strong>{d.score}/{WELLNESS_MAX_SCORE}</strong></p>
                  <p>Sleep: {d.sleep} · Fatigue: {d.fatigue}</p>
                  <p>Stress: {d.stress} · Mood: {d.mood}</p>
                  <p>Motivation: {d.motivation} · Confidence: {d.confidence}</p>
                  {d.soreness != null && <p>Soreness: {d.soreness}</p>}
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#8b5cf6" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface WellnessBreakdownChartProps {
  data: WellnessTrendPoint[];
}

export const WellnessBreakdownChart = ({ data }: WellnessBreakdownChartProps) => {
  if (data.length < WELLNESS_CHART_MIN_ENTRIES) {
    return (
      <WellnessChartEmptyState
        entryCount={data.length}
        minEntries={WELLNESS_CHART_MIN_ENTRIES}
      />
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), "MMM dd"),
  }));

  const hasSoreness = data.some((d) => d.soreness != null);

  const lines = [
    { key: "sleep", color: "#3b82f6", label: "Sleep", bg: "bg-blue-100" },
    { key: "fatigue", color: "#f97316", label: "Fatigue", bg: "bg-orange-100" },
    { key: "stress", color: "#a855f7", label: "Stress", bg: "bg-purple-100" },
    { key: "mood", color: "#10b981", label: "Mood", bg: "bg-emerald-100" },
    { key: "motivation", color: "#f59e0b", label: "Motivation", bg: "bg-amber-100" },
    { key: "confidence", color: "#6366f1", label: "Confidence", bg: "bg-indigo-100" },
    ...(hasSoreness
      ? [{ key: "soreness", color: "#ef4444", label: "Soreness", bg: "bg-red-100" }]
      : []),
  ];

  return (
    <div className="w-full h-48 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="#e2e8f0" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[1, 5]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            ticks={[1, 2, 3, 4, 5]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              padding: "8px",
            }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-slate-800">{d.dateLabel}</p>
                  {lines.map((l) => (
                    <div key={l.key} className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                        {l.label}:
                      </span>
                      <span className="font-medium" style={{ color: l.color }}>
                        {d[l.key] ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          {lines.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              stroke={l.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: l.color, stroke: "#fff", strokeWidth: 2 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-slate-200 overflow-x-auto">
        {lines.map((l) => (
          <div
            key={l.key}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${l.bg} flex-shrink-0`}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-slate-700 whitespace-nowrap">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
