import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/types/match";
import { useSport } from "@/context/SportContext";
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, Activity, Target, Calendar, Zap } from "lucide-react";
import { useMemo } from "react";

// Form Curve Chart Component
interface FormCurveProps {
  matches: Match[];
}

interface FormDataPoint {
  index: number;
  rollingWinRate: number;
  date: string;
  opponent: string;
  result: string;
  surface: string;
}

export const FormCurveChart = ({ matches }: FormCurveProps) => {
  const { sport } = useSport();
  
  const formData = useMemo(() => {
    const sportMatches = sport?.id
      ? matches.filter((m) => m.sport_id === sport.id)
      : matches;
    
    const sorted = [...sportMatches]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-20);
    
    return sorted.map((match, idx) => {
      const window = sorted.slice(Math.max(0, idx - 4), idx + 1);
      const wins = window.filter((m) => m.is_win).length;
      return {
        index: idx + 1,
        rollingWinRate: Math.round((wins / window.length) * 100),
        date: match.date,
        opponent: match.opponent_name,
        result: match.is_win ? "W" : "L",
        surface: match.court_type || "Unknown",
      };
    });
  }, [matches, sport?.id]);

  const chartConfig = {
    winRate: { color: "#22c55e", label: "Win %" },
  };

  const getLineColor = (value: number, prevValue: number | undefined) => {
    if (prevValue === undefined) return "#22c55e";
    return value >= prevValue ? "#22c55e" : "#ef4444";
  };

  if (formData.length < 2) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" /> Form Curve
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Need at least 2 matches to show form curve
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" /> Form Curve
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <LineChart data={formData}>
            <XAxis dataKey="index" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="rollingWinRate"
              stroke="#22c55e"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const prev = formData[payload.index - 2]?.rollingWinRate;
                const color = getLineColor(payload.rollingWinRate, prev);
                return <circle cx={cx} cy={cy} r={4} fill={color} stroke={color} />;
              }}
            />
          </LineChart>
        </ChartContainer>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" /> Improving
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500" /> Declining
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// Surface Heatmap Component
interface SurfaceHeatmapProps {
  matches: Match[];
}

interface SurfaceData {
  surface: string;
  wins: number;
  losses: number;
  total: number;
  winRate: number;
}

const SURFACE_COLORS = [
  "#22c55e",
  "#84cc16",
  "#eab308",
  "#f97316",
  "#ef4444",
];

export const SurfaceHeatmap = ({ matches }: SurfaceHeatmapProps) => {
  const { sport } = useSport();
  
  const surfaceData = useMemo(() => {
    const sportMatches = sport?.id
      ? matches.filter((m) => m.sport_id === sport.id)
      : matches;
    
    const surfaceMap = new Map<string, { wins: number; losses: number }>();
    
    sportMatches.forEach((match) => {
      const surface = match.court_type || "Unknown";
      const current = surfaceMap.get(surface) || { wins: 0, losses: 0 };
      if (match.is_win) {
        current.wins++;
      } else {
        current.losses++;
      }
      surfaceMap.set(surface, current);
    });
    
    return Array.from(surfaceMap.entries()).map(([surface, stats]) => ({
      surface,
      wins: stats.wins,
      losses: stats.losses,
      total: stats.wins + stats.losses,
      winRate: stats.wins + stats.losses > 0 
        ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) 
        : 0,
    }));
  }, [matches, sport?.id]);

  const getColor = (winRate: number) => {
    if (winRate >= 80) return SURFACE_COLORS[0];
    if (winRate >= 60) return SURFACE_COLORS[1];
    if (winRate >= 40) return SURFACE_COLORS[2];
    if (winRate >= 20) return SURFACE_COLORS[3];
    return SURFACE_COLORS[4];
  };

  if (surfaceData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" /> Surface Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          No match data to display
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4" /> Surface Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {surfaceData.map((data) => (
            <div
              key={data.surface}
              className="relative p-4 rounded-lg border text-center"
              style={{ backgroundColor: `${getColor(data.winRate)}20`, borderColor: getColor(data.winRate) }}
            >
              <div className="text-2xl font-bold" style={{ color: getColor(data.winRate) }}>
                {data.winRate}%
              </div>
              <div className="text-xs font-medium mt-1">{data.surface}</div>
              <Badge 
                variant="secondary" 
                className="mt-1 text-xs"
              >
                {data.wins}W-{data.losses}L
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Low</span>
          <div className="h-2 w-20 rounded" style={{ background: `linear-gradient(to right, ${SURFACE_COLORS.join(', ')})` }} />
          <span>High</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Opponent Radar Chart
interface OpponentRadarProps {
  matches: Match[];
}

interface RadarDataPoint {
  category: string;
  value: number;
  fill: string;
}

const CATEGORY_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

export const OpponentRadarChart = ({ matches }: OpponentRadarProps) => {
  const { sport } = useSport();
  
  const radarData = useMemo(() => {
    const sportMatches = sport?.id
      ? matches.filter((m) => m.sport_id === sport.id)
      : matches;
    
    // Categorize opponents by performance levels
    const categories = [
      { label: "Higher Ranked", matches: 0, wins: 0 },
      { label: "Equal Level", matches: 0, wins: 0 },
      { label: "Lower Ranked", matches: 0, wins: 0 },
    ];
    
    sportMatches.forEach((match) => {
      // Simple categorization based on name patterns (placeholder logic - real app would use opponent_rank)
      const opponent = match.opponent_name?.toLowerCase() || "";
      const idx = opponent.length % 3;
      categories[idx].matches++;
      if (match.is_win) categories[idx].wins++;
    });
    
    return categories.map((cat, idx) => ({
      category: cat.label,
      value: cat.matches > 0 ? Math.round((cat.wins / cat.matches) * 100) : 0,
      fill: CATEGORY_COLORS[idx],
    }));
  }, [matches, sport?.id]);

  const chartConfig = radarData.reduce((acc, item, idx) => {
    acc[item.category] = { color: item.fill, label: item.category };
    return acc;
  }, {} as Record<string, { color: string; label: string }>);

  if (radarData.every(d => d.value === 0)) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" /> Opponent Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          No opponent data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4" /> Opponent Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar
              name="Performance"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
            <Tooltip content={<ChartTooltipContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

// Monthly Volume Bar Chart
interface MonthlyVolumeChartProps {
  matches: Match[];
}

interface MonthlyData {
  month: string;
  count: number;
}

export const MonthlyVolumeChart = ({ matches }: MonthlyVolumeChartProps) => {
  const { sport } = useSport();
  
  const monthlyData = useMemo(() => {
    const sportMatches = sport?.id
      ? matches.filter((m) => m.sport_id === sport.id)
      : matches;
    
    const monthMap = new Map<string, number>();
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, 0);
    }
    
    sportMatches.forEach((match) => {
      const d = new Date(match.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) || 0) + 1);
      }
    });
    
    return Array.from(monthMap.entries()).map(([key, count]) => {
      const [year, month] = key.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return {
        month: date.toLocaleDateString("en-US", { month: "short" }),
        count,
      };
    });
  }, [matches, sport?.id]);

  const chartConfig = {
    count: { color: "#3b82f6", label: "Matches" },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Monthly Volume
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <BarChart data={monthlyData}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

// AI Weekly Digest Card
interface WeeklyDigestProps {
  summaryText?: string;
  keyImprovement?: string;
  concern?: string;
  nextFocus?: string;
}

export const WeeklyDigestCard = ({ summaryText, keyImprovement, concern, nextFocus }: WeeklyDigestProps) => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> AI Weekly Digest
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {summaryText ? (
          <>
            <p className="text-sm text-muted-foreground">{summaryText}</p>
            {keyImprovement && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-green-600">Key Improvement: </span>
                  <span className="text-sm text-green-700">{keyImprovement}</span>
                </div>
              </div>
            )}
            {concern && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <TrendingDown className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-amber-600">Watch: </span>
                  <span className="text-sm text-amber-700">{concern}</span>
                </div>
              </div>
            )}
            {nextFocus && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-blue-600">Next Focus: </span>
                  <span className="text-sm text-blue-700">{nextFocus}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Log more matches to receive your AI-powered weekly performance digest.
          </p>
        )}
      </CardContent>
    </Card>
  );
};