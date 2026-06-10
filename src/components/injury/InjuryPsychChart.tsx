
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { InjuryPsychChartPoint } from "@/utils/injuryPsychCalc";
import { format, parseISO } from "date-fns";
import { TrendingUp } from "lucide-react";

interface InjuryPsychChartProps {
  data: InjuryPsychChartPoint[];
  bodyPart: string;
}

export const InjuryPsychChart = ({ data, bodyPart }: InjuryPsychChartProps) => {
  if (data.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center px-4">
        <TrendingUp className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm font-medium text-foreground">
          {data.length === 0
            ? "No check-ins yet"
            : "1 check-in logged"}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Log at least 2 rehab check-ins for {bodyPart} to see trends.
        </p>
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), "MMM dd"),
  }));

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 11 }}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                pain: "Pain",
                rehabMood: "Rehab mood",
                rtpConfidence: "RTP confidence",
              };
              return [`${value}/10`, labels[name] ?? name];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                pain: "Pain",
                rehabMood: "Mood",
                rtpConfidence: "Confidence",
              };
              return labels[value] ?? value;
            }}
          />
          <Line
            type="monotone"
            dataKey="pain"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="rehabMood"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="rtpConfidence"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
