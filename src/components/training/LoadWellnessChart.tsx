
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
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadWellnessTimelinePoint } from "@/types/trainingLoad";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  if (!canAccessInsights) {
    return (
      <UpgradePrompt message="See how your mood tracks with training load — available on Pro." />
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
            Log daily check-ins to see how mood tracks with your training load.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/wellness")}>
            Go to Wellness
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-1">Mind & Body</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Training load and mood on the same timeline (14 days)
      </p>
      <div className="h-[240px]">
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
              yAxisId="mood"
              orientation="right"
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 10 }}
              label={{ value: "Mood", angle: 90, position: "insideRight", fontSize: 10 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as LoadWellnessTimelinePoint;
                return (
                  <div className="bg-white border rounded-lg shadow-lg p-3 text-xs space-y-1">
                    <p className="font-semibold">{d.dateLabel}</p>
                    <p>Load: <strong>{d.load}</strong></p>
                    <p>
                      Mood:{" "}
                      <strong>{d.mood !== null ? `${d.mood}/5` : "No check-in"}</strong>
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px" }}
              formatter={(value) => (value === "load" ? "Training load" : "Mood")}
            />
            <Bar
              yAxisId="load"
              dataKey="load"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="load"
            />
            <Line
              yAxisId="mood"
              type="monotone"
              dataKey="mood"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10b981" }}
              activeDot={{ r: 5 }}
              connectNulls={false}
              name="mood"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
