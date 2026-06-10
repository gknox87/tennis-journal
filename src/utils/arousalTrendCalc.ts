import { Match } from '@/types/match';
import { TrainingNote } from '@/types/training';
import { getEmotionTagLabel } from '@/constants/emotionTags';

export interface ArousalDataPoint {
  date: string;
  arousal: number;
  source: 'match' | 'training';
  isWin?: boolean;
  sessionFeel?: number | null;
  emotionTags?: string[];
}

export interface ArousalBucketStats {
  bucket: 'low' | 'moderate' | 'high';
  label: string;
  min: number;
  max: number;
  count: number;
  winRate: number | null;
  avgSessionFeel: number | null;
}

export interface OptimalZoneInsight {
  message: string;
  bucket: ArousalBucketStats;
  topEmotions: string[];
}

export const AROUSAL_MIN_ENTRIES = 8;

function getArousalBucket(arousal: number): ArousalBucketStats['bucket'] {
  if (arousal <= 3) return 'low';
  if (arousal <= 6) return 'moderate';
  return 'high';
}

const BUCKET_LABELS: Record<ArousalBucketStats['bucket'], { label: string; min: number; max: number }> = {
  low: { label: 'Low (1–3)', min: 1, max: 3 },
  moderate: { label: 'Moderate (4–6)', min: 4, max: 6 },
  high: { label: 'High (7–10)', min: 7, max: 10 },
};

export function buildArousalDataPoints(
  matches: Match[],
  trainingNotes: TrainingNote[]
): ArousalDataPoint[] {
  const points: ArousalDataPoint[] = [];

  for (const match of matches) {
    const arousal = match.pre_arousal ?? match.pre_nerves;
    if (arousal == null) continue;
    points.push({
      date: match.date,
      arousal,
      source: 'match',
      isWin: match.is_win,
      emotionTags: [
        ...(match.pre_emotion_tags ?? []),
        ...(match.post_emotion_tags ?? []),
      ],
    });
  }

  for (const note of trainingNotes) {
    if (note.session_arousal == null) continue;
    points.push({
      date: note.training_date,
      arousal: note.session_arousal,
      source: 'training',
      sessionFeel: note.session_feel,
      emotionTags: note.emotion_tags ?? [],
    });
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
}

export function computeArousalBucketStats(points: ArousalDataPoint[]): ArousalBucketStats[] {
  const buckets: ArousalBucketStats['bucket'][] = ['low', 'moderate', 'high'];

  return buckets.map((bucket) => {
    const inBucket = points.filter((p) => getArousalBucket(p.arousal) === bucket);
    const matchPoints = inBucket.filter((p) => p.source === 'match' && p.isWin !== undefined);
    const trainingPoints = inBucket.filter((p) => p.source === 'training' && p.sessionFeel != null);

    const wins = matchPoints.filter((p) => p.isWin).length;
    const winRate = matchPoints.length > 0 ? Math.round((wins / matchPoints.length) * 100) : null;

    const avgSessionFeel =
      trainingPoints.length > 0
        ? Math.round(
            (trainingPoints.reduce((sum, p) => sum + (p.sessionFeel ?? 0), 0) / trainingPoints.length) * 10
          ) / 10
        : null;

    const meta = BUCKET_LABELS[bucket];
    return {
      bucket,
      label: meta.label,
      min: meta.min,
      max: meta.max,
      count: inBucket.length,
      winRate,
      avgSessionFeel,
    };
  });
}

export function computeOptimalZoneInsight(points: ArousalDataPoint[]): OptimalZoneInsight | null {
  if (points.length < AROUSAL_MIN_ENTRIES) return null;

  const bucketStats = computeArousalBucketStats(points);
  const matchBuckets = bucketStats.filter((b) => b.count > 0 && b.winRate !== null);

  let bestBucket: ArousalBucketStats | null = null;
  if (matchBuckets.length > 0) {
    bestBucket = matchBuckets.reduce((best, current) =>
      (current.winRate ?? 0) > (best.winRate ?? 0) ? current : best
    );
  } else {
    const trainingBuckets = bucketStats.filter((b) => b.count > 0 && b.avgSessionFeel !== null);
    if (trainingBuckets.length === 0) return null;
    bestBucket = trainingBuckets.reduce((best, current) =>
      (current.avgSessionFeel ?? 0) > (best.avgSessionFeel ?? 0) ? current : best
    );
  }

  if (!bestBucket || bestBucket.count === 0) return null;

  const bucketPoints = points.filter((p) => getArousalBucket(p.arousal) === bestBucket!.bucket);
  const emotionCounts = new Map<string, number>();
  for (const point of bucketPoints) {
    for (const tag of point.emotionTags ?? []) {
      emotionCounts.set(tag, (emotionCounts.get(tag) ?? 0) + 1);
    }
  }
  const topEmotions = [...emotionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([id]) => getEmotionTagLabel(id));

  const performanceLabel =
    bestBucket.winRate !== null
      ? `${bestBucket.winRate}% win rate`
      : bestBucket.avgSessionFeel !== null
        ? `avg session feel ${bestBucket.avgSessionFeel}/5`
        : 'best performance';

  const emotionSuffix =
    topEmotions.length > 0 ? ` when feeling ${topEmotions.join(' or ')}` : '';

  return {
    bucket: bestBucket,
    topEmotions,
    message: `Your optimal zone looks like arousal ${bestBucket.min}–${bestBucket.max} (${performanceLabel}${emotionSuffix}).`,
  };
}

export function formatArousalTrendChartData(points: ArousalDataPoint[]) {
  return points.map((p) => ({
    date: p.date,
    arousal: p.arousal,
    source: p.source,
    isWin: p.isWin,
  }));
}
