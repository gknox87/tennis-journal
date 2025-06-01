
import { useAccuratePoseDetection } from './useAccuratePoseDetection';

export const useMediaPipePose = (videoRef: React.RefObject<HTMLVideoElement>, playerBounds?: any) => {
  return useAccuratePoseDetection(videoRef);
};
