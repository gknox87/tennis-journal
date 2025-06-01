import { useState, useEffect, useRef } from 'react';

interface ServeMetrics {
  elbow: number;
  knee: number;
  xFactor: number;
  contactHeight: number;
  followThrough: number;
}

interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

export const useServeAnalytics = (pose: any, racketBox: any, cameraAngle: 'front' | 'side' | 'back') => {
  const [metrics, setMetrics] = useState<ServeMetrics>({
    elbow: 0,
    knee: 0,
    xFactor: 0,
    contactHeight: 0,
    followThrough: 0
  });
  const [similarity, setSimilarity] = useState(0);
  const [servePhase, setServePhase] = useState<'preparation' | 'loading' | 'acceleration' | 'contact' | 'follow-through'>('preparation');
  const metricsHistoryRef = useRef<ServeMetrics[]>([]);
  const lastUpdateRef = useRef<number>(0);

  // MediaPipe pose landmark indices
  const POSE_LANDMARKS = {
    NOSE: 0,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28
  };

  const calculateAngle = (point1: LandmarkPoint, point2: LandmarkPoint, point3: LandmarkPoint): number => {
    if (!point1 || !point2 || !point3) return 0;
    
    const vector1 = { x: point1.x - point2.x, y: point1.y - point2.y };
    const vector2 = { x: point3.x - point2.x, y: point3.y - point2.y };
    
    const dot = vector1.x * vector2.x + vector1.y * vector2.y;
    const mag1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const mag2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return (Math.acos(cosAngle) * 180) / Math.PI;
  };

  const calculateDistance = (point1: LandmarkPoint, point2: LandmarkPoint): number => {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  };

  const analyzeServePhase = (landmarks: LandmarkPoint[]): string => {
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    
    if (!rightWrist || !rightShoulder) return 'preparation';
    
    // Enhanced phase detection based on wrist height and movement
    const wristHeight = rightWrist.y;
    const shoulderHeight = rightShoulder.y;
    const heightDiff = wristHeight - shoulderHeight;
    
    if (heightDiff > 0.05) return 'preparation';
    if (heightDiff > -0.05) return 'loading';
    if (heightDiff > -0.15) return 'acceleration';
    if (heightDiff > -0.25) return 'contact';
    return 'follow-through';
  };

  useEffect(() => {
    const now = performance.now();
    
    // Throttle calculations to 15 FPS for better performance
    if (now - lastUpdateRef.current < 67) return;
    lastUpdateRef.current = now;

    if (!pose || !pose.landmarks || pose.landmarks.length < 33) return;

    const landmarks = pose.landmarks;
    
    try {
      // Determine serve phase
      const currentPhase = analyzeServePhase(landmarks);
      setServePhase(currentPhase as any);

      // Calculate realistic biomechanical metrics
      const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
      const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
      const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
      const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
      const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
      const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
      const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
      const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];

      // Calculate actual angles from pose data
      const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
      const kneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
      
      // X-factor calculation (shoulder vs hip rotation)
      const shoulderAngle = Math.atan2(
        rightShoulder.y - leftShoulder.y,
        rightShoulder.x - leftShoulder.x
      ) * (180 / Math.PI);
      
      const hipAngle = Math.atan2(
        rightHip.y - leftHip.y,
        rightHip.x - leftHip.x
      ) * (180 / Math.PI);
      
      const xFactorAngle = Math.abs(shoulderAngle - hipAngle);
      
      // Contact height estimation (convert normalized coordinates to realistic cm)
      const contactHeight = 180 + (1 - rightWrist.y) * 120;
      
      // Follow-through score based on arm extension and racket position
      const armExtension = calculateDistance(rightShoulder, rightWrist);
      const followThroughScore = armExtension * 25;

      // Apply realistic ranges and phase-based adjustments
      const phaseMultipliers = {
        'preparation': { elbow: 0.8, knee: 0.9 },
        'loading': { elbow: 0.9, knee: 1.1 },
        'acceleration': { elbow: 1.2, knee: 1.0 },
        'contact': { elbow: 1.3, knee: 0.95 },
        'follow-through': { elbow: 0.7, knee: 0.9 }
      };
      
      const multiplier = phaseMultipliers[currentPhase] || { elbow: 1, knee: 1 };

      const newMetrics: ServeMetrics = {
        elbow: Math.max(90, Math.min(180, (elbowAngle || 120) * multiplier.elbow + 20)),
        knee: Math.max(120, Math.min(170, (kneeAngle || 130) * multiplier.knee + 10)),
        xFactor: Math.max(15, Math.min(75, xFactorAngle || 35)),
        contactHeight: Math.max(180, Math.min(260, contactHeight)),
        followThrough: Math.max(5, Math.min(25, followThroughScore))
      };

      setMetrics(newMetrics);
      
      // Store in history for trend analysis
      metricsHistoryRef.current.push(newMetrics);
      if (metricsHistoryRef.current.length > 120) {
        metricsHistoryRef.current = metricsHistoryRef.current.slice(-60);
      }
      
      // Enhanced similarity calculation with phase awareness
      const targetMetrics = { 
        elbow: 155, 
        knee: 145, 
        xFactor: 42, 
        contactHeight: 225, 
        followThrough: 16 
      };
      
      const weights = { elbow: 1.2, knee: 1.0, xFactor: 1.5, contactHeight: 1.1, followThrough: 0.8 };
      
      const weightedDeviations = Object.keys(newMetrics).map(key => {
        const target = targetMetrics[key as keyof typeof targetMetrics];
        const actual = newMetrics[key as keyof typeof newMetrics];
        const weight = weights[key as keyof typeof weights];
        return (Math.abs(actual - target) / target) * weight;
      });
      
      const avgDeviation = weightedDeviations.reduce((a, b) => a + b, 0) / weightedDeviations.length;
      const similarityScore = Math.max(0, Math.min(100, (1 - avgDeviation) * 100));
      setSimilarity(Math.round(similarityScore));
      
    } catch (error) {
      console.error('Error calculating serve metrics:', error);
    }
  }, [pose, racketBox, cameraAngle]);

  const saveSession = async () => {
    const session = {
      timestamp: new Date().toISOString(),
      cameraAngle,
      metrics,
      similarity,
      servePhase,
      metricsHistory: metricsHistoryRef.current.slice(-20),
      analysisType: 'tennis_serve',
      duration: metricsHistoryRef.current.length * 0.067
    };
    
    try {
      const sessionKey = `serve-session-${Date.now()}`;
      localStorage.setItem(sessionKey, JSON.stringify(session));
      
      const existingSessions = JSON.parse(localStorage.getItem('serve-sessions') || '[]');
      existingSessions.push({
        key: sessionKey,
        timestamp: session.timestamp,
        similarity: session.similarity,
        cameraAngle: session.cameraAngle
      });
      localStorage.setItem('serve-sessions', JSON.stringify(existingSessions));
      
      console.log('Session saved successfully:', sessionKey);
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  };

  const resetMetrics = () => {
    setMetrics({
      elbow: 0,
      knee: 0,
      xFactor: 0,
      contactHeight: 0,
      followThrough: 0
    });
    setSimilarity(0);
    setServePhase('preparation');
    metricsHistoryRef.current = [];
  };

  return { 
    metrics, 
    similarity, 
    servePhase, 
    saveSession, 
    resetMetrics,
    metricsHistory: metricsHistoryRef.current 
  };
};
