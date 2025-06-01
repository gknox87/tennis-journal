
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, Target, TrendingUp } from 'lucide-react';

interface CoachingInsightsProps {
  metrics: {
    elbow: number;
    knee: number;
    xFactor: number;
    contactHeight: number;
    followThrough: number;
  };
  servePhase: string;
  similarity: number;
}

export const CoachingInsights: React.FC<CoachingInsightsProps> = ({
  metrics,
  servePhase,
  similarity
}) => {
  const getElbowFeedback = () => {
    const { elbow } = metrics;
    if (elbow >= 140 && elbow <= 160) {
      return {
        status: 'good',
        icon: CheckCircle,
        color: 'text-green-600',
        title: 'Excellent Elbow Position',
        feedback: 'Your elbow angle is optimal for power generation and injury prevention.'
      };
    } else if (elbow < 140) {
      return {
        status: 'warning',
        icon: AlertTriangle,
        color: 'text-yellow-600',
        title: 'Elbow Too Bent',
        feedback: 'Try to extend your arm more during the trophy position. This will increase your reach and power.'
      };
    } else {
      return {
        status: 'danger',
        icon: XCircle,
        color: 'text-red-600',
        title: 'Elbow Over-Extended',
        feedback: 'Your elbow is too straight. Maintain a slight bend for better racket head speed and control.'
      };
    }
  };

  const getKneeFeedback = () => {
    const { knee } = metrics;
    if (knee >= 130 && knee <= 150) {
      return {
        status: 'good',
        icon: CheckCircle,
        color: 'text-green-600',
        title: 'Good Knee Bend',
        feedback: 'Your knee bend is helping generate upward momentum and power.'
      };
    } else if (knee > 150) {
      return {
        status: 'warning',
        icon: AlertTriangle,
        color: 'text-yellow-600',
        title: 'Insufficient Knee Bend',
        feedback: 'Bend your knees more to load energy and drive upward through the serve.'
      };
    } else {
      return {
        status: 'danger',
        icon: XCircle,
        color: 'text-red-600',
        title: 'Excessive Knee Bend',
        feedback: 'You\'re bending too much. This can reduce power and make timing difficult.'
      };
    }
  };

  const getXFactorFeedback = () => {
    const { xFactor } = metrics;
    if (xFactor >= 35 && xFactor <= 55) {
      return {
        status: 'good',
        icon: CheckCircle,
        color: 'text-green-600',
        title: 'Excellent X-Factor',
        feedback: 'Great shoulder-hip separation! This creates the kinetic chain for powerful serves.'
      };
    } else if (xFactor < 35) {
      return {
        status: 'warning',
        icon: AlertTriangle,
        color: 'text-yellow-600',
        title: 'Limited Rotation',
        feedback: 'Try to rotate your shoulders more while keeping hips stable for better power transfer.'
      };
    } else {
      return {
        status: 'danger',
        icon: XCircle,
        color: 'text-red-600',
        title: 'Over-Rotation',
        feedback: 'Excessive rotation can hurt timing. Focus on controlled shoulder turn.'
      };
    }
  };

  const getContactHeightFeedback = () => {
    const { contactHeight } = metrics;
    if (contactHeight >= 210 && contactHeight <= 240) {
      return {
        status: 'good',
        icon: CheckCircle,
        color: 'text-green-600',
        title: 'Optimal Contact Height',
        feedback: 'Perfect contact point for maximum power and angle into the service box.'
      };
    } else if (contactHeight < 210) {
      return {
        status: 'warning',
        icon: AlertTriangle,
        color: 'text-yellow-600',
        title: 'Low Contact Point',
        feedback: 'Try to hit the ball higher by fully extending and using leg drive.'
      };
    } else {
      return {
        status: 'danger',
        icon: XCircle,
        color: 'text-red-600',
        title: 'Contact Too High',
        feedback: 'Make sure you\'re not over-reaching. Natural extension is key.'
      };
    }
  };

  const getPhaseFeedback = () => {
    switch (servePhase) {
      case 'preparation':
        return 'Good setup position. Focus on relaxed shoulders and proper stance.';
      case 'loading':
        return 'Loading phase active. Ensure weight is on back foot and racket is in trophy position.';
      case 'acceleration':
        return 'Acceleration phase! Drive up with legs and rotate shoulders for maximum power.';
      case 'contact':
        return 'Contact moment! Full extension and snap the wrist for spin and power.';
      case 'follow-through':
        return 'Follow through completely. Let the racket wrap around your body naturally.';
      default:
        return 'Keep practicing your serve motion for better consistency.';
    }
  };

  const insights = [
    getElbowFeedback(),
    getKneeFeedback(),
    getXFactorFeedback(),
    getContactHeightFeedback()
  ];

  return (
    <div className="space-y-4">
      {/* Overall Performance */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Overall Performance
            </CardTitle>
            <Badge variant={similarity >= 80 ? 'default' : similarity >= 60 ? 'secondary' : 'destructive'}>
              {similarity}% Pro-Level
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={similarity} className="h-3 mb-2" />
          <p className="text-sm text-gray-600">
            {similarity >= 80 
              ? 'Excellent technique! You\'re serving at a professional level.' 
              : similarity >= 60 
              ? 'Good serve! Focus on the areas below for improvement.'
              : 'Keep practicing! Small adjustments will make a big difference.'}
          </p>
        </CardContent>
      </Card>

      {/* Current Phase Feedback */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Current Phase: {servePhase.charAt(0).toUpperCase() + servePhase.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{getPhaseFeedback()}</p>
        </CardContent>
      </Card>

      {/* Detailed Insights */}
      <div className="grid gap-3">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <Card key={index} className={`border-l-4 ${
              insight.status === 'good' ? 'border-green-500' :
              insight.status === 'warning' ? 'border-yellow-500' : 'border-red-500'
            }`}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <IconComponent className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.feedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
