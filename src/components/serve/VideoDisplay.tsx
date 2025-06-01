
import React, { useEffect, useRef } from 'react';
import { FileVideo } from 'lucide-react';

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  hasVideo: boolean;
  videoSource: 'camera' | 'file' | 'url';
  pose: any;
  racketBox: any;
  playerBounds?: any;
  ballDetection?: any;
  zoom: number;
  panX: number;
  panY: number;
}

export const VideoDisplay: React.FC<VideoDisplayProps> = ({
  videoRef,
  canvasRef,
  hasVideo,
  videoSource,
  pose,
  racketBox,
  playerBounds,
  ballDetection,
  zoom,
  panX,
  panY
}) => {
  const renderRef = useRef<number>(0);

  useEffect(() => {
    const drawOverlay = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video || !video.videoWidth || !video.videoHeight) {
        renderRef.current = requestAnimationFrame(drawOverlay);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Match canvas size to video element
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate video display scaling
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = canvas.width / canvas.height;
      
      let scale, offsetX, offsetY;
      if (videoAspect > canvasAspect) {
        scale = canvas.width / video.videoWidth;
        offsetX = 0;
        offsetY = (canvas.height - video.videoHeight * scale) / 2;
      } else {
        scale = canvas.height / video.videoHeight;
        offsetX = (canvas.width - video.videoWidth * scale) / 2;
        offsetY = 0;
      }
      
      ctx.save();
      ctx.translate(offsetX + panX, offsetY + panY);
      ctx.scale(scale * zoom, scale * zoom);

      // Draw player bounds first (background)
      if (playerBounds) {
        drawPlayerBounds(ctx, playerBounds, video.videoWidth, video.videoHeight);
      }

      // Draw pose skeleton (main tracking)
      if (pose && pose.landmarks) {
        drawFullPoseSkeleton(ctx, pose.landmarks, video.videoWidth, video.videoHeight);
      }

      // Draw racket (foreground)
      if (racketBox) {
        drawRacketBox(ctx, racketBox, video.videoWidth, video.videoHeight);
      }

      // Draw ball (top layer)
      if (ballDetection) {
        drawBallDetection(ctx, ballDetection, video.videoWidth, video.videoHeight);
      }
      
      ctx.restore();
      
      // Draw status info (unscaled)
      drawStatusInfo(ctx, { pose, racketBox, playerBounds, ballDetection });
      
      renderRef.current = requestAnimationFrame(drawOverlay);
    };
    
    renderRef.current = requestAnimationFrame(drawOverlay);
    
    return () => {
      if (renderRef.current) {
        cancelAnimationFrame(renderRef.current);
      }
    };
  }, [canvasRef, videoRef, pose, racketBox, playerBounds, ballDetection, zoom, panX, panY]);

  const drawFullPoseSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    if (!landmarks || landmarks.length < 33) {
      console.log('Insufficient landmarks for full pose:', landmarks?.length);
      return;
    }
    
    console.log('Drawing full pose with', landmarks.length, 'landmarks');
    
    // Define pose connections for full body
    const connections = [
      // Head and face
      [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
      // Upper body
      [9, 10], [11, 12], [11, 23], [12, 24], [23, 24],
      // Arms
      [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      // Lower body
      [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
      [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
    ];
    
    // Draw connections with different colors for different body parts
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      if (startPoint && endPoint && startPoint.visibility > 0.3 && endPoint.visibility > 0.3) {
        // Color code by body part
        if (start <= 10 || end <= 10) {
          ctx.strokeStyle = '#00FFFF'; // Cyan for head
        } else if ((start >= 11 && start <= 22) || (end >= 11 && end <= 22)) {
          ctx.strokeStyle = '#00FF00'; // Green for arms/torso
        } else {
          ctx.strokeStyle = '#FF00FF'; // Magenta for legs
        }
        
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
        ctx.stroke();
      }
    });
    
    // Draw key points with larger circles
    const keyPoints = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    keyPoints.forEach(idx => {
      const point = landmarks[idx];
      if (point && point.visibility > 0.3) {
        ctx.fillStyle = idx === 0 ? '#FFFF00' : 
                       idx <= 16 ? '#FF0000' : '#0000FF'; // Yellow head, red upper, blue lower
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, 8, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const drawPlayerBounds = (ctx: CanvasRenderingContext2D, bounds: any, width: number, height: number) => {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    
    const x = bounds.x * width;
    const y = bounds.y * height;
    const w = bounds.width * width;
    const h = bounds.height * height;
    
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
    
    // Add label
    ctx.fillStyle = '#FFD700';
    ctx.font = '14px Arial';
    ctx.fillText(`Player ${Math.round(bounds.confidence * 100)}%`, x + 5, y - 5);
  };

  const drawRacketBox = (ctx: CanvasRenderingContext2D, racket: any, width: number, height: number) => {
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
    
    const x = racket.x * width;
    const y = racket.y * height;
    const w = racket.width * width;
    const h = racket.height * height;
    
    ctx.strokeRect(x, y, w, h);
    
    // Draw racket crosshair
    const centerX = x + w/2;
    const centerY = y + h/2;
    ctx.beginPath();
    ctx.moveTo(centerX - 15, centerY);
    ctx.lineTo(centerX + 15, centerY);
    ctx.moveTo(centerX, centerY - 15);
    ctx.lineTo(centerX, centerY + 15);
    ctx.stroke();
    
    // Add label
    ctx.fillStyle = '#FF0000';
    ctx.font = '12px Arial';
    ctx.fillText(`Racket ${Math.round(racket.confidence * 100)}%`, x, y - 5);
  };

  const drawBallDetection = (ctx: CanvasRenderingContext2D, ball: any, width: number, height: number) => {
    ctx.strokeStyle = '#FFFF00';
    ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
    ctx.lineWidth = 3;
    
    const x = ball.x * width;
    const y = ball.y * height;
    const radius = ball.radius * width;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Add crosshair for ball center
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);
    ctx.stroke();
    
    // Add label
    ctx.fillStyle = '#FFFF00';
    ctx.font = '12px Arial';
    ctx.fillText(`Ball ${Math.round(ball.confidence * 100)}%`, x + 15, y - 10);
  };

  const drawStatusInfo = (ctx: CanvasRenderingContext2D, detections: any) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 250, 120);
    
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 14px Arial';
    let y = 28;
    
    ctx.fillText('🎾 Tennis AI Tracking', 15, y);
    y += 20;
    
    ctx.font = '12px Arial';
    if (detections.pose && detections.pose.landmarks) {
      ctx.fillStyle = '#00FF00';
      ctx.fillText(`✓ Pose: ${detections.pose.landmarks.length} points`, 15, y);
      y += 15;
    } else {
      ctx.fillStyle = '#FF6600';
      ctx.fillText('⚠ Pose: Initializing...', 15, y);
      y += 15;
    }
    
    if (detections.racketBox) {
      ctx.fillStyle = '#FF0000';
      ctx.fillText(`✓ Racket: ${Math.round(detections.racketBox.confidence * 100)}%`, 15, y);
      y += 15;
    } else {
      ctx.fillStyle = '#FF6600';
      ctx.fillText('⚠ Racket: Searching...', 15, y);
      y += 15;
    }
    
    if (detections.ballDetection) {
      ctx.fillStyle = '#FFFF00';
      ctx.fillText(`✓ Ball: ${Math.round(detections.ballDetection.confidence * 100)}%`, 15, y);
      y += 15;
    } else {
      ctx.fillStyle = '#FF6600';
      ctx.fillText('⚠ Ball: Searching...', 15, y);
      y += 15;
    }
    
    if (detections.playerBounds) {
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`✓ Player: ${Math.round(detections.playerBounds.confidence * 100)}%`, 15, y);
    }
  };

  return (
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
      
      {!hasVideo && videoSource === 'file' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
          <div className="text-center text-white">
            <FileVideo className="w-12 h-12 mx-auto mb-2 opacity-60" />
            <p className="text-sm">Upload a video to start analysis</p>
          </div>
        </div>
      )}
    </div>
  );
};
