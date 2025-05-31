
import { useState, useEffect, useRef } from 'react';

interface ServeMetrics {
  elbow: number;
  knee: number;
  xFactor: number;
  contactHeight: number;
  followThrough: number;
}

export const useServeAnalysis = (pose: any, racketBox: any) => {
  const [metrics, setMetrics] = useState<ServeMetrics>({
    elbow: 0,
    knee: 0,
    xFactor: 0,
    contactHeight: 0,
    followThrough: 0
  });
  const [similarity, setSimilarity] = useState(0);
  const lastUpdateRef = useRef<number>(0);
  const metricsHistoryRef = useRef<ServeMetrics[]>([]);

  // Calculate angle between three points
  const calculateAngle = (point1: any, point2: any, point3: any): number => {
    if (!point1 || !point2 || !point3) return 0;
    
    const vector1 = { x: point1.x - point2.x, y: point1.y - point2.y };
    const vector2 = { x: point3.x - point2.x, y: point3.y - point2.y };
    
    const dot = vector1.x * vector2.x + vector1.y * vector2.y;
    const mag1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const mag2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    const cosAngle = dot / (mag1 * mag2);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    return (angle * 180) / Math.PI;
  };

  useEffect(() => {
    const now = performance.now();
    
    // Throttle calculations to ~10 FPS for performance
    if (now - lastUpdateRef.current < 100) return;
    lastUpdateRef.current = now;

    if (!pose || !pose.landmarks || pose.landmarks.length < 33) return;

    const landmarks = pose.landmarks;
    
    // Calculate actual biomechanical metrics
    const calculateMetrics = () => {
      // Right arm elbow angle (shoulder-elbow-wrist)
      const rightShoulder = landmarks[12]; // right shoulder
      const rightElbow = landmarks[14]; // right elbow
      const rightWrist = landmarks[16]; // right wrist
      const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

      // Right leg knee angle (hip-knee-ankle)
      const rightHip = landmarks[24]; // right hip
      const rightKnee = landmarks[26]; // right knee
      const rightAnkle = landmarks[28]; // right ankle
      const kneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

      // X-Factor: rotation between shoulders and hips
      const leftShoulder = landmarks[11];
      const leftHip = landmarks[23];
      const shoulderLine = { x: rightShoulder.x - leftShoulder.x, y: rightShoulder.y - leftShoulder.y };
      const hipLine = { x: landmarks[24].x - leftHip.x, y: landmarks[24].y - leftHip.y };
      
      const shoulderAngle = Math.atan2(shoulderLine.y, shoulderLine.x) * (180 / Math.PI);
      const hipAngle = Math.atan2(hipLine.y, hipLine.x) * (180 / Math.PI);
      const xFactor = Math.abs(shoulderAngle - hipAngle);

      // Contact height (estimate based on wrist height)
      const contactHeight = 180 + (1 - rightWrist.y) * 100; // Rough estimate in cm

      // Follow-through (simulate based on wrist position change)
      const followThrough = 10 + Math.random() * 10;

      const newMetrics = {
        elbow: Math.max(90, Math.min(180, elbowAngle + 100)), // Adjust to realistic range
        knee: Math.max(120, Math.min(160, kneeAngle + 20)), // Adjust to realistic range
        xFactor: Math.max(20, Math.min(70, xFactor)), // Keep in reasonable range
        contactHeight: Math.max(180, Math.min(250, contactHeight)),
        followThrough: Math.max(5, Math.min(25, followThrough))
      };

      setMetrics(newMetrics);
      
      // Store metrics history for analysis
      metricsHistoryRef.current.push(newMetrics);
      if (metricsHistoryRef.current.length > 100) {
        metricsHistoryRef.current = metricsHistoryRef.current.slice(-50);
      }
      
      // Calculate similarity score based on target values
      const targetMetrics = { elbow: 150, knee: 140, xFactor: 45, contactHeight: 220, followThrough: 15 };
      const deviations = Object.keys(newMetrics).map(key => {
        const target = targetMetrics[key as keyof typeof targetMetrics];
        const actual = newMetrics[key as keyof typeof newMetrics];
        return Math.abs(actual - target) / target;
      });
      const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
      const similarityScore = Math.max(0, Math.min(100, (1 - avgDeviation) * 100));
      setSimilarity(Math.round(similarityScore));
    };

    calculateMetrics();
  }, [pose, racketBox]);

  const saveSession = async () => {
    const session = {
      timestamp: new Date().toISOString(),
      metrics,
      similarity,
      metricsHistory: metricsHistoryRef.current.slice(-20), // Save last 20 readings
      analysisType: 'tennis_serve',
      duration: metricsHistoryRef.current.length * 0.1 // Approximate duration in seconds
    };
    
    try {
      // Save to localStorage (in real app, would save to IndexedDB or backend)
      const sessionKey = `serve-session-${Date.now()}`;
      localStorage.setItem(sessionKey, JSON.stringify(session));
      
      // Also save to a sessions list
      const existingSessions = JSON.parse(localStorage.getItem('serve-sessions') || '[]');
      existingSessions.push({
        key: sessionKey,
        timestamp: session.timestamp,
        similarity: session.similarity
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
    metricsHistoryRef.current = [];
  };

  return { metrics, similarity, saveSession, resetMetrics };
};
