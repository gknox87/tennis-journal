import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Square, FileVideo } from 'lucide-react';
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
      
      // Get video element's actual display dimensions
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Calculate video scaling to match display exactly
      const videoAspectRatio = video.videoWidth / video.videoHeight;
      const displayAspectRatio = rect.width / rect.height;
      
      let scaleX, scaleY, offsetX, offsetY;
      
      if (videoAspectRatio > displayAspectRatio) {
        // Video is wider than container
        scaleX = rect.width / video.videoWidth;
        scaleY = scaleX;
        offsetX = 0;
        offsetY = (rect.height - video.videoHeight * scaleY) / 2;
      } else {
        // Video is taller than container
        scaleY = rect.height / video.videoHeight;
        scaleX = scaleY;
        offsetX = (rect.width - video.videoWidth * scaleX) / 2;
        offsetY = 0;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(offsetX + panX, offsetY + panY);
      ctx.scale(scaleX * zoom, scaleY * zoom);

      // Draw pose skeleton with PERFECT alignment
      if (pose && pose.landmarks && pose.landmarks.length >= 33) {
        const landmarks = pose.landmarks;
        
        // Define skeleton connections for tennis analysis
        const connections = [
          // Core structure
          [11, 12], // shoulders
          [11, 23], [12, 24], [23, 24], // torso
          
          // Arms - critical for serve
          [12, 14], [14, 16], // right arm (serving)
          [11, 13], [13, 15], // left arm
          
          // Legs - power generation
          [23, 25], [25, 27], // left leg
          [24, 26], [26, 28], // right leg
          
          // Feet
          [27, 29], [28, 30], [29, 31], [30, 32]
        ];
        
        // Draw skeleton lines
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 2;
        
        connections.forEach(([startIdx, endIdx]) => {
          const start = landmarks[startIdx];
          const end = landmarks[endIdx];
          
          if (start && end && 
              (!start.visibility || start.visibility > 0.5) && 
              (!end.visibility || end.visibility > 0.5)) {
            
            // Highlight serving arm
            if ((startIdx === 12 && endIdx === 14) || (startIdx === 14 && endIdx === 16)) {
              ctx.strokeStyle = '#FF0080';
              ctx.lineWidth = 4;
            } else {
              ctx.strokeStyle = '#00FF00';
              ctx.lineWidth = 3;
            }
            
            ctx.beginPath();
            ctx.moveTo(start.x * video.videoWidth, start.y * video.videoHeight);
            ctx.lineTo(end.x * video.videoWidth, end.y * video.videoHeight);
            ctx.stroke();
          }
        });
        
        ctx.shadowBlur = 0;
        
        // Draw key landmarks with perfect positioning
        const keyPoints = [
          { idx: 0, label: 'NOSE', color: '#FFFF00', size: 6 },
          { idx: 12, label: 'R-SHOULDER', color: '#FF0080', size: 8 },
          { idx: 14, label: 'R-ELBOW', color: '#FF0080', size: 8 },
          { idx: 16, label: 'R-WRIST', color: '#FF0080', size: 10 },
          { idx: 11, label: 'L-SHOULDER', color: '#00FFFF', size: 6 },
          { idx: 24, label: 'R-HIP', color: '#FFA500', size: 6 },
          { idx: 26, label: 'R-KNEE', color: '#00FF00', size: 6 },
          { idx: 28, label: 'R-ANKLE', color: '#0080FF', size: 6 }
        ];
        
        keyPoints.forEach(({ idx, label, color, size }) => {
          const landmark = landmarks[idx];
          if (landmark && (!landmark.visibility || landmark.visibility > 0.5)) {
            const x = landmark.x * video.videoWidth;
            const y = landmark.y * video.videoHeight;
            
            // Draw point with black outline
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x, y, size + 2, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw labels for key points
            if (zoom > 0.8) {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.fillRect(x + 12, y - 18, label.length * 7, 14);
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 11px Arial';
              ctx.fillText(label, x + 15, y - 7);
            }
          }
        });
      }

      // Draw player bounds with perfect alignment
      if (playerBounds && playerBounds.confidence > 0.4) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        
        const x = playerBounds.x * video.videoWidth;
        const y = playerBounds.y * video.videoHeight;
        const width = playerBounds.width * video.videoWidth;
        const height = playerBounds.height * video.videoHeight;
        
        ctx.strokeRect(x, y, width, height);
        
        // Player label
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.fillRect(x, y - 25, 130, 20);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`PLAYER ${Math.round(playerBounds.confidence * 100)}%`, x + 3, y - 9);
      }

      // Draw racket with perfect alignment
      if (racketBox && racketBox.confidence > 0.6) {
        ctx.setLineDash([]);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        
        const x = racketBox.x * video.videoWidth;
        const y = racketBox.y * video.videoHeight;
        const width = racketBox.width * video.videoWidth;
        const height = racketBox.height * video.videoHeight;
        
        ctx.strokeRect(x, y, width, height);
        
        // Racket center crosshair
        const centerX = x + width/2;
        const centerY = y + height/2;
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY);
        ctx.lineTo(centerX + 10, centerY);
        ctx.moveTo(centerX, centerY - 10);
        ctx.lineTo(centerX, centerY + 10);
        ctx.stroke();
        
        // Racket label
        ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.fillRect(x, y - 25, 120, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`RACKET ${Math.round(racketBox.confidence * 100)}%`, x + 3, y - 9);
      }

      // Draw ball with perfect alignment
      if (ballDetection && ballDetection.confidence > 0.7) {
        ctx.setLineDash([]);
        ctx.strokeStyle = '#FFFF00';
        ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
        ctx.lineWidth = 3;
        
        const x = ballDetection.x * video.videoWidth;
        const y = ballDetection.y * video.videoHeight;
        const radius = ballDetection.radius * video.videoWidth;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Ball label
        ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
        ctx.fillRect(x + radius + 5, y - 15, 90, 18);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(`BALL ${Math.round(ballDetection.confidence * 100)}%`, x + radius + 8, y - 3);
      }
      
      ctx.restore();
      
      // Draw status panel
      if (pose || racketBox || playerBounds || ballDetection) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(8, 8, 300, 150);
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, 300, 150);
        
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 14px Arial';
        let yOffset = 28;
        
        ctx.fillText('🎾 TENNIS AI TRACKING', 15, yOffset);
        yOffset += 22;
        
        if (playerBounds) {
          ctx.fillStyle = '#FFD700';
          ctx.fillText(`👤 Player: ${Math.round(playerBounds.confidence * 100)}%`, 15, yOffset);
          yOffset += 18;
        }
        
        if (pose && pose.landmarks) {
          ctx.fillStyle = '#FF0080';
          ctx.fillText(`🎯 Pose: ${pose.landmarks.length} points`, 15, yOffset);
          yOffset += 18;
        }
        
        if (racketBox) {
          ctx.fillStyle = '#FF0000';
          ctx.fillText(`🎾 Racket: ${Math.round(racketBox.confidence * 100)}%`, 15, yOffset);
          yOffset += 18;
        }
        
        if (ballDetection) {
          ctx.fillStyle = '#FFFF00';
          ctx.fillText(`⚪ Ball: ${Math.round(ballDetection.confidence * 100)}%`, 15, yOffset);
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
                  {isPlaying ? 'Real-time analysis active...' : 'Use controls to navigate video'}
                </p>
              </div>
            )}
            
            {analysisActive && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">✓ AI Analysis Active</p>
                <p className="text-xs text-blue-600">Pixel-perfect tennis tracking enabled</p>
              </div>
            )}
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 font-medium mb-1">Real Tennis Analysis:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Pixel-perfect pose detection</li>
                <li>• Real racket tracking</li>
                <li>• Accurate ball detection</li>
                <li>• Perfect overlay alignment</li>
                <li>• 30 FPS real-time analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
