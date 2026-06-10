import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { ConfidenceDataPoint, formatConfidenceChartData } from '@/utils/confidenceTrendCalc';

interface ConfidenceTrendChartProps {
  data: ConfidenceDataPoint[];
}

export function ConfidenceTrendChart({ data }: ConfidenceTrendChartProps) {
  const chartData = formatConfidenceChartData(data);
  const hasDaily = data.some((d) => d.dailyConfidence != null);
  const hasMatch = data.some((d) => d.matchConfidence != null);

  if (!hasDaily && !hasMatch) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center px-4">
        <TrendingUp className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm font-medium text-foreground">No confidence data yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Log daily wellness check-ins or pre-match confidence on matches.
        </p>
      </div>
    );
  }

  const matchScatterData = chartData
    .filter((d) => d.matchConfidence != null)
    .map((d) => ({
      dateLabel: d.dateLabel,
      matchConfidence: d.matchConfidence,
      isWin: d.isWin,
      opponent: d.opponent,
    }));

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis
            yAxisId="daily"
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 11 }}
            stroke="#3b82f6"
            width={28}
            label={{ value: 'Daily (1–5)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#3b82f6' }}
          />
          {hasMatch && (
            <YAxis
              yAxisId="match"
              orientation="right"
              domain={[1, 10]}
              ticks={[1, 3, 5, 7, 10]}
              tick={{ fontSize: 11 }}
              stroke="#8b5cf6"
              width={32}
              label={{ value: 'Match (1–10)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#8b5cf6' }}
            />
          )}
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as ConfidenceDataPoint & { dateLabel: string };
              return (
                <div className="bg-white border rounded-lg shadow-lg p-2 text-xs">
                  <p className="font-semibold">{row.dateLabel}</p>
                  {row.dailyConfidence != null && (
                    <p className="text-blue-700">Daily confidence: {row.dailyConfidence}/5</p>
                  )}
                  {row.matchConfidence != null && (
                    <p className="text-purple-700">
                      Pre-match confidence: {row.matchConfidence}/10
                      {row.isWin !== undefined && ` · ${row.isWin ? 'Win' : 'Loss'}`}
                    </p>
                  )}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {hasDaily && (
            <Line
              yAxisId="daily"
              type="monotone"
              dataKey="dailyConfidence"
              name="Daily wellness"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, fill: '#3b82f6' }}
              connectNulls
            />
          )}
          {hasMatch && (
            <Scatter
              yAxisId="match"
              data={matchScatterData}
              dataKey="matchConfidence"
              name="Pre-match (matches)"
              fill="#8b5cf6"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground text-center">
        Blue line: daily wellness confidence. Purple dots: pre-match confidence on match days.
      </p>
    </div>
  );
}
