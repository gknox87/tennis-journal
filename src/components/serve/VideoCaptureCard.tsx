import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Square, Play, Pause, FileVideo } from 'lucide-react';
import { VideoControls } from './VideoControls';

interface VideoCaptureCardProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isRecording: boolean;
  onToggleRecording: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  pose: any;
  racketBox: any;
  videoSource: 'camera' | 'file' | 'url';
}

export const VideoCaptureCard: React.FC<VideoCaptureCardProps> = ({
  videoRef,
  canvasRef,
  isRecording,
  onToggleRecording,
  onFileUpload,
  pose,
  racketBox,
  videoSource
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

  useEffect(() => {
    const drawOverlay = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Get the actual display dimensions of the video element
      const videoRect = video.getBoundingClientRect();
      const containerRect = video.parentElement?.getBoundingClientRect();
      
      // Set canvas size to match the video container
      canvas.width = video.offsetWidth;
      canvas.height = video.offsetHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Only draw overlays if video is playing and we have data
      if (video.paused && videoSource === 'file') return;
      
      // Calculate scale factors for proper alignment
      const scaleX = canvas.width / video.videoWidth;
      const scaleY = canvas.height / video.videoHeight;
      
      // Apply zoom and pan transformations
      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.translate(panX, panY);
      
      // Draw pose skeleton with proper scaling
      if (pose && pose.landmarks) {
        ctx.strokeStyle = '#22C55E';
        ctx.lineWidth = 3 / zoom; // Adjust line width for zoom
        ctx.fillStyle = '#22C55E';
        
        // Draw key pose points with proper scaling
        pose.landmarks.forEach((landmark: any, index: number) => {
          if (landmark.visibility && landmark.visibility > 0.5) {
            const x = landmark.x * canvas.width * scaleX;
            const y = landmark.y * canvas.height * scaleY;
            
            ctx.beginPath();
            ctx.arc(x, y, 4 / zoom, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
        
        // Draw skeleton connections with proper scaling
        const connections = [
          [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
          [11, 23], [12, 24], [23, 24], // Torso
          [23, 25], [25, 27], [24, 26], [26, 28], // Legs
          [0, 1], [1, 2], [2, 3], [3, 7], // Head
          [0, 4], [4, 5], [5, 6], [6, 8] // Head
        ];
        
        ctx.lineWidth = 2 / zoom;
        connections.forEach(([start, end]) => {
          if (pose.landmarks[start] && pose.landmarks[end]) {
            const startLandmark = pose.landmarks[start];
            const endLandmark = pose.landmarks[end];
            
            if ((!startLandmark.visibility || startLandmark.visibility > 0.5) &&
                (!endLandmark.visibility || endLandmark.visibility > 0.5)) {
              const startX = startLandmark.x * canvas.width * scaleX;
              const startY = startLandmark.y * canvas.height * scaleY;
              const endX = endLandmark.x * canvas.width * scaleX;
              const endY = endLandmark.y * canvas.height * scaleY;
              
              ctx.beginPath();
              ctx.moveTo(startX, startY);
              ctx.lineTo(endX, endY);
              ctx.stroke();
            }
          }
        });
      }
      
      // Draw racket bounding box with proper scaling
      if (racketBox && racketBox.confidence > 0.5) {
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3 / zoom;
        
        const x = racketBox.x * canvas.width * scaleX;
        const y = racketBox.y * canvas.height * scaleY;
        const width = racketBox.width * canvas.width * scaleX;
        const height = racketBox.height * canvas.height * scaleY;
        
        ctx.strokeRect(x, y, width, height);
        
        // Label with confidence
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.fillRect(x, y - 25 / zoom, 100 / zoom, 20 / zoom);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${12 / zoom}px Inter`;
        ctx.fillText(`Racket ${(racketBox.confidence * 100).toFixed(0)}%`, x + 2, y - 8 / zoom);
      }
      
      ctx.restore();
    };
    
    const animationFrame = requestAnimationFrame(function animate() {
      drawOverlay();
      requestAnimationFrame(animate);
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [pose, racketBox, canvasRef, videoRef, isPlaying, videoSource, zoom, panX, panY]);

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
      console.log('Video started playing');
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log('Video paused');
      setIsPlaying(false);
    };
    
    const handleEnded = () => {
      console.log('Video ended');
      setIsPlaying(false);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleLoadedData = () => {
      console.log('Video loaded successfully:', {
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState
      });
      setHasVideo(true);
      setDuration(video.duration);
      
      // Auto-play uploaded videos
      if (videoSource === 'file' && video.readyState >= 3) {
        video.play().then(() => {
          console.log('Auto-play started for uploaded video');
        }).catch(error => {
          console.log('Auto-play failed, user interaction required:', error);
        });
      }
    };
    
    const handleError = (e: Event) => {
      console.error('Video error:', e, video.error);
      setHasVideo(false);
    };

    const handleCanPlay = () => {
      console.log('Video can start playing');
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
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay={videoSource === 'camera'}
                muted
                playsInline
                controls={false}
                className="w-full h-full object-contain"
                style={{ 
                  backgroundColor: '#000000',
                  transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`
                }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 10 }}
              />
              
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
              
              {/* Video Status Overlay */}
              {!hasVideo && videoSource === 'file' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
                  <div className="text-center text-white">
                    <FileVideo className="w-12 h-12 mx-auto mb-2 opacity-60" />
                    <p className="text-sm">Upload a video to start analysis</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls Panel */}
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
                onTogglePlay={togglePlayPause}
                onSeek={handleSeek}
                onSpeedChange={handleSpeedChange}
                onZoomChange={handleZoomChange}
                onPanChange={handlePanChange}
                onReset={handleResetView}
                onStepBackward={stepBackward}
                onStepForward={stepForward}
              />
            )}
            
            {/* Status Cards */}
            {hasVideo && videoSource === 'file' && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">✓ Video loaded successfully</p>
                <p className="text-xs text-green-600">
                  {isPlaying ? 'Analysis running...' : 'Use controls to navigate video'}
                </p>
              </div>
            )}
            
            {analysisActive && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">✓ AI Analysis Active</p>
                <p className="text-xs text-blue-600">Pose and racket tracking enabled</p>
              </div>
            )}
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 font-medium mb-1">Tips for best analysis:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Use zoom to focus on serve action</li>
                <li>• Slow down playback for detailed review</li>
                <li>• Pan to center the player in frame</li>
                <li>• Step frame-by-frame at key moments</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
