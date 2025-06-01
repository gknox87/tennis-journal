
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
  const animationFrameRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>();
  const lastDetectionRef = useRef<number>(0);

  useEffect(() => {
    console.log('Initializing optimized ball detection...');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const detectBall = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended) {
        animationFrameRef.current = requestAnimationFrame(detectBall);
        return;
      }

      const now = performance.now();
      if (now - lastDetectionRef.current < 150) { // 6-7 FPS for ball detection
        animationFrameRef.current = requestAnimationFrame(detectBall);
        return;
      }
      lastDetectionRef.current = now;

      try {
        if (!video.videoWidth || !video.videoHeight) {
          animationFrameRef.current = requestAnimationFrame(detectBall);
          return;
        }

        // Create analysis canvas if needed
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use lower resolution for faster processing
        const scale = 0.5;
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const ball = detectBallOptimized(imageData.data, canvas.width, canvas.height);
        
        if (ball && ball.confidence > 0.6) {
          setBallDetection(ball);
          console.log('Ball detected:', ball);
        } else {
          setBallDetection(null);
        }
      } catch (error) {
        console.error('Ball detection error:', error);
        setBallDetection(null);
      }

      animationFrameRef.current = requestAnimationFrame(detectBall);
    };

    detectBall();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLoading, videoRef]);

  const detectBallOptimized = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    const candidates: Array<{x: number, y: number, score: number}> = [];
    
    // Optimized scanning with larger steps
    for (let y = 10; y < height - 10; y += 8) {
      for (let x = 10; x < width - 10; x += 8) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Quick tennis ball color check
        if (isTennisBallColor(r, g, b)) {
          const circularityScore = checkCircularity(data, x, y, width, height);
          if (circularityScore > 0.5) {
            candidates.push({x, y, score: circularityScore});
          }
        }
      }
    }

    if (candidates.length > 0) {
      // Find best candidate
      const best = candidates.reduce((prev, current) => 
        current.score > prev.score ? current : prev
      );

      if (best.score > 0.6) {
        return {
          x: best.x / width,
          y: best.y / height,
          radius: 0.015,
          confidence: Math.min(0.95, best.score)
        };
      }
    }

    return null;
  };

  const isTennisBallColor = (r: number, g: number, b: number): boolean => {
    // Tennis ball fluorescent yellow-green detection
    const brightness = (r + g + b) / 3;
    const isYellow = g > 140 && r > 100 && r < 220 && b < 120;
    const hasContrast = Math.max(r, g, b) - Math.min(r, g, b) > 30;
    return isYellow && hasContrast && brightness > 120;
  };

  const checkCircularity = (data: Uint8ClampedArray, cx: number, cy: number, width: number, height: number): number => {
    let matches = 0;
    let total = 0;
    const radius = 4;
    
    // Check circular pattern
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
