
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  zoom: number;
  panX: number;
  panY: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onZoomChange: (zoom: number) => void;
  onPanChange: (x: number, y: number) => void;
  onReset: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  zoom,
  panX,
  panY,
  onTogglePlay,
  onSeek,
  onSpeedChange,
  onZoomChange,
  onPanChange,
  onReset,
  onStepBackward,
  onStepForward
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-white/90 backdrop-blur">
      <CardContent className="p-4 space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onStepBackward}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={onTogglePlay}
            className="flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onStepForward}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <div className="text-xs text-gray-600 flex-shrink-0">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="space-y-2">
          <div className="text-xs font-medium">Timeline</div>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={([value]) => onSeek(value)}
            className="w-full"
          />
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="text-xs font-medium">Speed: {playbackSpeed}x</div>
          <div className="flex gap-1">
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
              <Button
                key={speed}
                size="sm"
                variant={playbackSpeed === speed ? "default" : "outline"}
                onClick={() => onSpeedChange(speed)}
                className="text-xs px-2 py-1 h-auto"
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="space-y-2">
          <div className="text-xs font-medium">Zoom: {Math.round(zoom * 100)}%</div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Slider
              value={[zoom]}
              min={0.5}
              max={3}
              step={0.1}
              onValueChange={([value]) => onZoomChange(value)}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Pan Controls */}
        <div className="space-y-2">
          <div className="text-xs font-medium">Pan Position</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-600 mb-1">Horizontal</div>
              <Slider
                value={[panX]}
                min={-100}
                max={100}
                step={1}
                onValueChange={([value]) => onPanChange(value, panY)}
              />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Vertical</div>
              <Slider
                value={[panY]}
                min={-100}
                max={100}
                step={1}
                onValueChange={([value]) => onPanChange(panX, value)}
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={onReset}
          className="w-full"
          size="sm"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset View
        </Button>
      </CardContent>
    </Card>
  );
};
