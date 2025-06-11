
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
  const lastProcessTimeRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;
    
    const initializeMediaPipe = async () => {
      try {
        console.log('Initializing MediaPipe Pose...');
        
        // Try to import MediaPipe
        const { Pose } = await import('@mediapipe/pose');
        
        if (!mounted) return;
        
        const poseInstance = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        // Optimized settings for real-time performance
        await poseInstance.setOptions({
          modelComplexity: 0, // Use fastest model (0 = lite, 1 = full, 2 = heavy)
          smoothLandmarks: true,
          enableSegmentation: false, // Disable segmentation for better performance
          smoothSegmentation: false,
          minDetectionConfidence: 0.6, // Slightly lower for better detection rate
          minTrackingConfidence: 0.4   // Lower for better tracking consistency
        });

        poseInstance.onResults((results) => {
          if (!mounted || !results.poseLandmarks || results.poseLandmarks.length === 0) {
            console.log('No pose landmarks detected');
            return;
          }
          
          console.log('MediaPipe detected pose with', results.poseLandmarks.length, 'landmarks');
          
          // Validate landmarks have reasonable visibility
          const validLandmarks = results.poseLandmarks.filter(landmark => 
            landmark.visibility && landmark.visibility > 0.2 // Lower threshold for better detection
          );
          
          if (validLandmarks.length < 8) { // Reduced minimum for better responsiveness
            return;
          }

          const landmarks: PoseLandmark[] = results.poseLandmarks.map((landmark) => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z || 0,
            visibility: landmark.visibility || 0.5
          }));

          const worldLandmarks: PoseLandmark[] = results.poseWorldLandmarks?.map((landmark) => ({
            x: landmark.x,
            y: landmark.y,
            z: landmark.z || 0,
            visibility: landmark.visibility || 0.5
          })) || landmarks;

          setPose({ landmarks, worldLandmarks });
          console.log('Pose updated successfully');
        });

        await poseInstance.initialize();
        poseRef.current = poseInstance;
        setIsLoading(false);
        setError(null);
        console.log('MediaPipe Pose initialized successfully');

      } catch (err) {
        console.error('MediaPipe initialization failed:', err);
        setError('MediaPipe initialization failed');
        setIsLoading(false);
      }
    };

    const processVideo = async () => {
      if (!mounted || processingRef.current) return;
      
      const video = videoRef.current;
      const poseInstance = poseRef.current;
      
      if (!video || !poseInstance || video.paused || video.ended || !video.videoWidth) {
        // Use timeout instead of requestAnimationFrame for better control
        setTimeout(() => processVideo(), 50); // 20 FPS check rate
        return;
      }

      // Throttle processing to 10 FPS for better performance
      const now = performance.now();
      if (now - lastProcessTimeRef.current < 100) {
        setTimeout(() => processVideo(), 50);
        return;
      }
      lastProcessTimeRef.current = now;

      processingRef.current = true;

      try {
        await poseInstance.send({ image: video });
      } catch (err) {
        console.error('Pose processing error:', err);
      } finally {
        processingRef.current = false;
      }

      // Continue processing with controlled rate
      setTimeout(() => processVideo(), 100); // 10 FPS processing rate
    };

    initializeMediaPipe().then(() => {
      if (mounted && poseRef.current) {
        processVideo();
      }
    });

    return () => {
      mounted = false;
      if (poseRef.current) {
        try {
          poseRef.current.close();
        } catch (e) {
          console.log('Error closing pose instance:', e);
        }
      }
    };
  }, [videoRef]);

  return { pose, isLoading, error: !!error };
};
