
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

        // Optimized settings for better detection
        await poseInstance.setOptions({
          modelComplexity: 1, // Balance between accuracy and speed
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.7, // Higher confidence threshold
          minTrackingConfidence: 0.5
        });

        poseInstance.onResults((results) => {
          if (!mounted || !results.poseLandmarks || results.poseLandmarks.length === 0) {
            console.log('No pose landmarks detected');
            return;
          }
          
          console.log('MediaPipe detected pose with', results.poseLandmarks.length, 'landmarks');
          
          // Validate landmarks have reasonable visibility
          const validLandmarks = results.poseLandmarks.filter(landmark => 
            landmark.visibility && landmark.visibility > 0.3
          );
          
          if (validLandmarks.length < 10) {
            console.log('Not enough visible landmarks:', validLandmarks.length);
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

      // Process at 15 FPS for better performance
      setTimeout(() => requestAnimationFrame(processVideo), 66);
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
