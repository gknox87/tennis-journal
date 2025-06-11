import React from 'react';
import { AlertCircle, CheckCircle, Circle, Target, Zap, Loader2 } from 'lucide-react';

interface VideoStatusIndicatorsProps {
  ballDetection?: {
    x: number;
    y: number;
    confidence: number;
    timestamp: number;
    previousPositions?: { x: number; y: number; timestamp: number }[];
  } | null;
  ballUsingYolo?: boolean;
  ballYoloError?: string | null;
  pose?: any;
  racketBox?: any;
}

export const VideoStatusIndicators: React.FC<VideoStatusIndicatorsProps> = ({
  ballDetection,
  ballUsingYolo,
  ballYoloError,
  pose,
  racketBox
}) => {
  const getBallDetectionStatus = () => {
    if (!ballDetection) {
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        message: 'No ball detected',
        details: 'Make sure the tennis ball is visible and well-lit'
      };
    }

    const confidence = ballDetection.confidence;
    if (confidence > 0.7) {
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        message: `Excellent tracking (${Math.round(confidence * 100)}%)`,
        details: `Position: ${(ballDetection.x * 100).toFixed(1)}%, ${(ballDetection.y * 100).toFixed(1)}%`
      };
    } else if (confidence > 0.4) {
      return {
        icon: Target,
        color: 'text-yellow-500',
        message: `Good tracking (${Math.round(confidence * 100)}%)`,
        details: 'Consider improving lighting for better accuracy'
      };
    } else {
      return {
        icon: Circle,
        color: 'text-orange-500',
        message: `Weak tracking (${Math.round(confidence * 100)}%)`,
        details: 'Ball detection is unstable - check visibility'
      };
    }
  };

  const getBallDetectionMethod = () => {
    if (ballYoloError) {
      return {
        method: 'Color-based fallback',
        icon: Zap,
        color: 'text-blue-500',
        note: 'AI model failed, using color detection'
      };
    } else if (ballUsingYolo) {
      return {
        method: 'AI Detection (YOLO)',
        icon: CheckCircle,
        color: 'text-green-500',
        note: 'Using advanced neural network'
      };
    } else {
      return {
        method: 'Color Detection',
        icon: Target,
        color: 'text-blue-500',
        note: 'Analyzing yellow-green patterns'
      };
    }
  };

  const ballStatus = getBallDetectionStatus();
  const detectionMethod = getBallDetectionMethod();
  const StatusIcon = ballStatus.icon;
  const MethodIcon = detectionMethod.icon;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Detection Status</h3>
        <div className="flex items-center gap-2">
          {ballDetection && ballDetection.previousPositions && ballDetection.previousPositions.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Tracking motion</span>
            </div>
          )}
        </div>
      </div>

      {/* Ball Detection Status */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${ballStatus.color}`} />
          <span className="font-medium text-gray-700">Ball Detection</span>
        </div>
        <div className="ml-7">
          <p className="text-sm text-gray-600">{ballStatus.message}</p>
          <p className="text-xs text-gray-500">{ballStatus.details}</p>
        </div>
      </div>

      {/* Detection Method */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MethodIcon className={`w-5 h-5 ${detectionMethod.color}`} />
          <span className="font-medium text-gray-700">Method</span>
        </div>
        <div className="ml-7">
          <p className="text-sm text-gray-600">{detectionMethod.method}</p>
          <p className="text-xs text-gray-500">{detectionMethod.note}</p>
        </div>
      </div>

      {/* Motion Trail Info */}
      {ballDetection && ballDetection.previousPositions && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span className="font-medium text-gray-700">Motion Trail</span>
          </div>
          <div className="ml-7">
            <p className="text-sm text-gray-600">
              {ballDetection.previousPositions.length} tracking points
            </p>
            <p className="text-xs text-gray-500">
              {ballDetection.previousPositions.length > 5 ? 'Smooth tracking' : 'Building trail...'}
            </p>
          </div>
        </div>
      )}

      {/* Troubleshooting Tips */}
      {!ballDetection && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting Tips:</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Ensure good lighting conditions</li>
            <li>• Use a bright yellow-green tennis ball</li>
            <li>• Avoid cluttered backgrounds</li>
            <li>• Position camera 3-4 meters away</li>
            <li>• Check if ball is fully visible in frame</li>
          </ul>
        </div>
      )}
    </div>
  );
};
