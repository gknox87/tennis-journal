
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { DailyLoadData } from "@/types/trainingLoad";

interface DailyLoadChartProps {
  data: DailyLoadData[];
}

export const DailyLoadChart = ({ data }: DailyLoadChartProps) => {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Daily Training Load (14 days)</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              formatter={(value: number) => [value, "Load"]}
            />
            <Bar dataKey="load" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
