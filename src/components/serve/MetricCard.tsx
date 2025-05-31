
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, RotateCcw, Move, ArrowUp, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  target: number;
  tolerance: number;
  icon: string;
}

const iconMap = {
  elbow: Activity,
  knee: Activity,
  rotation: RotateCcw,
  height: ArrowUp,
  followthrough: TrendingUp
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  target,
  tolerance,
  icon
}) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Activity;
  
  const getStatus = () => {
    const diff = Math.abs(value - target);
    if (diff <= tolerance) return 'good';
    if (diff <= tolerance * 1.5) return 'warning';
    return 'danger';
  };

  const status = getStatus();
  const statusColors = {
    good: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  return (
    <Card className="bg-gradient-to-b from-white/60 via-white/40 to-white/10 backdrop-blur border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <IconComponent className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
          <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        </div>
        <div className="text-xs font-medium text-gray-600 mb-1">{title}</div>
        <div className="text-2xl font-bold text-gray-900">
          {value.toFixed(0)}
          <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
};
