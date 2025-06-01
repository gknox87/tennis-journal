
import React from 'react';

interface VideoStatusIndicatorsProps {
  analysisActive: boolean;
  isRecording: boolean;
}

export const VideoStatusIndicators: React.FC<VideoStatusIndicatorsProps> = ({
  analysisActive,
  isRecording
}) => {
  return (
    <>
      {/* Analysis Status Indicator */}
      {analysisActive && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full z-20">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">AI Active</span>
        </div>
      )}
      
      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full z-20">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">Recording</span>
        </div>
      )}
    </>
  );
};
