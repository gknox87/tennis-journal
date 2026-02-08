
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from "recharts";
import { Card } from "@/components/ui/card";
import { ACWRDataPoint } from "@/types/trainingLoad";

interface ACWRChartProps {
  data: ACWRDataPoint[];
}

export const ACWRChart = ({ data }: ACWRChartProps) => {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-1">Acute:Chronic Workload Ratio</h3>
      <p className="text-xs text-muted-foreground mb-3">Green zone (0.8–1.3) = optimal</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            {/* Shaded risk zones */}
            <ReferenceArea y1={0} y2={0.8} fill="#2196F3" fillOpacity={0.08} />
            <ReferenceArea y1={0.8} y2={1.3} fill="#4CAF50" fillOpacity={0.1} />
            <ReferenceArea y1={1.3} y2={1.5} fill="#FFC107" fillOpacity={0.1} />
            <ReferenceArea y1={1.5} y2={2.5} fill="#F44336" fillOpacity={0.08} />
            <ReferenceLine y={1} stroke="#999" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis domain={[0, "auto"]} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              formatter={(value: number, name: string) => [
                value.toFixed(2),
                name === "acwr" ? "ACWR" : name,
              ]}
            />
            <Line
              type="monotone"
              dataKey="acwr"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
