
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
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        console.log('Initializing MediaPipe Pose...');
        
        // Create MediaPipe Pose instance
        const poseInstance = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        // Configure pose detection
        poseInstance.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        // Set up results callback
        poseInstance.onResults((results: Results) => {
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

            console.log('MediaPipe pose detected:', landmarks.length, 'landmarks');
          } else {
            setPose(null);
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
        
        // Fallback to simulation mode
        console.log('Falling back to simulation mode');
        startSimulationMode();
      }
    };

    const startSimulationMode = () => {
      console.log('Starting pose simulation mode');
      const simulate = () => {
        const video = videoRef.current;
        if (video && !video.paused && !video.ended && video.videoWidth > 0) {
          // Generate realistic pose simulation
          const time = performance.now() * 0.001;
          const landmarks = generateSimulatedPose(time);
          setPose({ landmarks, worldLandmarks: landmarks });
        }
        animationFrameRef.current = requestAnimationFrame(simulate);
      };
      simulate();
    };

    const processVideo = async () => {
      const video = videoRef.current;
      const poseInstance = poseRef.current;
      
      if (!video || !poseInstance || video.paused || video.ended) {
        animationFrameRef.current = requestAnimationFrame(processVideo);
        return;
      }

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        try {
          await poseInstance.send({ image: video });
        } catch (err) {
          console.error('Pose processing error:', err);
        }
      }

      animationFrameRef.current = requestAnimationFrame(processVideo);
    };

    initializeMediaPipe();

    // Start video processing
    const startProcessing = () => {
      if (videoRef.current) {
        processVideo();
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadeddata', startProcessing);
      if (video.readyState >= 2) {
        startProcessing();
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (video) {
        video.removeEventListener('loadeddata', startProcessing);
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [videoRef]);

  const generateSimulatedPose = (time: number): PoseLandmark[] => {
    // Realistic tennis serve pose simulation
    const centerX = 0.5;
    const centerY = 0.5;
    const armMotion = Math.sin(time * 2) * 0.1;
    const legMotion = Math.cos(time * 1.5) * 0.05;
    
    return [
      // Head and face (0-10)
      { x: centerX, y: centerY - 0.25, z: 0, visibility: 0.95 },
      { x: centerX - 0.02, y: centerY - 0.27, z: 0, visibility: 0.9 },
      { x: centerX - 0.03, y: centerY - 0.27, z: 0, visibility: 0.9 },
      { x: centerX - 0.04, y: centerY - 0.27, z: 0, visibility: 0.85 },
      { x: centerX + 0.02, y: centerY - 0.27, z: 0, visibility: 0.9 },
      { x: centerX + 0.03, y: centerY - 0.27, z: 0, visibility: 0.9 },
      { x: centerX + 0.04, y: centerY - 0.27, z: 0, visibility: 0.85 },
      { x: centerX - 0.05, y: centerY - 0.25, z: 0, visibility: 0.8 },
      { x: centerX + 0.05, y: centerY - 0.25, z: 0, visibility: 0.8 },
      { x: centerX - 0.015, y: centerY - 0.23, z: 0, visibility: 0.85 },
      { x: centerX + 0.015, y: centerY - 0.23, z: 0, visibility: 0.85 },
      
      // Upper body (11-22)
      { x: centerX - 0.12, y: centerY - 0.15, z: 0, visibility: 0.98 }, // Left shoulder
      { x: centerX + 0.12, y: centerY - 0.15, z: 0, visibility: 0.98 }, // Right shoulder
      { x: centerX - 0.18, y: centerY + armMotion, z: 0, visibility: 0.95 }, // Left elbow
      { x: centerX + 0.25 + armMotion, y: centerY - 0.1, z: 0, visibility: 0.95 }, // Right elbow (serving arm)
      { x: centerX - 0.22, y: centerY + 0.1 + armMotion, z: 0, visibility: 0.9 }, // Left wrist
      { x: centerX + 0.35 + armMotion * 2, y: centerY - 0.15, z: 0, visibility: 0.9 }, // Right wrist (racket)
      
      // Hands (17-22)
      { x: centerX - 0.23, y: centerY + 0.12 + armMotion, z: 0, visibility: 0.8 },
      { x: centerX - 0.22, y: centerY + 0.11 + armMotion, z: 0, visibility: 0.8 },
      { x: centerX - 0.24, y: centerY + 0.1 + armMotion, z: 0, visibility: 0.8 },
      { x: centerX + 0.36 + armMotion * 2, y: centerY - 0.16, z: 0, visibility: 0.8 },
      { x: centerX + 0.35 + armMotion * 2, y: centerY - 0.17, z: 0, visibility: 0.8 },
      { x: centerX + 0.37 + armMotion * 2, y: centerY - 0.14, z: 0, visibility: 0.8 },
      
      // Lower body (23-32)
      { x: centerX - 0.08, y: centerY + 0.1, z: 0, visibility: 0.95 }, // Left hip
      { x: centerX + 0.08, y: centerY + 0.1, z: 0, visibility: 0.95 }, // Right hip
      { x: centerX - 0.1, y: centerY + 0.25 + legMotion, z: 0, visibility: 0.9 }, // Left knee
      { x: centerX + 0.1, y: centerY + 0.25 - legMotion, z: 0, visibility: 0.9 }, // Right knee
      { x: centerX - 0.12, y: centerY + 0.4 + legMotion, z: 0, visibility: 0.85 }, // Left ankle
      { x: centerX + 0.12, y: centerY + 0.4 - legMotion, z: 0, visibility: 0.85 }, // Right ankle
      { x: centerX - 0.13, y: centerY + 0.42 + legMotion, z: 0, visibility: 0.8 }, // Left foot
      { x: centerX + 0.13, y: centerY + 0.42 - legMotion, z: 0, visibility: 0.8 }, // Right foot
      { x: centerX - 0.11, y: centerY + 0.43 + legMotion, z: 0, visibility: 0.8 },
      { x: centerX + 0.11, y: centerY + 0.43 - legMotion, z: 0, visibility: 0.8 }
    ];
  };

  return { pose, isLoading, error: !!error };
};
