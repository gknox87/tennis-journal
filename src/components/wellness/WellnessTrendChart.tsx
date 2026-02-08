
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
import { WELLNESS_ZONE_COLORS } from "@/types/wellness";
import { format, parseISO } from "date-fns";

interface WellnessTrendChartProps {
  data: WellnessTrendPoint[];
}

export const WellnessTrendChart = ({ data }: WellnessTrendChartProps) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No data yet — check in daily to see trends.
      </div>
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

          {/* Zone bands */}
          <ReferenceArea y1={0} y2={11} fill={WELLNESS_ZONE_COLORS.critical} fillOpacity={0.08} />
          <ReferenceArea y1={12} y2={15} fill={WELLNESS_ZONE_COLORS.concern} fillOpacity={0.08} />
          <ReferenceArea y1={16} y2={20} fill={WELLNESS_ZONE_COLORS.moderate} fillOpacity={0.08} />
          <ReferenceArea y1={21} y2={25} fill={WELLNESS_ZONE_COLORS.good} fillOpacity={0.08} />

          <ReferenceLine y={12} stroke={WELLNESS_ZONE_COLORS.concern} strokeDasharray="4 4" opacity={0.5} />
          <ReferenceLine y={16} stroke={WELLNESS_ZONE_COLORS.moderate} strokeDasharray="4 4" opacity={0.5} />
          <ReferenceLine y={21} stroke={WELLNESS_ZONE_COLORS.good} strokeDasharray="4 4" opacity={0.5} />

          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 25]}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            ticks={[5, 10, 15, 20, 25]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border rounded-lg shadow-lg p-3 text-xs space-y-1">
                  <p className="font-semibold">{d.dateLabel}</p>
                  <p>Total: <strong>{d.score}/25</strong></p>
                  <p>Sleep: {d.sleep} · Fatigue: {d.fatigue}</p>
                  <p>Soreness: {d.soreness} · Stress: {d.stress}</p>
                  <p>Mood: {d.mood}</p>
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
  if (data.length === 0) return null;

  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), "MMM dd"),
  }));

  const lines = [
    { key: "sleep", color: "#3b82f6", label: "Sleep", bg: "bg-blue-100" },
    { key: "fatigue", color: "#f97316", label: "Fatigue", bg: "bg-orange-100" },
    { key: "soreness", color: "#ef4444", label: "Soreness", bg: "bg-red-100" },
    { key: "stress", color: "#a855f7", label: "Stress", bg: "bg-purple-100" },
    { key: "mood", color: "#10b981", label: "Mood", bg: "bg-emerald-100" },
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
                        {d[l.key]}
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
