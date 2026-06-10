import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
  ZAxis,
} from 'recharts';
import { Target } from 'lucide-react';
import {
  ArousalDataPoint,
  AROUSAL_MIN_ENTRIES,
  computeOptimalZoneInsight,
} from '@/utils/arousalTrendCalc';

interface ScatterPoint {
  arousal: number;
  performance: number;
  type: 'win' | 'loss' | 'training';
  date: string;
  label: string;
}

function buildScatterPoints(data: ArousalDataPoint[]): ScatterPoint[] {
  return data.map((p) => {
    if (p.source === 'match' && p.isWin !== undefined) {
      return {
        arousal: p.arousal,
        performance: p.isWin ? 1 : 0,
        type: p.isWin ? 'win' : 'loss',
        date: p.date,
        label: p.isWin ? 'Win' : 'Loss',
      };
    }
    return {
      arousal: p.arousal,
      performance: (p.sessionFeel ?? 3) / 5,
      type: 'training',
      date: p.date,
      label: `Session feel ${p.sessionFeel ?? '?'}/5`,
    };
  });
}

const COLORS = {
  win: '#22c55e',
  loss: '#ef4444',
  training: '#6366f1',
};

interface ArousalPerformanceScatterProps {
  data: ArousalDataPoint[];
}

export function ArousalPerformanceScatter({ data }: ArousalPerformanceScatterProps) {
  const insight = computeOptimalZoneInsight(data);
  const points = buildScatterPoints(data);
  const matchPoints = points.filter((p) => p.type !== 'training');
  const trainingPoints = points.filter((p) => p.type === 'training');

  if (data.length < AROUSAL_MIN_ENTRIES) {
    const remaining = AROUSAL_MIN_ENTRIES - data.length;
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center px-4">
        <Target className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm font-medium text-foreground">
          {data.length === 0 ? 'No arousal data yet' : `${data.length} logs recorded`}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Log {remaining} more to see how arousal relates to your results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insight && (
        <p className="text-xs text-purple-800 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
          {insight.message}
        </p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          {insight && (
            <ReferenceArea
              x1={insight.bucket.min}
              x2={insight.bucket.max}
              fill="#a855f7"
              fillOpacity={0.12}
              label={{ value: 'Your zone', position: 'insideTop', fontSize: 10, fill: '#7c3aed' }}
            />
          )}
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="arousal"
            name="Arousal"
            domain={[1, 10]}
            ticks={[1, 3, 5, 7, 10]}
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
            label={{ value: 'Arousal (1–10)', position: 'insideBottom', offset: -4, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="performance"
            name="Performance"
            domain={[0, 1]}
            ticks={[0, 0.5, 1]}
            tickFormatter={(v) => (v === 1 ? 'Win' : v === 0 ? 'Loss' : 'Mid')}
            tick={{ fontSize: 10 }}
            stroke="#9ca3af"
            width={36}
          />
          <ZAxis range={[40, 40]} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as ScatterPoint;
              return (
                <div className="bg-white border rounded-lg shadow-lg p-2 text-xs">
                  <p className="font-semibold capitalize">{row.type === 'training' ? 'Training' : 'Match'}</p>
                  <p>Arousal: {row.arousal}/10</p>
                  <p>{row.label}</p>
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {matchPoints.filter((p) => p.type === 'win').length > 0 && (
            <Scatter
              name="Wins"
              data={matchPoints.filter((p) => p.type === 'win')}
              fill={COLORS.win}
            />
          )}
          {matchPoints.filter((p) => p.type === 'loss').length > 0 && (
            <Scatter
              name="Losses"
              data={matchPoints.filter((p) => p.type === 'loss')}
              fill={COLORS.loss}
            />
          )}
          {trainingPoints.length > 0 && (
            <Scatter
              name="Training (feel)"
              data={trainingPoints}
              fill={COLORS.training}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground text-center">
        Match results cluster by arousal level. Training dots use session feel (scaled to 0–1).
      </p>
    </div>
  );
}
