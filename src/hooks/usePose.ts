
import { useState, useEffect, useRef } from 'react';

export const usePose = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [pose, setPose] = useState<any>(null);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const mockPoseDetection = () => {
      const now = performance.now();
      
      // Throttle updates to ~30 FPS
      if (now - lastUpdateRef.current < 33) {
        animationFrameRef.current = requestAnimationFrame(mockPoseDetection);
        return;
      }
      
      lastUpdateRef.current = now;

      if (!videoRef.current) {
        animationFrameRef.current = requestAnimationFrame(mockPoseDetection);
        return;
      }

      const video = videoRef.current;
      
      // Only update if video is playing or if it's a live stream
      if (video.paused && !video.srcObject) {
        animationFrameRef.current = requestAnimationFrame(mockPoseDetection);
        return;
      }

      // Simulate more realistic pose landmarks with slight variations
      const time = now * 0.001; // Convert to seconds
      const variation = Math.sin(time) * 0.05; // Small variation for realism
      
      const mockPose = {
        landmarks: [
          // Head and face landmarks (0-10)
          { x: 0.5 + variation * 0.1, y: 0.15 + variation * 0.05, z: 0 }, // nose
          { x: 0.48, y: 0.12, z: 0 }, // left eye inner
          { x: 0.52, y: 0.12, z: 0 }, // right eye inner
          { x: 0.46, y: 0.12, z: 0 }, // left eye
          { x: 0.54, y: 0.12, z: 0 }, // right eye
          { x: 0.44, y: 0.12, z: 0 }, // left eye outer
          { x: 0.56, y: 0.12, z: 0 }, // right eye outer
          { x: 0.47, y: 0.16, z: 0 }, // left ear
          { x: 0.53, y: 0.16, z: 0 }, // right ear
          { x: 0.48, y: 0.18, z: 0 }, // mouth left
          { x: 0.52, y: 0.18, z: 0 }, // mouth right
          
          // Upper body landmarks (11-16)
          { x: 0.42 + variation * 0.2, y: 0.35 + variation * 0.1, z: 0 }, // left shoulder
          { x: 0.58 - variation * 0.2, y: 0.35 + variation * 0.1, z: 0 }, // right shoulder
          { x: 0.38 + variation * 0.3, y: 0.5 + variation * 0.15, z: 0 }, // left elbow
          { x: 0.62 - variation * 0.3, y: 0.5 + variation * 0.15, z: 0 }, // right elbow
          { x: 0.35 + variation * 0.4, y: 0.65 + variation * 0.2, z: 0 }, // left wrist
          { x: 0.65 - variation * 0.4, y: 0.65 + variation * 0.2, z: 0 }, // right wrist
          
          // Lower body landmarks (17-32)
          { x: 0.46, y: 0.55, z: 0 }, // left pinky
          { x: 0.54, y: 0.55, z: 0 }, // right pinky
          { x: 0.45, y: 0.54, z: 0 }, // left index
          { x: 0.55, y: 0.54, z: 0 }, // right index
          { x: 0.44, y: 0.56, z: 0 }, // left thumb
          { x: 0.56, y: 0.56, z: 0 }, // right thumb
          { x: 0.45 + variation * 0.1, y: 0.7, z: 0 }, // left hip
          { x: 0.55 - variation * 0.1, y: 0.7, z: 0 }, // right hip
          { x: 0.44 + variation * 0.15, y: 0.85, z: 0 }, // left knee
          { x: 0.56 - variation * 0.15, y: 0.85, z: 0 }, // right knee
          { x: 0.43 + variation * 0.1, y: 0.95, z: 0 }, // left ankle
          { x: 0.57 - variation * 0.1, y: 0.95, z: 0 }, // right ankle
          { x: 0.42, y: 0.98, z: 0 }, // left heel
          { x: 0.58, y: 0.98, z: 0 }, // right heel
          { x: 0.41, y: 0.96, z: 0 }, // left foot index
          { x: 0.59, y: 0.96, z: 0 }, // right foot index
        ],
        worldLandmarks: [], // 3D coordinates would go here
        segmentationMask: null
      };

      setPose(mockPose);
      animationFrameRef.current = requestAnimationFrame(mockPoseDetection);
    };

    if (videoRef.current) {
      mockPoseDetection();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoRef]);

  return { pose };
};
