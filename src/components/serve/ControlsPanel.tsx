
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Square } from 'lucide-react';
import { VideoControls } from './VideoControls';

interface ControlsPanelProps {
  videoSource: 'camera' | 'file' | 'url';
  isRecording: boolean;
  hasVideo: boolean;
  analysisActive: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  zoom: number;
  panX: number;
  panY: number;
  onToggleRecording: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onZoomChange: (zoom: number) => void;
  onPanChange: (x: number, y: number) => void;
  onReset: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  videoSource,
  isRecording,
  hasVideo,
  analysisActive,
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  zoom,
  panX,
  panY,
  onToggleRecording,
  onFileUpload,
  onTogglePlay,
  onSeek,
  onSpeedChange,
  onZoomChange,
  onPanChange,
  onReset,
  onStepBackward,
  onStepForward
}) => {
  return (
    <div className="lg:w-80 space-y-4">
      {/* Basic Controls */}
      {videoSource === 'camera' && (
        <Button
          onClick={onToggleRecording}
          className={`w-full h-12 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isRecording ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Start Recording
            </>
          )}
        </Button>
      )}
      
      <div className="relative">
        <input
          type="file"
          accept="video/mp4,video/mov,video/webm,video/avi,video/quicktime"
          onChange={onFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="video-upload"
        />
        <Button variant="secondary" className="w-full h-12" asChild>
          <label htmlFor="video-upload" className="cursor-pointer flex items-center justify-center">
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </label>
        </Button>
      </div>
      
      {/* Video Controls */}
      {hasVideo && videoSource !== 'camera' && (
        <VideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          playbackSpeed={playbackSpeed}
          zoom={zoom}
          panX={panX}
          panY={panY}
          onTogglePlay={onTogglePlay}
          onSeek={onSeek}
          onSpeedChange={onSpeedChange}
          onZoomChange={onZoomChange}
          onPanChange={onPanChange}
          onReset={onReset}
          onStepBackward={onStepBackward}
          onStepForward={onStepForward}
        />
      )}
      
      {/* Status Cards */}
      {hasVideo && videoSource === 'file' && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 font-medium">✓ Video loaded successfully</p>
          <p className="text-xs text-green-600">
            {isPlaying ? 'Real-time pixel analysis active...' : 'Use controls to navigate video'}
          </p>
        </div>
      )}
      
      {analysisActive && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">✓ Real Tennis AI Active</p>
          <p className="text-xs text-blue-600">Pixel-perfect tracking and alignment</p>
        </div>
      )}
      
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700 font-medium mb-1">Real-Time Analysis:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Pixel-perfect pose alignment</li>
          <li>• Accurate racket detection</li>
          <li>• Precise ball tracking</li>
          <li>• Real biomechanical analysis</li>
          <li>• 30 FPS live processing</li>
        </ul>
      </div>
    </div>
  );
};
