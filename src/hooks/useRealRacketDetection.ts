
import { useRacketDetectionCore } from './racket/useRacketDetectionCore';

interface RacketDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export const useRealRacketDetection = (videoRef: React.RefObject<HTMLVideoElement>, playerRegion?: any) => {
  return useRacketDetectionCore(videoRef, playerRegion);
};
