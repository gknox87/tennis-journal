
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { VideoDisplay } from './VideoDisplay';
import { VideoStatusIndicators } from './VideoStatusIndicators';
import { ControlsPanel } from './ControlsPanel';

interface VideoCaptureCardProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isRecording: boolean;
  onToggleRecording: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  pose: any;
  racketBox: any;
  videoSource: 'camera' | 'file' | 'url';
  playerBounds?: any;
  ballDetection?: any;
}

export const VideoCaptureCard: React.FC<VideoCaptureCardProps> = ({
  videoRef,
  canvasRef,
  isRecording,
  onToggleRecording,
  onFileUpload,
  pose,
  racketBox,
  videoSource,
  playerBounds,
  ballDetection
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [analysisActive, setAnalysisActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  useEffect(() => {
    setAnalysisActive(!!pose);
  }, [pose]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const handlePanChange = (x: number, y: number) => {
    setPanX(x);
    setPanY(y);
  };

  const handleResetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const stepBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 0.1);
    }
  };

  const stepForward = () => {
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 0.1);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleLoadedData = () => {
      setHasVideo(true);
      setDuration(video.duration);
      
      if (videoSource === 'file' && video.readyState >= 3) {
        video.play().catch(console.error);
      }
    };
    
    const handleError = () => {
      setHasVideo(false);
    };

    const handleCanPlay = () => {
      setHasVideo(true);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [videoSource]);

  return (
    <Card className="rounded-2xl shadow-lg mb-6 bg-gradient-to-b from-white/60 via-white/40 to-white/10 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Container */}
          <div className="flex-1 relative">
            <VideoDisplay
              videoRef={videoRef}
              canvasRef={canvasRef}
              hasVideo={hasVideo}
              videoSource={videoSource}
              pose={pose}
              racketBox={racketBox}
              playerBounds={playerBounds}
              ballDetection={ballDetection}
              zoom={zoom}
              panX={panX}
              panY={panY}
            />
            
            <VideoStatusIndicators
              analysisActive={analysisActive}
              isRecording={isRecording}
            />
          </div>
          
          {/* Controls Panel */}
          <ControlsPanel
            videoSource={videoSource}
            isRecording={isRecording}
            hasVideo={hasVideo}
            analysisActive={analysisActive}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            playbackSpeed={playbackSpeed}
            zoom={zoom}
            panX={panX}
            panY={panY}
            onToggleRecording={onToggleRecording}
            onFileUpload={onFileUpload}
            onTogglePlay={togglePlayPause}
            onSeek={handleSeek}
            onSpeedChange={handleSpeedChange}
            onZoomChange={handleZoomChange}
            onPanChange={handlePanChange}
            onReset={handleResetView}
            onStepBackward={stepBackward}
            onStepForward={stepForward}
          />
        </div>
      </CardContent>
    </Card>
  );
};
