
import { useState, useEffect, useRef } from 'react';
import { detectRacketFromPixels } from './racketPatternAnalysis';

interface RacketDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export const useRacketDetectionCore = (
  videoRef: React.RefObject<HTMLVideoElement>, 
  playerRegion?: any
) => {
  const [racketBox, setRacketBox] = useState<RacketDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>();
  const animationFrameRef = useRef<number>();
  const lastDetectionRef = useRef<number>(0);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const detectRealRacket = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || !video.videoWidth || !video.videoHeight) {
        animationFrameRef.current = requestAnimationFrame(detectRealRacket);
        return;
      }

      const now = performance.now();
      if (now - lastDetectionRef.current < 33) { // 30 FPS
        animationFrameRef.current = requestAnimationFrame(detectRealRacket);
        return;
      }
      lastDetectionRef.current = now;

      try {
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
        const racketDetection = detectRacketFromPixels(imageData.data, canvas.width, canvas.height, playerRegion);
        
        if (racketDetection && racketDetection.confidence > 0.6) {
          setRacketBox(racketDetection);
          console.log('Real racket detected:', racketDetection);
        } else {
          setRacketBox(null);
        }
      } catch (error) {
        console.error('Real racket detection error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detectRealRacket);
    };

    detectRealRacket();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoRef, playerRegion]);

  return { racketBox, isLoading };
};
