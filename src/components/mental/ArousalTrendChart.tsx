import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Brain, TrendingUp } from 'lucide-react';
import {
  ArousalDataPoint,
  AROUSAL_MIN_ENTRIES,
  computeOptimalZoneInsight,
  formatArousalTrendChartData,
} from '@/utils/arousalTrendCalc';
import { Card } from '@/components/ui/card';
import { ConfidenceTrendChart } from '@/components/mental/ConfidenceTrendChart';
import { ArousalPerformanceScatter } from '@/components/mental/ArousalPerformanceScatter';
import { ConfidenceDataPoint } from '@/utils/confidenceTrendCalc';

interface ArousalTrendChartProps {
  data: ArousalDataPoint[];
}

function ChartEmptyState({ entryCount }: { entryCount: number }) {
  const remaining = AROUSAL_MIN_ENTRIES - entryCount;
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center px-4">
      <TrendingUp className="h-10 w-10 text-muted-foreground/40 mb-3" />
      <p className="text-sm font-medium text-foreground">
        {entryCount === 0 ? 'No arousal data yet' : `${entryCount} log${entryCount === 1 ? '' : 's'} recorded`}
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        {entryCount === 0
          ? 'Log pre-match arousal on matches or session energy on training notes.'
          : `Log ${remaining} more to see your optimal performance zone (IZOF).`}
      </p>
    </div>
  );
}

export function ArousalTrendChart({ data }: ArousalTrendChartProps) {
  const insight = computeOptimalZoneInsight(data);
  const chartData = formatArousalTrendChartData(data).map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), 'MMM dd'),
  }));

  if (data.length < AROUSAL_MIN_ENTRIES) {
    return <ChartEmptyState entryCount={data.length} />;
  }

  return (
    <div className="space-y-4">
      {insight && (
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-sm text-purple-900">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
            <div>
              <p className="font-semibold mb-0.5">Your optimal zone</p>
              <p>{insight.message}</p>
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <ReferenceArea y1={4} y2={6} fill="#a855f7" fillOpacity={0.08} />
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
          />
          <YAxis
            domain={[1, 10]}
            ticks={[1, 3, 5, 7, 10]}
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
            width={28}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload;
              return (
                <div className="bg-white border rounded-lg shadow-lg p-2 text-xs">
                  <p className="font-semibold">{row.dateLabel}</p>
                  <p>Arousal: {row.arousal}/10</p>
                  <p className="capitalize">{row.source}</p>
                  {row.source === 'match' && row.isWin !== undefined && (
                    <p>{row.isWin ? 'Win' : 'Loss'}</p>
                  )}
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="arousal"
            stroke="#9333ea"
            strokeWidth={2}
            dot={{ r: 4, fill: '#9333ea' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-muted-foreground text-center">
        Shaded band (4–6) is a common moderate-arousal zone — yours may differ as data grows.
      </p>
    </div>
  );
}

interface PerformanceMindsetSectionProps {
  data: ArousalDataPoint[];
  confidenceData?: ConfidenceDataPoint[];
  isLoading?: boolean;
  confidenceLoading?: boolean;
}

export function PerformanceMindsetSection({
  data,
  confidenceData = [],
  isLoading,
  confidenceLoading,
}: PerformanceMindsetSectionProps) {
  if (isLoading || confidenceLoading) {
    return (
      <Card className="p-4 mb-6 animate-pulse h-64" />
    );
  }

  return (
    <Card className="p-4 mb-6 space-y-6">
      <div>
        <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-600" />
          Performance mindset
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Confidence and arousal trends — discover your individual zone of optimal functioning.
        </p>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Confidence over time
        </h3>
        <ConfidenceTrendChart data={confidenceData} />
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Arousal trend
        </h3>
        <ArousalTrendChart data={data} />
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Arousal vs performance
        </h3>
        <ArousalPerformanceScatter data={data} />
      </div>
    </Card>
  );
}
