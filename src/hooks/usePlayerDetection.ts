
import { useState, useEffect, useRef } from 'react';
import { useBallDetection } from './useBallDetection';
import { useRealPlayerDetection } from './useRealPlayerDetection';

interface PlayerBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export const usePlayerDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [playerBounds, setPlayerBounds] = useState<PlayerBounds | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Use the real player detection
  const { playerRegion } = useRealPlayerDetection(videoRef);
  
  // Use the separate ball detection hook
  const { ballDetection } = useBallDetection(videoRef);

  useEffect(() => {
    setIsAnalyzing(true);
  }, []);

  useEffect(() => {
    if (playerRegion && playerRegion.confidence > 0.5) {
      setPlayerBounds({
        x: playerRegion.centerX - playerRegion.width / 2,
        y: playerRegion.centerY - playerRegion.height / 2,
        width: playerRegion.width,
        height: playerRegion.height,
        confidence: playerRegion.confidence
      });
    } else {
      setPlayerBounds(null);
    }
  }, [playerRegion]);

  return { 
    playerBounds, 
    ballDetection, 
    isAnalyzing 
  };
};
