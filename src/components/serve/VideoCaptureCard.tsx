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

  useEffect(() => {
    const drawOverlay = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video || !video.videoWidth || !video.videoHeight) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size to match video element exactly
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      // Calculate video content area within the element
      const videoAspectRatio = video.videoWidth / video.videoHeight;
      const displayAspectRatio = rect.width / rect.height;
      
      let scaleX, scaleY, offsetX, offsetY;
      
      if (videoAspectRatio > displayAspectRatio) {
        // Video is wider - fit to width
        scaleX = rect.width / video.videoWidth;
        scaleY = scaleX;
        offsetX = 0;
        offsetY = (rect.height - video.videoHeight * scaleY) / 2;
      } else {
        // Video is taller - fit to height
        scaleY = rect.height / video.videoHeight;
        scaleX = scaleY;
        offsetX = (rect.width - video.videoWidth * scaleX) / 2;
        offsetY = 0;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply transformations
      ctx.save();
      ctx.translate(offsetX + panX, offsetY + panY);
      ctx.scale(scaleX * zoom, scaleY * zoom);

      // Draw pose skeleton with improved visibility
      if (pose && pose.landmarks && pose.landmarks.length >= 33) {
        const landmarks = pose.landmarks;
        
        // Define key pose connections for tennis serve analysis
        const connections = [
          // Arms
          [11, 13], [13, 15], [12, 14], [14, 16], // shoulder to elbow to wrist
          [11, 12], // shoulders
          // Torso
          [11, 23], [12, 24], [23, 24], // shoulder to hip connections
          // Legs
          [23, 25], [25, 27], [24, 26], [26, 28], // hip to knee to ankle
          [27, 29], [28, 30], [29, 31], [30, 32] // ankle to foot
        ];
        
        // Draw skeleton lines first
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        
        connections.forEach(([startIdx, endIdx]) => {
          const start = landmarks[startIdx];
          const end = landmarks[endIdx];
          
          if (start && end && 
              (!start.visibility || start.visibility > 0.3) && 
              (!end.visibility || end.visibility > 0.3)) {
            ctx.beginPath();
            ctx.moveTo(start.x * video.videoWidth, start.y * video.videoHeight);
            ctx.lineTo(end.x * video.videoWidth, end.y * video.videoHeight);
            ctx.stroke();
          }
        });
        
        // Draw key landmark points with labels
        const keyPoints = [
          { idx: 0, label: 'Nose', color: '#FFFF00' },
          { idx: 11, label: 'L-Shoulder', color: '#FF0000' },
          { idx: 12, label: 'R-Shoulder', color: '#FF0000' },
          { idx: 14, label: 'R-Elbow', color: '#00FFFF' },
          { idx: 16, label: 'R-Wrist', color: '#FF00FF' },
          { idx: 23, label: 'L-Hip', color: '#FFA500' },
          { idx: 24, label: 'R-Hip', color: '#FFA500' },
          { idx: 26, label: 'R-Knee', color: '#00FF00' },
          { idx: 28, label: 'R-Ankle', color: '#0000FF' }
        ];
        
        keyPoints.forEach(({ idx, label, color }) => {
          const landmark = landmarks[idx];
          if (landmark && (!landmark.visibility || landmark.visibility > 0.3)) {
            const x = landmark.x * video.videoWidth;
            const y = landmark.y * video.videoHeight;
            
            // Draw larger, more visible point
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw label with background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(x + 12, y - 20, label.length * 8, 16);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(label, x + 15, y - 8);
          }
        });
      }

      // Draw player bounding box
      if (playerBounds && playerBounds.confidence > 0.3) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const x = playerBounds.x * video.videoWidth;
        const y = playerBounds.y * video.videoHeight;
        const width = playerBounds.width * video.videoWidth;
        const height = playerBounds.height * video.videoHeight;
        
        ctx.strokeRect(x, y, width, height);
        
        // Player label
        ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.fillRect(x, y - 25, 120, 20);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`Player ${Math.round(playerBounds.confidence * 100)}%`, x + 5, y - 8);
      }

      // Draw improved racket detection
      if (racketBox && racketBox.confidence > 0.4) {
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        
        const x = racketBox.x * video.videoWidth;
        const y = racketBox.y * video.videoHeight;
        const width = racketBox.width * video.videoWidth;
        const height = racketBox.height * video.videoHeight;
        
        // Draw racket outline
        ctx.strokeRect(x, y, width, height);
        
        // Draw racket center point
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/2, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Racket label
        ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.fillRect(x, y - 25, 100, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`Racket ${Math.round(racketBox.confidence * 100)}%`, x + 5, y - 8);
      }

      // Draw ball detection
      if (ballDetection && ballDetection.confidence > 0.5) {
        ctx.strokeStyle = '#FFFF00';
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        
        const x = ballDetection.x * video.videoWidth;
        const y = ballDetection.y * video.videoHeight;
        const radius = ballDetection.radius * video.videoWidth;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Ball label
        ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
        ctx.fillRect(x + radius + 5, y - 15, 80, 20);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px Arial';
        ctx.fillText(`Ball ${Math.round(ballDetection.confidence * 100)}%`, x + radius + 8, y - 2);
      }
      
      ctx.restore();
      
      // Draw status panel
      if (pose || racketBox || playerBounds || ballDetection) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(10, 10, 300, 140);
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 300, 140);
        
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 14px Arial';
        let yOffset = 30;
        
        ctx.fillText('✓ Live Tennis Analysis Active', 20, yOffset);
        yOffset += 20;
        
        if (playerBounds) {
          ctx.fillText(`✓ Player: ${Math.round(playerBounds.confidence * 100)}%`, 20, yOffset);
          yOffset += 18;
        }
        
        if (pose && pose.landmarks) {
          ctx.fillText(`✓ Pose: ${pose.landmarks.length} points tracked`, 20, yOffset);
          yOffset += 18;
        }
        
        if (racketBox) {
          ctx.fillText(`✓ Racket: ${Math.round(racketBox.confidence * 100)}%`, 20, yOffset);
          yOffset += 18;
        }
        
        if (ballDetection) {
          ctx.fillText(`✓ Ball: ${Math.round(ballDetection.confidence * 100)}%`, 20, yOffset);
        }
      }
    };
    
    const animationFrame = requestAnimationFrame(function animate() {
      drawOverlay();
      requestAnimationFrame(animate);
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [pose, racketBox, playerBounds, ballDetection, canvasRef, videoRef, isPlaying, videoSource, zoom, panX, panY]);

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
                style={{ backgroundColor: '#000000' }}
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
                <p className="text-xs text-blue-600">Tennis serve tracking enabled</p>
              </div>
            )}
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 font-medium mb-1">Enhanced Tennis Analysis:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Player pose tracking optimized for tennis</li>
                <li>• Racket detection during serve motion</li>
                <li>• Real-time biomechanical analysis</li>
                <li>• Zoom and pan for detailed review</li>
                <li>• Frame-by-frame serve breakdown</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
