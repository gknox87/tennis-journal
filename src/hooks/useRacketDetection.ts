
import { useRealRacketDetection } from './useRealRacketDetection';

export const useRacketDetection = (videoRef: React.RefObject<HTMLVideoElement>, playerBounds?: any, pose?: any) => {
  return useRealRacketDetection(videoRef, playerBounds);
};
