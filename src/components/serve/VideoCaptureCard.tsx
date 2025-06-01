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
      
      // Calculate accurate video scaling
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
      ctx.save();
      ctx.translate(offsetX + panX, offsetY + panY);
      ctx.scale(scaleX * zoom, scaleY * zoom);

      // Draw accurate pose skeleton
      if (pose && pose.landmarks && pose.landmarks.length >= 33) {
        const landmarks = pose.landmarks;
        
        // Enhanced pose connections for tennis analysis
        const connections = [
          // Core body structure
          [11, 12], // shoulders
          [11, 23], [12, 24], [23, 24], // torso
          
          // Serving arm (right side) - most important
          [12, 14], [14, 16], // right shoulder to elbow to wrist
          
          // Support arm (left side)
          [11, 13], [13, 15], // left shoulder to elbow to wrist
          
          // Legs for power generation
          [23, 25], [25, 27], // left hip to knee to ankle
          [24, 26], [26, 28], // right hip to knee to ankle
          
          // Feet
          [27, 29], [28, 30], [29, 31], [30, 32]
        ];
        
        // Draw enhanced skeleton with better visibility
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 2;
        ctx.setLineDash([]);
        
        connections.forEach(([startIdx, endIdx]) => {
          const start = landmarks[startIdx];
          const end = landmarks[endIdx];
          
          if (start && end && 
              (!start.visibility || start.visibility > 0.5) && 
              (!end.visibility || end.visibility > 0.5)) {
            
            // Highlight serving arm in different color
            if ((startIdx === 12 && endIdx === 14) || (startIdx === 14 && endIdx === 16)) {
              ctx.strokeStyle = '#FF0080'; // Bright pink for serving arm
              ctx.lineWidth = 6;
            } else {
              ctx.strokeStyle = '#00FF00';
              ctx.lineWidth = 4;
            }
            
            ctx.beginPath();
            ctx.moveTo(start.x * video.videoWidth, start.y * video.videoHeight);
            ctx.lineTo(end.x * video.videoWidth, end.y * video.videoHeight);
            ctx.stroke();
          }
        });
        
        ctx.shadowBlur = 0; // Reset shadow
        
        // Draw key landmarks with enhanced visibility
        const keyPoints = [
          { idx: 0, label: 'HEAD', color: '#FFFF00', size: 12 },
          { idx: 12, label: 'R-SHOULDER', color: '#FF0080', size: 14 },
          { idx: 14, label: 'R-ELBOW', color: '#FF0080', size: 14 },
          { idx: 16, label: 'R-WRIST', color: '#FF0080', size: 16 },
          { idx: 11, label: 'L-SHOULDER', color: '#00FFFF', size: 12 },
          { idx: 24, label: 'R-HIP', color: '#FFA500', size: 12 },
          { idx: 26, label: 'R-KNEE', color: '#00FF00', size: 12 },
          { idx: 28, label: 'R-ANKLE', color: '#0080FF', size: 10 }
        ];
        
        keyPoints.forEach(({ idx, label, color, size }) => {
          const landmark = landmarks[idx];
          if (landmark && (!landmark.visibility || landmark.visibility > 0.5)) {
            const x = landmark.x * video.videoWidth;
            const y = landmark.y * video.videoHeight;
            
            // Draw enhanced point with outline
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x, y, size + 2, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw label with background
            if (zoom > 0.8) { // Only show labels when zoomed in enough
              const labelWidth = label.length * 8;
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.fillRect(x + 15, y - 25, labelWidth, 18);
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 12px Arial';
              ctx.fillText(label, x + 18, y - 10);
            }
          }
        });
      }

      // Draw enhanced player bounds
      if (playerBounds && playerBounds.confidence > 0.3) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 2;
        
        const x = playerBounds.x * video.videoWidth;
        const y = playerBounds.y * video.videoHeight;
        const width = playerBounds.width * video.videoWidth;
        const height = playerBounds.height * video.videoHeight;
        
        ctx.strokeRect(x, y, width, height);
        
        // Enhanced player label
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
        ctx.fillRect(x, y - 30, 140, 25);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`PLAYER ${Math.round(playerBounds.confidence * 100)}%`, x + 5, y - 10);
      }

      // Draw enhanced racket detection
      if (racketBox && racketBox.confidence > 0.5) {
        ctx.setLineDash([]);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        
        const x = racketBox.x * video.videoWidth;
        const y = racketBox.y * video.videoHeight;
        const width = racketBox.width * video.videoWidth;
        const height = racketBox.height * video.videoHeight;
        
        // Draw racket outline with rounded corners
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 8);
        ctx.stroke();
        
        // Draw racket center crosshair
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 2;
        const centerX = x + width/2;
        const centerY = y + height/2;
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY);
        ctx.lineTo(centerX + 10, centerY);
        ctx.moveTo(centerX, centerY - 10);
        ctx.lineTo(centerX, centerY + 10);
        ctx.stroke();
        
        // Enhanced racket label
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.95)';
        ctx.fillRect(x, y - 30, 120, 25);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`RACKET ${Math.round(racketBox.confidence * 100)}%`, x + 5, y - 10);
      }

      // Draw ball detection
      if (ballDetection && ballDetection.confidence > 0.6) {
        ctx.setLineDash([]);
        ctx.strokeStyle = '#FFFF00';
        ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 2;
        
        const x = ballDetection.x * video.videoWidth;
        const y = ballDetection.y * video.videoHeight;
        const radius = ballDetection.radius * video.videoWidth;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Ball trail effect
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Ball label
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 0, 0.95)';
        ctx.fillRect(x + radius + 8, y - 20, 90, 22);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`BALL ${Math.round(ballDetection.confidence * 100)}%`, x + radius + 12, y - 5);
      }
      
      ctx.restore();
      
      // Draw enhanced status panel
      if (pose || racketBox || playerBounds || ballDetection) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(10, 10, 320, 160);
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, 320, 160);
        
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 16px Arial';
        let yOffset = 35;
        
        ctx.fillText('🎾 LIVE TENNIS AI ANALYSIS', 20, yOffset);
        yOffset += 25;
        
        if (playerBounds) {
          ctx.fillStyle = '#FFD700';
          ctx.fillText(`👤 Player Detected: ${Math.round(playerBounds.confidence * 100)}%`, 20, yOffset);
          yOffset += 20;
        }
        
        if (pose && pose.landmarks) {
          ctx.fillStyle = '#FF0080';
          ctx.fillText(`🎯 Pose Tracking: ${pose.landmarks.length} points`, 20, yOffset);
          yOffset += 20;
        }
        
        if (racketBox) {
          ctx.fillStyle = '#FF0000';
          ctx.fillText(`🎾 Racket Found: ${Math.round(racketBox.confidence * 100)}%`, 20, yOffset);
          yOffset += 20;
        }
        
        if (ballDetection) {
          ctx.fillStyle = '#FFFF00';
          ctx.fillText(`⚪ Ball Tracked: ${Math.round(ballDetection.confidence * 100)}%`, 20, yOffset);
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
                <p className="text-xs text-blue-600">Enhanced tennis tracking enabled</p>
              </div>
            )}
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 font-medium mb-1">Enhanced Tennis Analysis:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Instant player pose tracking</li>
                <li>• Real-time racket detection</li>
                <li>• Live biomechanical analysis</li>
                <li>• Accurate serve phase detection</li>
                <li>• Frame-by-frame serve breakdown</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
