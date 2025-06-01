
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
  const lastDrawRef = useRef<number>(0);

  useEffect(() => {
    const drawOverlay = () => {
      const now = performance.now();
      if (now - lastDrawRef.current < 33) { // 30 FPS max
        requestAnimationFrame(drawOverlay);
        return;
      }
      lastDrawRef.current = now;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video || !video.videoWidth || !video.videoHeight) {
        requestAnimationFrame(drawOverlay);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Get display dimensions
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Calculate scaling
      const videoAspectRatio = video.videoWidth / video.videoHeight;
      const displayAspectRatio = rect.width / rect.height;
      
      let scaleX, scaleY, offsetX, offsetY;
      
      if (videoAspectRatio > displayAspectRatio) {
        scaleX = rect.width / video.videoWidth;
        scaleY = scaleX;
        offsetX = 0;
        offsetY = (rect.height - video.videoHeight * scaleY) / 2;
      } else {
        scaleY = rect.height / video.videoHeight;
        scaleX = scaleY;
        offsetX = (rect.width - video.videoWidth * scaleX) / 2;
        offsetY = 0;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(offsetX + panX, offsetY + panY);
      ctx.scale(scaleX * zoom, scaleY * zoom);

      // Draw pose skeleton with optimized rendering
      if (pose && pose.landmarks && pose.landmarks.length >= 33) {
        drawPoseSkeleton(ctx, pose.landmarks, video.videoWidth, video.videoHeight);
      }

      // Draw player bounds
      if (playerBounds && playerBounds.confidence > 0.4) {
        drawPlayerBounds(ctx, playerBounds, video.videoWidth, video.videoHeight);
      }

      // Draw racket detection
      if (racketBox && racketBox.confidence > 0.5) {
        drawRacketBox(ctx, racketBox, video.videoWidth, video.videoHeight);
      }

      // Draw ball detection
      if (ballDetection && ballDetection.confidence > 0.6) {
        drawBallDetection(ctx, ballDetection, video.videoWidth, video.videoHeight);
      }
      
      ctx.restore();
      
      // Draw status panel
      drawStatusPanel(ctx, { pose, racketBox, playerBounds, ballDetection });
      
      requestAnimationFrame(drawOverlay);
    };
    
    drawOverlay();
  }, [pose, racketBox, playerBounds, ballDetection, canvasRef, videoRef, zoom, panX, panY]);

  const drawPoseSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    // Key connections for tennis analysis
    const connections = [
      [11, 12], // shoulders
      [11, 23], [12, 24], [23, 24], // torso
      [12, 14], [14, 16], // right arm (serving)
      [11, 13], [13, 15], // left arm
      [23, 25], [25, 27], // left leg
      [24, 26], [26, 28], // right leg
    ];
    
    ctx.lineWidth = 3;
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 2;
    
    // Draw connections
    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      
      if (start && end && start.visibility > 0.6 && end.visibility > 0.6) {
        // Highlight serving arm
        if ((startIdx === 12 && endIdx === 14) || (startIdx === 14 && endIdx === 16)) {
          ctx.strokeStyle = '#FF0080';
          ctx.lineWidth = 4;
        } else {
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 3;
        }
        
        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      }
    });
    
    ctx.shadowBlur = 0;
    
    // Draw key points
    const keyPoints = [
      { idx: 0, color: '#FFFF00', size: 6 }, // head
      { idx: 12, color: '#FF0080', size: 8 }, // right shoulder
      { idx: 14, color: '#FF0080', size: 8 }, // right elbow
      { idx: 16, color: '#FF0080', size: 10 }, // right wrist
    ];
    
    keyPoints.forEach(({ idx, color, size }) => {
      const point = landmarks[idx];
      if (point && point.visibility > 0.6) {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, size + 1, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, size, 0, 2 * Math.PI);
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
    
    // Label
    ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
    ctx.fillRect(x, y - 25, 120, 20);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`PLAYER ${Math.round(bounds.confidence * 100)}%`, x + 4, y - 8);
  };

  const drawRacketBox = (ctx: CanvasRenderingContext2D, racket: any, width: number, height: number) => {
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    
    const x = racket.x * width;
    const y = racket.y * height;
    const w = racket.width * width;
    const h = racket.height * height;
    
    ctx.strokeRect(x, y, w, h);
    
    // Crosshair
    const centerX = x + w/2;
    const centerY = y + h/2;
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();
    
    // Label
    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
    ctx.fillRect(x, y - 25, 110, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`RACKET ${Math.round(racket.confidence * 100)}%`, x + 4, y - 8);
  };

  const drawBallDetection = (ctx: CanvasRenderingContext2D, ball: any, width: number, height: number) => {
    ctx.strokeStyle = '#FFFF00';
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.lineWidth = 3;
    
    const x = ball.x * width;
    const y = ball.y * height;
    const radius = ball.radius * width;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Label
    ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.fillRect(x + radius + 5, y - 15, 85, 18);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px Arial';
    ctx.fillText(`BALL ${Math.round(ball.confidence * 100)}%`, x + radius + 8, y - 3);
  };

  const drawStatusPanel = (ctx: CanvasRenderingContext2D, detections: any) => {
    if (!detections.pose && !detections.racketBox && !detections.playerBounds && !detections.ballDetection) {
      return;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(10, 10, 300, 120);
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 300, 120);
    
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 14px Arial';
    let yPos = 30;
    
    ctx.fillText('🎾 REAL TENNIS AI TRACKING', 18, yPos);
    yPos += 22;
    
    if (detections.playerBounds) {
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`👤 Player: ${Math.round(detections.playerBounds.confidence * 100)}% detected`, 18, yPos);
      yPos += 18;
    }
    
    if (detections.pose && detections.pose.landmarks) {
      ctx.fillStyle = '#FF0080';
      ctx.fillText(`🎯 Pose: ${detections.pose.landmarks.length} joints tracked`, 18, yPos);
      yPos += 18;
    }
    
    if (detections.racketBox) {
      ctx.fillStyle = '#FF0000';
      ctx.fillText(`🎾 Racket: ${Math.round(detections.racketBox.confidence * 100)}% accuracy`, 18, yPos);
      yPos += 18;
    }
    
    if (detections.ballDetection) {
      ctx.fillStyle = '#FFFF00';
      ctx.fillText(`⚪ Ball: ${Math.round(detections.ballDetection.confidence * 100)}% tracked`, 18, yPos);
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
