
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

interface WeeklyTrendChartProps {
  data: { week: string; load: number }[];
}

export const WeeklyTrendChart = ({ data }: WeeklyTrendChartProps) => {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Weekly Load Trend (8 weeks)</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              formatter={(value: number) => [value.toLocaleString(), "Weekly Load"]}
            />
            <Line
              type="monotone"
              dataKey="load"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 4, fill: "#8b5cf6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
