
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
    console.log('Initializing real ball detection...');
    setTimeout(() => {
      setIsLoading(false);
      console.log('Real ball detection ready');
    }, 100);
  }, []);

  useEffect(() => {
    if (isLoading || !videoRef.current) return;

    const detectBall = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended) {
        animationFrameRef.current = requestAnimationFrame(detectBall);
        return;
      }

      const now = performance.now();
      if (now - lastDetectionRef.current < 33) { // 30 FPS
        animationFrameRef.current = requestAnimationFrame(detectBall);
        return;
      }
      lastDetectionRef.current = now;

      try {
        if (!video.videoWidth || !video.videoHeight) {
          animationFrameRef.current = requestAnimationFrame(detectBall);
          return;
        }

        // Create analysis canvas
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const ballDetection = detectBallFromPixels(data, canvas.width, canvas.height);
        
        if (ballDetection && ballDetection.confidence > 0.7) {
          setBallDetection(ballDetection);
          console.log('Ball detected at:', ballDetection);
        } else {
          setBallDetection(null);
        }
      } catch (error) {
        console.error('Ball detection error:', error);
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

  const detectBallFromPixels = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    const ballCandidates: Array<{x: number, y: number, score: number}> = [];
    
    // Scan for tennis ball colors and circular patterns
    for (let y = 8; y < height - 8; y += 4) {
      for (let x = 8; x < width - 8; x += 4) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (isTennisBallColor(r, g, b)) {
          const circularityScore = checkBallCircularity(data, x, y, width, height);
          if (circularityScore > 0.6) {
            ballCandidates.push({x, y, score: circularityScore});
          }
        }
      }
    }

    if (ballCandidates.length > 0) {
      const bestCandidate = ballCandidates.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      if (bestCandidate.score > 0.7) {
        return {
          x: bestCandidate.x / width,
          y: bestCandidate.y / height,
          radius: 0.012, // Realistic tennis ball size
          confidence: bestCandidate.score
        };
      }
    }

    return null;
  };

  const isTennisBallColor = (r: number, g: number, b: number): boolean => {
    // Tennis ball fluorescent yellow-green
    const isYellowGreen = g > 160 && r > 120 && r < 240 && b < 140;
    const isProperRatio = g > r * 0.8 && g > b * 1.2;
    return isYellowGreen && isProperRatio;
  };

  const checkBallCircularity = (data: Uint8ClampedArray, cx: number, cy: number, width: number, height: number): number => {
    let circularPixels = 0;
    let totalPixels = 0;
    const radius = 6; // Check 6-pixel radius for ball
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
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
              circularPixels++;
            }
            totalPixels++;
          }
        }
      }
    }
    
    return totalPixels > 0 ? circularPixels / totalPixels : 0;
  };

  return { ballDetection, isLoading };
};
