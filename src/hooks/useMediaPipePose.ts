
import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

export const useMediaPipePose = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [pose, setPose] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const initializePoseLandmarker = async () => {
      try {
        console.log('Initializing MediaPipe Pose Landmarker...');
        
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        const landmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        
        setPoseLandmarker(landmarker);
        setIsLoading(false);
        console.log('MediaPipe Pose Landmarker initialized successfully');
      } catch (error) {
        console.error('Failed to initialize MediaPipe Pose Landmarker:', error);
        setIsLoading(false);
      }
    };

    initializePoseLandmarker();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!poseLandmarker || !videoRef.current) return;

    const detectPose = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended) {
        animationFrameRef.current = requestAnimationFrame(detectPose);
        return;
      }

      try {
        const startTimeMs = performance.now();
        const results = poseLandmarker.detectForVideo(video, startTimeMs);
        
        if (results.landmarks && results.landmarks.length > 0) {
          setPose({
            landmarks: results.landmarks[0],
            worldLandmarks: results.worldLandmarks?.[0] || [],
            segmentationMask: null
          });
        }
      } catch (error) {
        console.error('Pose detection error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detectPose);
    };

    if (videoRef.current) {
      detectPose();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [poseLandmarker, videoRef]);

  return { pose, isLoading, error: !poseLandmarker && !isLoading };
};
