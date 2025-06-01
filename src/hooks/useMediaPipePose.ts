
import { useEffect, useRef, useState } from 'react';

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

export const useMediaPipePose = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [pose, setPose] = useState<PoseResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const poseRef = useRef<any>(null);
  const processingRef = useRef<boolean>(false);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;
    
    const initializeMediaPipe = async () => {
      try {
        console.log('Starting MediaPipe initialization...');
        
        // Import MediaPipe dynamically
        const { Pose } = await import('@mediapipe/pose');
        
        if (!mounted) return;
        
        const poseInstance = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        await poseInstance.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        poseInstance.onResults((results) => {
          if (!mounted) return;
          
          console.log('Pose results received:', results.poseLandmarks?.length || 0, 'landmarks');
          
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
          } else {
            setPose(null);
          }
        });

        await poseInstance.initialize();
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

      // Process every 3rd frame for better performance
      frameRef.current++;
      if (frameRef.current % 3 !== 0) {
        requestAnimationFrame(processVideo);
        return;
      }

      processingRef.current = true;

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
