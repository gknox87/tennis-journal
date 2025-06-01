
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
      
      // Set canvas size to match video element exactly
      const videoRect = video.getBoundingClientRect();
      canvas.style.width = `${videoRect.width}px`;
      canvas.style.height = `${videoRect.height}px`;
      canvas.width = videoRect.width;
      canvas.height = videoRect.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate proper scaling for overlays
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = canvas.width / canvas.height;
      
      let scale, offsetX, offsetY;
      if (videoAspect > canvasAspect) {
        // Video is wider - scale to fit height
        scale = canvas.height / video.videoHeight;
        offsetX = (canvas.width - video.videoWidth * scale) / 2;
        offsetY = 0;
      } else {
        // Video is taller - scale to fit width
        scale = canvas.width / video.videoWidth;
        offsetX = 0;
        offsetY = (canvas.height - video.videoHeight * scale) / 2;
      }
      
      ctx.save();
      ctx.translate(offsetX + panX, offsetY + panY);
      ctx.scale(scale * zoom, scale * zoom);

      // Draw pose skeleton
      if (pose && pose.landmarks && pose.landmarks.length >= 33) {
        drawPoseSkeleton(ctx, pose.landmarks, video.videoWidth, video.videoHeight);
      }

      // Draw racket box
      if (racketBox && racketBox.confidence > 0.3) {
        drawRacketBox(ctx, racketBox, video.videoWidth, video.videoHeight);
      }

      // Draw ball detection
      if (ballDetection && ballDetection.confidence > 0.3) {
        drawBallDetection(ctx, ballDetection, video.videoWidth, video.videoHeight);
      }
      
      ctx.restore();
      
      // Draw status info (unscaled)
      drawStatusInfo(ctx, { pose, racketBox, ballDetection });
      
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
    console.log('Drawing pose skeleton with', landmarks.length, 'landmarks');
    
    // MediaPipe pose connections
    const connections = [
      // Face
      [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
      // Torso
      [9, 10], [11, 12], [11, 23], [12, 24], [23, 24],
      // Arms
      [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      // Legs
      [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
      [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
    ];
    
    // Draw connections
    ctx.lineWidth = 3;
    connections.forEach(([start, end]) => {
      if (start < landmarks.length && end < landmarks.length) {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        
        if (startPoint && endPoint && 
            startPoint.visibility > 0.3 && endPoint.visibility > 0.3) {
          
          // Color code different body parts
          if (start <= 10 || end <= 10) {
            ctx.strokeStyle = '#00FFFF'; // Cyan for head
          } else if ((start >= 11 && start <= 22) || (end >= 11 && end <= 22)) {
            ctx.strokeStyle = '#00FF00'; // Green for upper body
          } else {
            ctx.strokeStyle = '#FF00FF'; // Magenta for lower body
          }
          
          ctx.beginPath();
          ctx.moveTo(startPoint.x * width, startPoint.y * height);
          ctx.lineTo(endPoint.x * width, endPoint.y * height);
          ctx.stroke();
        }
      }
    });
    
    // Draw key landmarks
    const keyPoints = [0, 11, 12, 15, 16, 23, 24];
    keyPoints.forEach(idx => {
      if (idx < landmarks.length) {
        const point = landmarks[idx];
        if (point && point.visibility > 0.3) {
          ctx.fillStyle = idx === 0 ? '#FFFF00' : '#FF0000';
          ctx.beginPath();
          ctx.arc(point.x * width, point.y * height, 6, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    });
  };

  const drawRacketBox = (ctx: CanvasRenderingContext2D, racket: any, width: number, height: number) => {
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
    
    const x = racket.x * width;
    const y = racket.y * height;
    const w = racket.width * width;
    const h = racket.height * height;
    
    ctx.strokeRect(x, y, w, h);
    
    // Draw center cross
    const centerX = x + w/2;
    const centerY = y + h/2;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#FF0000';
    ctx.font = '12px Arial';
    ctx.fillText(`Racket ${Math.round(racket.confidence * 100)}%`, x, y - 5);
  };

  const drawBallDetection = (ctx: CanvasRenderingContext2D, ball: any, width: number, height: number) => {
    ctx.strokeStyle = '#FFFF00';
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.lineWidth = 3;
    
    const x = ball.x * width;
    const y = ball.y * height;
    const radius = ball.radius * Math.min(width, height);
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Center dot
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Label
    ctx.font = '12px Arial';
    ctx.fillText(`Ball ${Math.round(ball.confidence * 100)}%`, x + radius + 5, y - 5);
  };

  const drawStatusInfo = (ctx: CanvasRenderingContext2D, detections: any) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 250, 100);
    
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 14px Arial';
    let y = 28;
    
    ctx.fillText('🎾 Tennis AI Tracking', 15, y);
    y += 20;
    
    ctx.font = '12px Arial';
    if (detections.pose && detections.pose.landmarks) {
      ctx.fillStyle = '#00FF00';
      ctx.fillText(`✓ Pose: ${detections.pose.landmarks.length} points`, 15, y);
    } else {
      ctx.fillStyle = '#FF6600';
      ctx.fillText('⚠ Pose: No detection', 15, y);
    }
    y += 15;
    
    if (detections.racketBox) {
      ctx.fillStyle = '#FF0000';
      ctx.fillText(`✓ Racket: ${Math.round(detections.racketBox.confidence * 100)}%`, 15, y);
    } else {
      ctx.fillStyle = '#FF6600';
      ctx.fillText('⚠ Racket: No detection', 15, y);
    }
    y += 15;
    
    if (detections.ballDetection) {
      ctx.fillStyle = '#FFFF00';
      ctx.fillText(`✓ Ball: ${Math.round(detections.ballDetection.confidence * 100)}%`, 15, y);
    } else {
      ctx.fillStyle = '#FF6600';
      ctx.fillText('⚠ Ball: No detection', 15, y);
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
