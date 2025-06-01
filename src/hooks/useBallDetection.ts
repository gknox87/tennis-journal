
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
      // Process every 3rd frame for performance
      if (frameCountRef.current % 3 !== 0) {
        return;
      }

      try {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use smaller canvas for performance but maintain aspect ratio
        const scale = Math.min(320 / video.videoWidth, 240 / video.videoHeight);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const ball = findTennisBall(imageData.data, canvas.width, canvas.height);
        
        if (ball && ball.confidence > 0.4) {
          // Add to history for smoothing
          detectionHistoryRef.current.push(ball);
          if (detectionHistoryRef.current.length > 8) {
            detectionHistoryRef.current.shift();
          }
          
          // Apply smoothing
          const smoothedBall = smoothBallDetection(detectionHistoryRef.current);
          setBallDetection(smoothedBall);
          console.log('Ball detected and smoothed:', smoothedBall);
        } else if (detectionHistoryRef.current.length > 0) {
          // Gradually reduce confidence if no recent detections
          detectionHistoryRef.current = detectionHistoryRef.current.slice(-3);
          if (detectionHistoryRef.current.length > 0) {
            const lastBall = detectionHistoryRef.current[detectionHistoryRef.current.length - 1];
            setBallDetection({
              ...lastBall,
              confidence: lastBall.confidence * 0.8
            });
          } else {
            setBallDetection(null);
          }
        }
      } catch (error) {
        console.error('Ball detection error:', error);
      }
    };

    // Run ball detection at 10 FPS
    const interval = setInterval(detectBall, 100);

    return () => {
      clearInterval(interval);
    };
  }, [videoRef]);

  const findTennisBall = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    const candidates: Array<{x: number, y: number, score: number}> = [];
    
    // Scan for yellow/green tennis ball colors
    for (let y = 5; y < height - 5; y += 2) {
      for (let x = 5; x < width - 5; x += 2) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Check for tennis ball colors (yellow-green spectrum)
        const isTennisBallColor = (
          // Classic tennis ball yellow
          (g > 140 && r > 100 && r < 220 && b < 100 && Math.abs(g - r) < 80) ||
          // Bright yellow
          (g > 180 && r > 160 && b < 120) ||
          // Yellow-green
          (g > 150 && r > 120 && r < 200 && b < 120 && g > r)
        );
        
        if (isTennisBallColor) {
          // Check surrounding pixels for circular pattern
          const circularScore = checkCircularPattern(data, x, y, width, height);
          if (circularScore > 0.3) {
            candidates.push({
              x: x / width,
              y: y / height,
              score: circularScore
            });
          }
        }
      }
    }
    
    if (candidates.length > 0) {
      // Find best candidate
      const best = candidates.reduce((max, current) => 
        current.score > max.score ? current : max
      );
      
      return {
        x: best.x,
        y: best.y,
        radius: 0.02, // Approximate ball size
        confidence: Math.min(0.9, best.score)
      };
    }
    
    return null;
  };

  const checkCircularPattern = (data: Uint8ClampedArray, centerX: number, centerY: number, width: number, height: number): number => {
    let matchingPixels = 0;
    let totalChecked = 0;
    const radius = 3;
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          const x = centerX + dx;
          const y = centerY + dy;
          
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (g > 120 && r > 80 && b < 120) {
              matchingPixels++;
            }
            totalChecked++;
          }
        }
      }
    }
    
    return totalChecked > 0 ? matchingPixels / totalChecked : 0;
  };

  const smoothBallDetection = (history: BallDetection[]): BallDetection => {
    const weights = history.map((_, i) => i + 1); // More recent detections have higher weight
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    const x = history.reduce((sum, ball, i) => sum + ball.x * weights[i], 0) / totalWeight;
    const y = history.reduce((sum, ball, i) => sum + ball.y * weights[i], 0) / totalWeight;
    const radius = history.reduce((sum, ball, i) => sum + ball.radius * weights[i], 0) / totalWeight;
    const confidence = history.reduce((sum, ball, i) => sum + ball.confidence * weights[i], 0) / totalWeight;
    
    return { x, y, radius, confidence };
  };

  return { ballDetection, isLoading };
};
