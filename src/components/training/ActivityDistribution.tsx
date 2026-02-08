
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { ActivityDistributionData } from "@/types/trainingLoad";

interface ActivityDistributionProps {
  data: ActivityDistributionData[];
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#64748b"];

export const ActivityDistribution = ({ data }: ActivityDistributionProps) => {
  if (data.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Activity Distribution</h3>
        <p className="text-sm text-muted-foreground text-center py-8">No sessions logged yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Activity Distribution</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="count"
              nameKey="label"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              formatter={(value: number, name: string) => [value, name]}
            />
            <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
