import { useState, useEffect, useRef } from 'react';
import { useRacketDetectionCore } from './racket/useRacketDetectionCore';
import { useYoloRacketDetection } from './useYoloRacketDetection';

interface RacketDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export const useRacketDetection = (
  videoRef: React.RefObject<HTMLVideoElement>, 
  playerBounds?: any, 
  pose?: any
) => {
  const [racketBox, setRacketBox] = useState<RacketDetection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const smoothingRef = useRef<RacketDetection[]>([]);

  // Primary YOLO-based racket detection
  const { 
    racketDetection: yoloRacketDetection,
    isLoading: yoloLoading,
    error: yoloError,
    modelLoaded: yoloModelLoaded,
    usingFallback: yoloUsingFallback
  } = useYoloRacketDetection(videoRef);

  // Pixel-based fallback
  const { racketBox: pixelRacketBox, isLoading: pixelLoading } = useRacketDetectionCore(videoRef, playerBounds);

  // Pose-based racket estimation (fallback when YOLO fails)
  const estimateRacketFromPose = (pose: any): RacketDetection | null => {
    if (!pose || !pose.landmarks || pose.landmarks.length < 17) return null;

    // Try right hand first (most common for tennis)
    const rightWrist = pose.landmarks[16]; // Right wrist
    const rightElbow = pose.landmarks[14]; // Right elbow
    
    if (rightWrist && rightElbow && rightWrist.visibility > 0.5) {
      // Calculate direction from elbow to wrist
      const direction = {
        x: rightWrist.x - rightElbow.x,
        y: rightWrist.y - rightElbow.y
      };
      // Extend racket beyond wrist
      const racketX = rightWrist.x + direction.x * 0.5;
      const racketY = rightWrist.y + direction.y * 0.5;
      return {
        x: Math.max(0, Math.min(0.85, racketX - 0.06)),
        y: Math.max(0, Math.min(0.85, racketY - 0.08)),
        width: 0.12,
        height: 0.16,
        confidence: Math.min(0.7, rightWrist.visibility + 0.1) // Lower confidence for pose estimation
      };
    } else {
      // Fallback to left hand
      const leftWrist = pose.landmarks[15]; // Left wrist
      const leftElbow = pose.landmarks[13]; // Left elbow
      if (leftWrist && leftElbow && leftWrist.visibility > 0.5) {
        const direction = {
          x: leftWrist.x - leftElbow.x,
          y: leftWrist.y - leftElbow.y
        };
        const racketX = leftWrist.x + direction.x * 0.5;
        const racketY = leftWrist.y + direction.y * 0.5;
        return {
          x: Math.max(0, Math.min(0.85, racketX - 0.06)),
          y: Math.max(0, Math.min(0.85, racketY - 0.08)),
          width: 0.12,
          height: 0.16,
          confidence: Math.min(0.65, leftWrist.visibility + 0.05) // Even lower for left hand
        };
      }
    }
    return null;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || video.paused || video.ended || !video.videoWidth) {
      return;
    }

    let racketDetection: RacketDetection | null = null;

    // Priority 1: YOLO racket detection (most accurate)
    if (yoloModelLoaded && !yoloError && !yoloUsingFallback && yoloRacketDetection) {
      console.log('[RacketDetection] Using YOLO racket detection');
      racketDetection = {
        x: yoloRacketDetection.x / video.videoWidth, // Normalize coordinates
        y: yoloRacketDetection.y / video.videoHeight,
        width: yoloRacketDetection.width / video.videoWidth,
        height: yoloRacketDetection.height / video.videoHeight,
        confidence: yoloRacketDetection.confidence
      };
    }
    // Priority 2: Pose-based estimation (good for tracking hand movement)
    else if (pose && pose.landmarks && pose.landmarks.length >= 17) {
      console.log('[RacketDetection] Using pose-based racket estimation');
      racketDetection = estimateRacketFromPose(pose);
    }
    // Priority 3: Pixel-based detection (last resort)
    else if (pixelRacketBox && pixelRacketBox.confidence > 0.6) {
      console.log('[RacketDetection] Using pixel-based racket detection');
      racketDetection = pixelRacketBox;
    }

    // Apply smoothing if we have a detection
    if (racketDetection && racketDetection.confidence > 0.3) {
      smoothingRef.current.push(racketDetection);
      if (smoothingRef.current.length > 3) {
        smoothingRef.current.shift();
      }
      
      // Use smoothing for consistency
      if (smoothingRef.current.length >= 2) {
        const avgX = smoothingRef.current.reduce((sum, r) => sum + r.x, 0) / smoothingRef.current.length;
        const avgY = smoothingRef.current.reduce((sum, r) => sum + r.y, 0) / smoothingRef.current.length;
        const avgWidth = smoothingRef.current.reduce((sum, r) => sum + r.width, 0) / smoothingRef.current.length;
        const avgHeight = smoothingRef.current.reduce((sum, r) => sum + r.height, 0) / smoothingRef.current.length;
        const avgConfidence = smoothingRef.current.reduce((sum, r) => sum + r.confidence, 0) / smoothingRef.current.length;
        
        const smoothedRacket = {
          x: avgX,
          y: avgY,
          width: avgWidth,
          height: avgHeight,
          confidence: avgConfidence
        };
        setRacketBox(smoothedRacket);
        return;
      } else {
        setRacketBox(racketDetection);
        return;
      }
    }

    // Clear detection if no racket found
    if (!racketDetection || racketDetection.confidence <= 0.3) {
      console.log('[RacketDetection] No racket detected, clearing state');
      if (smoothingRef.current.length > 0) {
        smoothingRef.current = [];
      }
      setRacketBox(null);
    }
    
  }, [yoloRacketDetection, yoloModelLoaded, yoloError, yoloUsingFallback, pose, pixelRacketBox, videoRef]);

  // Update loading state
  useEffect(() => {
    setIsLoading(yoloLoading || pixelLoading);
  }, [yoloLoading, pixelLoading]);

  return { 
    racketBox, 
    isLoading,
    usingYolo: yoloModelLoaded && !yoloError && !yoloUsingFallback,
    yoloError
  };
};
