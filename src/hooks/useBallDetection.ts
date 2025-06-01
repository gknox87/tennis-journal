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
  const detectionRef = useRef<BallDetection | null>(null);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const detectBall = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || !video.videoWidth) {
        return;
      }

      try {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use smaller canvas for performance
        canvas.width = 160;
        canvas.height = 120;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const ball = findBall(imageData.data, canvas.width, canvas.height);
        
        if (ball && ball.confidence > 0.5) {
          detectionRef.current = ball;
          setBallDetection(ball);
          console.log('Ball detected:', ball);
        } else if (detectionRef.current && detectionRef.current.confidence > 0.7) {
          // Keep last good detection
          setBallDetection(detectionRef.current);
        }
      } catch (error) {
        console.error('Ball detection error:', error);
      }
    };

    // Run ball detection less frequently
    const interval = setInterval(detectBall, 200); // 5 FPS

    return () => {
      clearInterval(interval);
    };
  }, [videoRef]);

  const findBall = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    // Simple yellow ball detection
    for (let y = 10; y < height - 10; y += 4) {
      for (let x = 10; x < width - 10; x += 4) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Look for tennis ball yellow
        if (g > 150 && r > 100 && r < 220 && b < 80) {
          return {
            x: x / width,
            y: y / height,
            radius: 0.03,
            confidence: 0.8
          };
        }
      }
    }
    return null;
  };

  return { ballDetection, isLoading };
};
