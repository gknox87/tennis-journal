
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, RotateCcw, ArrowUp } from 'lucide-react';

interface DrillRecommendationsProps {
  metrics: {
    elbow: number;
    knee: number;
    xFactor: number;
    contactHeight: number;
    followThrough: number;
  };
}

export const DrillRecommendations: React.FC<DrillRecommendationsProps> = ({ metrics }) => {
  const getDrills = () => {
    const drills = [];
    
    // Elbow position drills
    if (metrics.elbow < 140 || metrics.elbow > 160) {
      drills.push({
        icon: Target,
        title: 'Trophy Position Hold',
        description: 'Practice holding the trophy position for 3 seconds. Focus on 90-degree elbow angle.',
        difficulty: 'Beginner',
        duration: '5 minutes',
        priority: 'high'
      });
    }

    // Knee bend drills
    if (metrics.knee > 150 || metrics.knee < 130) {
      drills.push({
        icon: ArrowUp,
        title: 'Leg Drive Practice',
        description: 'Practice explosive leg extension from a deep squat position. Focus on timing.',
        difficulty: 'Intermediate',
        duration: '10 minutes',
        priority: metrics.knee > 160 ? 'high' : 'medium'
      });
    }

    // X-factor drills
    if (metrics.xFactor < 35 || metrics.xFactor > 55) {
      drills.push({
        icon: RotateCcw,
        title: 'Shoulder-Hip Separation',
        description: 'Practice turning shoulders while keeping hips stable. Use resistance band.',
        difficulty: 'Advanced',
        duration: '8 minutes',
        priority: 'high'
      });
    }

    // Contact height drills
    if (metrics.contactHeight < 210 || metrics.contactHeight > 240) {
      drills.push({
        icon: Zap,
        title: 'High Contact Point',
        description: 'Practice hitting balls suspended above your head. Focus on full extension.',
        difficulty: 'Intermediate',
        duration: '15 minutes',
        priority: 'medium'
      });
    }

    // General improvement drills
    drills.push({
      icon: Target,
      title: 'Serve Consistency',
      description: 'Serve 20 balls focusing on repeating the same motion every time.',
      difficulty: 'All Levels',
      duration: '20 minutes',
      priority: 'low'
    });

    return drills.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const drills = getDrills();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-600" />
          Recommended Drills
        </CardTitle>
        <p className="text-sm text-gray-600">
          Based on your current technique analysis
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {drills.map((drill, index) => {
            const IconComponent = drill.icon;
            return (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">{drill.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{drill.description}</p>
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(drill.priority)}>
                    {drill.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(drill.difficulty)}`}>
                    {drill.difficulty}
                  </span>
                  <span className="text-gray-500">⏱️ {drill.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
