
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Activity } from 'lucide-react';

interface PerformanceChartProps {
  metricsHistory: Array<{
    elbow: number;
    knee: number;
    xFactor: number;
    contactHeight: number;
    followThrough: number;
  }>;
  currentMetrics: {
    elbow: number;
    knee: number;
    xFactor: number;
    contactHeight: number;
    followThrough: number;
  };
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  metricsHistory,
  currentMetrics
}) => {
  // Prepare data for line chart (last 20 frames)
  const lineData = metricsHistory.slice(-20).map((metrics, index) => ({
    frame: index + 1,
    elbow: metrics.elbow,
    similarity: Math.max(0, 100 - Math.abs(metrics.elbow - 150) * 2)
  }));

  // Prepare data for radar chart (current vs ideal)
  const radarData = [
    {
      metric: 'Elbow',
      current: Math.min(100, (currentMetrics.elbow / 180) * 100),
      ideal: (150 / 180) * 100
    },
    {
      metric: 'Knee',
      current: Math.min(100, (currentMetrics.knee / 180) * 100),
      ideal: (140 / 180) * 100
    },
    {
      metric: 'X-Factor',
      current: Math.min(100, (currentMetrics.xFactor / 90) * 100),
      ideal: (45 / 90) * 100
    },
    {
      metric: 'Contact',
      current: Math.min(100, ((currentMetrics.contactHeight - 150) / 100) * 100),
      ideal: ((220 - 150) / 100) * 100
    },
    {
      metric: 'Follow-through',
      current: Math.min(100, (currentMetrics.followThrough / 25) * 100),
      ideal: (15 / 25) * 100
    }
  ];

  return (
    <div className="space-y-4">
      {/* Elbow Angle Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Elbow Angle Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="frame" />
                <YAxis domain={[100, 180]} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}°`, 
                    name === 'elbow' ? 'Elbow Angle' : 'Similarity'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="elbow" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="similarity" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Elbow Angle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Performance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Radar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current vs Ideal Technique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={6} />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Ideal"
                  dataKey="ideal"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`, 
                    name === 'current' ? 'Your Technique' : 'Pro Standard'
                  ]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Your Technique</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Pro Standard</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
