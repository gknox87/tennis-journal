
import { useState, useEffect, useRef } from 'react';

interface BallDetection {
  x: number;
  y: number;
  radius: number;
  confidence: number;
}

export const useBallDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [ballDetection, setBallDetection] = useState<BallDetection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>();
  const detectionHistoryRef = useRef<BallDetection[]>([]);
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const detectBall = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || !video.videoWidth) {
        return;
      }

      frameCountRef.current++;
      // Process every 5th frame for better performance
      if (frameCountRef.current % 5 !== 0) {
        return;
      }

      try {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const ball = findTennisBall(imageData.data, canvas.width, canvas.height);
        
        if (ball && ball.confidence > 0.4) {
          // Add to history for smoothing
          detectionHistoryRef.current.push(ball);
          if (detectionHistoryRef.current.length > 5) {
            detectionHistoryRef.current.shift();
          }
          
          // Only show detection if consistent
          if (detectionHistoryRef.current.length >= 3) {
            const smoothedBall = smoothBallDetection(detectionHistoryRef.current);
            if (smoothedBall) {
              setBallDetection(smoothedBall);
              console.log('Ball detected:', smoothedBall);
            }
          }
        } else {
          // Clear detection if no ball found for a while
          detectionHistoryRef.current = [];
          setBallDetection(null);
        }
      } catch (error) {
        console.error('Ball detection error:', error);
      }
    };

    // Run ball detection at 12 FPS
    const interval = setInterval(detectBall, 83);

    return () => {
      clearInterval(interval);
    };
  }, [videoRef]);

  const findTennisBall = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    const candidates: Array<{x: number, y: number, score: number}> = [];
    
    // Scan for tennis ball - focus on likely areas
    const stepSize = 6;
    for (let y = 0; y < height; y += stepSize) {
      for (let x = 0; x < width; x += stepSize) {
        const score = checkTennisBallColor(data, x, y, width, height);
        if (score > 0.3) {
          candidates.push({x, y, score});
        }
      }
    }
    
    if (candidates.length === 0) return null;
    
    // Find best candidate
    const best = candidates.reduce((max, current) => 
      current.score > max.score ? current : max
    );
    
    if (best.score > 0.4) {
      return {
        x: best.x / width,
        y: best.y / height,
        radius: 0.015, // Reasonable tennis ball size
        confidence: Math.min(0.95, best.score)
      };
    }
    
    return null;
  };

  const checkTennisBallColor = (data: Uint8ClampedArray, x: number, y: number, width: number, height: number): number => {
    let score = 0;
    let samples = 0;
    
    // Check a small region around the point
    const checkRadius = 8;
    for (let dy = -checkRadius; dy <= checkRadius; dy += 2) {
      for (let dx = -checkRadius; dx <= checkRadius; dx += 2) {
        const px = x + dx;
        const py = y + dy;
        
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const i = (py * width + px) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Tennis ball is typically bright yellow-green
          if (isTennisBallColor(r, g, b)) {
            score += 1;
          }
          samples++;
        }
      }
    }
    
    return samples > 0 ? score / samples : 0;
  };

  const isTennisBallColor = (r: number, g: number, b: number): boolean => {
    // Tennis ball yellow-green color detection
    return (
      // Bright yellow tennis ball
      (g > 150 && r > 120 && r < 200 && b < 100 && g > r && (g - b) > 80) ||
      // Fluorescent yellow (very bright)
      (g > 180 && r > 160 && b < 80 && Math.abs(g - r) < 40) ||
      // Slightly green-yellow
      (g > 140 && r > 100 && b < 90 && g > r && r > b)
    );
  };

  const smoothBallDetection = (history: BallDetection[]): BallDetection | null => {
    if (history.length < 2) return null;
    
    // Average recent detections for smoothing
    const avgX = history.reduce((sum, ball) => sum + ball.x, 0) / history.length;
    const avgY = history.reduce((sum, ball) => sum + ball.y, 0) / history.length;
    const avgRadius = history.reduce((sum, ball) => sum + ball.radius, 0) / history.length;
    const avgConfidence = history.reduce((sum, ball) => sum + ball.confidence, 0) / history.length;
    
    return {
      x: avgX,
      y: avgY,
      radius: avgRadius,
      confidence: Math.min(0.95, avgConfidence * 1.1)
    };
  };

  return { ballDetection, isLoading };
};
