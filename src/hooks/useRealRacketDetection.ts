
import { useRacketDetectionCore } from './racket/useRacketDetectionCore';

interface PlayerRegion {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  confidence: number;
}

export const useRealRacketDetection = (videoRef: React.RefObject<HTMLVideoElement>, playerRegion?: PlayerRegion) => {
  return useRacketDetectionCore(videoRef, playerRegion);
};
