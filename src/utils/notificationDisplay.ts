export { formatNotificationBody } from '@/utils/adherenceNudges';

export function getNotificationTypeLabel(type: string): string | null {
  switch (type) {
    case 'wellness_reminder':
      return 'Wellness reminder';
    case 'match_reflection_reminder':
      return 'Reflection nudge';
    case 'pre_match_reminder':
      return 'Pre-match nudge';
    case 'reminder':
      return 'Journal reminder';
    case 'weekly_summary':
      return 'Weekly summary';
    case 'coach_note':
      return 'Coach note';
    case 'drill_prescription':
      return 'Drill prescription';
    default:
      return null;
  }
}
