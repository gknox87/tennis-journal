
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
  visibility?: number;
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
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
    
    if (!rightWrist || !rightShoulder || !rightElbow) return 'preparation';
    
    // Enhanced phase detection using multiple joint positions
    const wristHeight = rightWrist.y;
    const shoulderHeight = rightShoulder.y;
    const elbowHeight = rightElbow.y;
    
    const heightDiff = wristHeight - shoulderHeight;
    const elbowPosition = elbowHeight - shoulderHeight;
    
    // More sophisticated phase detection
    if (heightDiff > 0.1) return 'preparation';
    if (heightDiff > 0 && elbowPosition < 0.05) return 'loading';
    if (heightDiff > -0.1 && elbowPosition < -0.05) return 'acceleration';
    if (heightDiff > -0.2) return 'contact';
    return 'follow-through';
  };

  useEffect(() => {
    const now = performance.now();
    
    // Update at 20 FPS for smoother real-time analysis
    if (now - lastUpdateRef.current < 50) return;
    lastUpdateRef.current = now;

    if (!pose || !pose.landmarks || pose.landmarks.length < 33) {
      console.log('Insufficient pose data for analysis');
      return;
    }

    const landmarks = pose.landmarks;
    
    try {
      // Determine serve phase
      const currentPhase = analyzeServePhase(landmarks);
      setServePhase(currentPhase as any);

      // Get landmark points with validation
      const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
      const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
      const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
      const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
      const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
      const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
      const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
      const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];

      // Validate landmark visibility
      const isValidLandmark = (landmark: any) => 
        landmark && (!landmark.visibility || landmark.visibility > 0.5);

      if (!isValidLandmark(rightShoulder) || !isValidLandmark(rightElbow) || !isValidLandmark(rightWrist)) {
        console.log('Key arm landmarks not visible enough for analysis');
        return;
      }

      // Calculate realistic biomechanical metrics
      const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
      const kneeAngle = isValidLandmark(rightKnee) && isValidLandmark(rightHip) && isValidLandmark(rightAnkle) ?
        calculateAngle(rightHip, rightKnee, rightAnkle) : 140;
      
      // Enhanced X-factor calculation
      let xFactorAngle = 35; // Default value
      if (isValidLandmark(leftShoulder) && isValidLandmark(leftHip) && isValidLandmark(rightHip)) {
        const shoulderAngle = Math.atan2(
          rightShoulder.y - leftShoulder.y,
          rightShoulder.x - leftShoulder.x
        ) * (180 / Math.PI);
        
        const hipAngle = Math.atan2(
          rightHip.y - leftHip.y,
          rightHip.x - leftHip.x
        ) * (180 / Math.PI);
        
        xFactorAngle = Math.abs(shoulderAngle - hipAngle);
      }
      
      // Contact height estimation with camera angle adjustment
      let contactHeight = 180 + (1 - rightWrist.y) * 120;
      if (cameraAngle === 'front') {
        contactHeight *= 0.95; // Slightly lower estimate from front view
      } else if (cameraAngle === 'back') {
        contactHeight *= 1.05; // Slightly higher estimate from back view
      }
      
      // Follow-through score with racket integration
      let followThroughScore = 10;
      if (racketBox && racketBox.confidence > 0.5) {
        const armExtension = calculateDistance(rightShoulder, rightWrist);
        const racketPosition = { x: racketBox.x + racketBox.width/2, y: racketBox.y + racketBox.height/2 };
        const racketDistance = calculateDistance(rightWrist, racketPosition);
        followThroughScore = (armExtension * 20) + (racketDistance * 15);
      }

      // Apply phase-based adjustments for realistic metrics
      const phaseAdjustments = {
        'preparation': { elbow: 0.85, knee: 0.9, xFactor: 0.8 },
        'loading': { elbow: 0.9, knee: 1.15, xFactor: 1.2 },
        'acceleration': { elbow: 1.25, knee: 1.0, xFactor: 1.3 },
        'contact': { elbow: 1.4, knee: 0.9, xFactor: 1.1 },
        'follow-through': { elbow: 0.75, knee: 0.85, xFactor: 0.9 }
      };
      
      const adjustment = phaseAdjustments[currentPhase] || { elbow: 1, knee: 1, xFactor: 1 };

      const newMetrics: ServeMetrics = {
        elbow: Math.max(90, Math.min(180, (elbowAngle || 120) * adjustment.elbow + 25)),
        knee: Math.max(120, Math.min(170, (kneeAngle || 130) * adjustment.knee + 15)),
        xFactor: Math.max(15, Math.min(75, xFactorAngle * adjustment.xFactor)),
        contactHeight: Math.max(180, Math.min(260, contactHeight)),
        followThrough: Math.max(5, Math.min(25, followThroughScore))
      };

      console.log('Updated metrics:', newMetrics, 'Phase:', currentPhase);
      setMetrics(newMetrics);
      
      // Store in history for trend analysis
      metricsHistoryRef.current.push(newMetrics);
      if (metricsHistoryRef.current.length > 100) {
        metricsHistoryRef.current = metricsHistoryRef.current.slice(-50);
      }
      
      // Enhanced similarity calculation with phase and camera angle awareness
      const targetMetrics = { 
        elbow: 150, 
        knee: 140, 
        xFactor: 45, 
        contactHeight: 220, 
        followThrough: 15 
      };
      
      // Calculate weighted deviations
      const weights = { elbow: 1.2, knee: 1.0, xFactor: 1.3, contactHeight: 1.1, followThrough: 0.8 };
      const deviations = Object.keys(newMetrics).map(key => {
        const target = targetMetrics[key as keyof typeof targetMetrics];
        const actual = newMetrics[key as keyof typeof newMetrics];
        const weight = weights[key as keyof typeof weights];
        return (Math.abs(actual - target) / target) * weight;
      });
      
      const weightedAvgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
      let similarityScore = Math.max(0, Math.min(100, (1 - weightedAvgDeviation) * 100));
      
      // Phase bonus - contact phase gets higher similarity if metrics are good
      if (currentPhase === 'contact' && similarityScore > 70) {
        similarityScore += 5;
      }
      
      setSimilarity(Math.round(similarityScore));
      
    } catch (error) {
      console.error('Serve analytics calculation error:', error);
    }
  }, [pose, racketBox, cameraAngle]);

  const saveSession = async () => {
    const session = {
      timestamp: new Date().toISOString(),
      metrics,
      similarity,
      servePhase,
      metricsHistory: metricsHistoryRef.current.slice(-30),
      analysisType: 'tennis_serve',
      cameraAngle,
      duration: metricsHistoryRef.current.length * 0.05
    };
    
    try {
      const sessionKey = `serve-session-${Date.now()}`;
      localStorage.setItem(sessionKey, JSON.stringify(session));
      
      const existingSessions = JSON.parse(localStorage.getItem('serve-sessions') || '[]');
      existingSessions.push({
        key: sessionKey,
        timestamp: session.timestamp,
        similarity: session.similarity,
        phase: session.servePhase
      });
      localStorage.setItem('serve-sessions', JSON.stringify(existingSessions));
      
      console.log('Enhanced session saved:', sessionKey);
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
    console.log('Metrics reset for new analysis');
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
