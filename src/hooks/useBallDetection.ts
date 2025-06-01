import { useState, useEffect, useRef } from 'react';

interface BallDetection {
  x: number;
  y: number;
  radius: number;
  confidence: number;
}

export const useBallDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [ballDetection, setBallDetection] = useState<BallDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>();
  const lastDetectionRef = useRef<number>(0);
  const stableBallRef = useRef<BallDetection | null>(null);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const detectBall = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended) {
        requestAnimationFrame(detectBall);
        return;
      }

      const now = performance.now();
      if (now - lastDetectionRef.current < 200) { // 5 FPS for ball detection
        requestAnimationFrame(detectBall);
        return;
      }
      lastDetectionRef.current = now;

      try {
        if (!video.videoWidth || !video.videoHeight) {
          requestAnimationFrame(detectBall);
          return;
        }

        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Lower resolution for performance
        const scale = 0.3;
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const ball = detectBallOptimized(imageData.data, canvas.width, canvas.height);
        
        if (ball && ball.confidence > 0.4) {
          // Smooth ball detection
          if (stableBallRef.current) {
            const smoothFactor = 0.6;
            ball.x = stableBallRef.current.x * smoothFactor + ball.x * (1 - smoothFactor);
            ball.y = stableBallRef.current.y * smoothFactor + ball.y * (1 - smoothFactor);
          }
          stableBallRef.current = ball;
          setBallDetection(ball);
        } else if (stableBallRef.current && stableBallRef.current.confidence > 0.6) {
          // Keep last known good detection for stability
          setBallDetection(stableBallRef.current);
        } else {
          setBallDetection(null);
        }
      } catch (error) {
        console.error('Ball detection error:', error);
      }

      requestAnimationFrame(detectBall);
    };

    detectBall();
  }, [isLoading, videoRef]);

  const detectBallOptimized = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    const candidates: Array<{x: number, y: number, score: number}> = [];
    
    // Scan with larger steps for performance
    for (let y = 5; y < height - 5; y += 6) {
      for (let x = 5; x < width - 5; x += 6) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (isTennisBallColor(r, g, b)) {
          const circularityScore = checkCircularity(data, x, y, width, height);
          if (circularityScore > 0.3) {
            candidates.push({x, y, score: circularityScore});
          }
        }
      }
    }

    if (candidates.length > 0) {
      const best = candidates.reduce((prev, current) => 
        current.score > prev.score ? current : prev
      );

      if (best.score > 0.4) {
        return {
          x: best.x / width,
          y: best.y / height,
          radius: 0.02,
          confidence: Math.min(0.9, best.score * 1.5)
        };
      }
    }

    return null;
  };

  const isTennisBallColor = (r: number, g: number, b: number): boolean => {
    const brightness = (r + g + b) / 3;
    const isYellow = g > 120 && r > 80 && r < 200 && b < 100;
    const hasContrast = Math.max(r, g, b) - Math.min(r, g, b) > 25;
    return isYellow && hasContrast && brightness > 100;
  };

  const checkCircularity = (data: Uint8ClampedArray, cx: number, cy: number, width: number, height: number): number => {
    let matches = 0;
    let total = 0;
    const radius = 3;
    
    for (let dy = -radius; dy <= radius; dy += 2) {
      for (let dx = -radius; dx <= radius; dx += 2) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          const x = cx + dx;
          const y = cy + dy;
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (isTennisBallColor(r, g, b)) {
              matches++;
            }
            total++;
          }
        }
      }
    }
    
    return total > 0 ? matches / total : 0;
  };

  return { ballDetection, isLoading };
};
