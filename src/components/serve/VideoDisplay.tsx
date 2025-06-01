
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

      // Draw pose skeleton
      if (pose && pose.landmarks) {
        drawPoseSkeleton(ctx, pose.landmarks, video.videoWidth, video.videoHeight);
      }

      // Draw player bounds
      if (playerBounds) {
        drawPlayerBounds(ctx, playerBounds, video.videoWidth, video.videoHeight);
      }

      // Draw racket
      if (racketBox) {
        drawRacketBox(ctx, racketBox, video.videoWidth, video.videoHeight);
      }

      // Draw ball
      if (ballDetection) {
        drawBallDetection(ctx, ballDetection, video.videoWidth, video.videoHeight);
      }
      
      ctx.restore();
      
      // Draw status info
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

  const drawPoseSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    console.log('Drawing pose with', landmarks.length, 'landmarks');
    
    // Key pose connections
    const connections = [
      [11, 12], [11, 23], [12, 24], [23, 24], // torso
      [12, 14], [14, 16], // right arm
      [11, 13], [13, 15], // left arm
    ];
    
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;
    
    // Draw connections
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      if (startPoint && endPoint && startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
        ctx.stroke();
      }
    });
    
    // Draw key points
    [0, 11, 12, 14, 16].forEach(idx => {
      const point = landmarks[idx];
      if (point && point.visibility > 0.5) {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const drawPlayerBounds = (ctx: CanvasRenderingContext2D, bounds: any, width: number, height: number) => {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    const x = bounds.x * width;
    const y = bounds.y * height;
    const w = bounds.width * width;
    const h = bounds.height * height;
    
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  };

  const drawRacketBox = (ctx: CanvasRenderingContext2D, racket: any, width: number, height: number) => {
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;
    
    const x = racket.x * width;
    const y = racket.y * height;
    const w = racket.width * width;
    const h = racket.height * height;
    
    ctx.strokeRect(x, y, w, h);
    
    // Center crosshair
    const centerX = x + w/2;
    const centerY = y + h/2;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();
  };

  const drawBallDetection = (ctx: CanvasRenderingContext2D, ball: any, width: number, height: number) => {
    ctx.strokeStyle = '#FFFF00';
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.lineWidth = 2;
    
    const x = ball.x * width;
    const y = ball.y * height;
    const radius = ball.radius * width;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };

  const drawStatusInfo = (ctx: CanvasRenderingContext2D, detections: any) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 80);
    
    ctx.fillStyle = '#00FF00';
    ctx.font = '12px Arial';
    let y = 25;
    
    ctx.fillText('🎾 Tennis AI Tracking', 15, y);
    y += 15;
    
    if (detections.pose) {
      ctx.fillText('✓ Pose: Active', 15, y);
      y += 12;
    }
    if (detections.racketBox) {
      ctx.fillText('✓ Racket: Detected', 15, y);
      y += 12;
    }
    if (detections.ballDetection) {
      ctx.fillText('✓ Ball: Tracked', 15, y);
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
