import type { PreMatchState } from './mental';

export type SessionType = 'training' | 'recovery' | 'match' | 'mental_skills';

export interface ScheduledEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  session_type: SessionType;
  notes?: string | null;
  sport_id?: string | null;
  pre_match_state?: PreMatchState | null;
}

export interface SessionTypeConfig {
  value: SessionType;
  label: string;
  description: string;
  titlePlaceholder: string;
  notesPlaceholder: string;
  color: {
    mobile: string;
    desktop: string;
    dashboard: {
      bg: string;
      icon: string;
      border: string;
    };
  };
}

export const SESSION_TYPES: SessionTypeConfig[] = [
  {
    value: 'training',
    label: 'Training',
    description: 'On-court or gym physical practice',
    titlePlaceholder: 'e.g. Technical drills, conditioning',
    notesPlaceholder: 'Focus areas, intensity, equipment needed...',
    color: {
      mobile: 'bg-blue-500',
      desktop: '#3b82f6',
      dashboard: {
        bg: 'from-blue-100 to-blue-50',
        icon: 'text-blue-600',
        border: 'border-blue-200',
      },
    },
  },
  {
    value: 'match',
    label: 'Match',
    description: 'Competition or practice match',
    titlePlaceholder: 'e.g. League match vs. opponent',
    notesPlaceholder: 'Opponent, venue, tactical goals...',
    color: {
      mobile: 'bg-green-500',
      desktop: '#22c55e',
      dashboard: {
        bg: 'from-green-100 to-emerald-50',
        icon: 'text-green-600',
        border: 'border-green-200',
      },
    },
  },
  {
    value: 'mental_skills',
    label: 'Mental skills',
    description: 'Pre-match routine, visualisation, focus work',
    titlePlaceholder: 'e.g. Pre-match visualisation',
    notesPlaceholder: 'Breathing routine, key points to focus on...',
    color: {
      mobile: 'bg-purple-500',
      desktop: '#a855f7',
      dashboard: {
        bg: 'from-purple-100 to-violet-50',
        icon: 'text-purple-600',
        border: 'border-purple-200',
      },
    },
  },
  {
    value: 'recovery',
    label: 'Recovery',
    description: 'Rest, active recovery, post-match decompression',
    titlePlaceholder: 'e.g. Post-match cool-down',
    notesPlaceholder: 'Cool-down, stretch, debrief, sleep plan...',
    color: {
      mobile: 'bg-orange-500',
      desktop: '#f97316',
      dashboard: {
        bg: 'from-yellow-100 to-orange-50',
        icon: 'text-orange-600',
        border: 'border-orange-200',
      },
    },
  },
];

const sessionTypeMap = new Map(SESSION_TYPES.map((t) => [t.value, t]));

export function getSessionTypeConfig(type: SessionType): SessionTypeConfig {
  return sessionTypeMap.get(type) ?? SESSION_TYPES[0];
}

export function getSessionTypeLabel(type: SessionType): string {
  return getSessionTypeConfig(type).label;
}

export function getSessionTypeColor(
  type: SessionType,
  surface: 'mobile' | 'desktop'
): string {
  const config = getSessionTypeConfig(type);
  return surface === 'mobile' ? config.color.mobile : config.color.desktop;
}

export function getSessionTypeDashboardColors(type: SessionType) {
  return getSessionTypeConfig(type).color.dashboard;
}
