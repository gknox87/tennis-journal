
import { useEffect, useRef, useState } from 'react';
import { Pose, Results } from '@mediapipe/pose';

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface PoseResults {
  landmarks: PoseLandmark[];
  worldLandmarks: PoseLandmark[];
}

export const useMediaPipePose = (videoRef: React.RefObject<HTMLVideoElement>, playerBounds?: any) => {
  const [pose, setPose] = useState<PoseResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const poseRef = useRef<Pose | null>(null);
  const processingRef = useRef<boolean>(false);
  const lastProcessTimeRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;
    
    const initializeMediaPipe = async () => {
      try {
        console.log('Initializing stable MediaPipe Pose...');
        
        const poseInstance = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        poseInstance.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.3,
          minTrackingConfidence: 0.3
        });

        poseInstance.onResults((results: Results) => {
          if (!mounted) return;
          
          if (results.poseLandmarks && results.poseLandmarks.length > 0) {
            const landmarks: PoseLandmark[] = results.poseLandmarks.map((landmark) => ({
              x: landmark.x,
              y: landmark.y,
              z: landmark.z || 0,
              visibility: landmark.visibility || 1
            }));

            setPose({
              landmarks,
              worldLandmarks: results.poseWorldLandmarks?.map((landmark) => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z || 0,
                visibility: landmark.visibility || 1
              })) || landmarks
            });
          }
        });

        poseRef.current = poseInstance;
        setIsLoading(false);
        setError(null);
        console.log('MediaPipe Pose initialized successfully');

      } catch (err) {
        console.error('MediaPipe initialization error:', err);
        setError('Failed to initialize MediaPipe');
        setIsLoading(false);
      }
    };

    const processVideo = async () => {
      if (!mounted || processingRef.current) return;
      
      const video = videoRef.current;
      const poseInstance = poseRef.current;
      
      if (!video || !poseInstance || video.paused || video.ended || !video.videoWidth) {
        requestAnimationFrame(processVideo);
        return;
      }

      const now = performance.now();
      if (now - lastProcessTimeRef.current < 100) { // 10 FPS for stability
        requestAnimationFrame(processVideo);
        return;
      }

      processingRef.current = true;
      lastProcessTimeRef.current = now;

      try {
        await poseInstance.send({ image: video });
      } catch (err) {
        console.error('Pose processing error:', err);
      } finally {
        processingRef.current = false;
      }

      requestAnimationFrame(processVideo);
    };

    initializeMediaPipe().then(() => {
      if (mounted) {
        processVideo();
      }
    });

    return () => {
      mounted = false;
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [videoRef]);

  return { pose, isLoading, error: !!error };
};
