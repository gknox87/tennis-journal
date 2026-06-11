import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TimeBasedReminder {
  enabled: boolean;
  time: string;
  days: string[];
}

export interface EventBasedReminder {
  afterMatch: boolean;
  afterTraining: boolean;
  weeklySummary: boolean;
}

export interface ReminderPreferences {
  reminder_enabled: boolean;
  reminder_time: string;
  reminder_days: string[];
  wellness_reminder_enabled: boolean;
  wellness_reminder_time: string;
  wellness_reminder_days: string[];
  after_match_reminder: boolean;
  after_training_reminder: boolean;
  pre_match_reminder: boolean;
  weekly_summary_enabled: boolean;
  location_tracking_enabled: boolean;
  smart_nudge_enabled: boolean;
  smart_nudge_threshold_days: number;
}

export interface UseSmartNotificationsReturn {
  preferences: ReminderPreferences | null;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (prefs: Partial<ReminderPreferences>) => Promise<void>;
  getReminderPreferences: () => Promise<ReminderPreferences | null>;
  refreshPreferences: () => Promise<void>;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

export const defaultReminderPreferences: ReminderPreferences = {
  reminder_enabled: true,
  reminder_time: '20:00',
  reminder_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
  wellness_reminder_enabled: true,
  wellness_reminder_time: '08:00',
  wellness_reminder_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  after_match_reminder: true,
  after_training_reminder: true,
  pre_match_reminder: true,
  weekly_summary_enabled: true,
  location_tracking_enabled: false,
  smart_nudge_enabled: true,
  smart_nudge_threshold_days: 3,
};

export function useSmartNotifications(): UseSmartNotificationsReturn {
  const [preferences, setPreferences] = useState<ReminderPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const getReminderPreferences = useCallback(async (): Promise<ReminderPreferences | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return null;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('journaling_preferences')
        .eq('id', session.user.id)
        .maybeSingle();

      if (fetchError) {
        if (fetchError.code === '42703' || fetchError.code === 'PGRST204') {
          console.warn('journaling_preferences column not found. Using defaults.');
          return defaultReminderPreferences;
        }
        console.error('Error fetching reminder preferences:', fetchError);
        throw fetchError;
      }

      if (data?.journaling_preferences) {
        return {
          ...defaultReminderPreferences,
          ...(data.journaling_preferences as Partial<ReminderPreferences>),
        };
      }

      return defaultReminderPreferences;
    } catch (err) {
      console.error('Error in getReminderPreferences:', err);
      throw err;
    }
  }, []);

  const updatePreferences = useCallback(async (prefs: Partial<ReminderPreferences>): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No active session');
      }

      setError(null);

      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('journaling_preferences')
        .eq('id', session.user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        if (fetchError.code === '42703' || fetchError.code === 'PGRST204') {
          throw new Error('Reminder preferences are not available yet. Please try again later.');
        }
        throw fetchError;
      }

      const rawPrefs =
        profile?.journaling_preferences &&
        typeof profile.journaling_preferences === 'object' &&
        !Array.isArray(profile.journaling_preferences)
          ? (profile.journaling_preferences as Record<string, unknown>)
          : {};

      const updated = {
        ...defaultReminderPreferences,
        ...rawPrefs,
        ...prefs,
      } as ReminderPreferences;

      const { data: updatedRows, error: updateError } = await supabase
        .from('profiles')
        .update({
          journaling_preferences: updated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)
        .select('id');

      if (updateError) {
        console.error('Error updating preferences:', updateError);
        throw updateError;
      }

      if (!updatedRows?.length) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: session.user.id,
          journaling_preferences: updated,
          updated_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error('Error creating profile for preferences:', insertError);
          throw insertError;
        }
      }

      setPreferences(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(message);
      throw err;
    }
  }, []);

  const refreshPreferences = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const prefs = await getReminderPreferences();
      setPreferences(prefs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load preferences';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [getReminderPreferences]);

  const refreshUnreadCount = useCallback(async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setUnreadCount(0);
        return;
      }

      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('read', false);

      if (countError) {
        console.error('Error counting unread notifications:', countError);
        return;
      }

      setUnreadCount(count || 0);
    } catch (err) {
      console.error('Error refreshing unread count:', err);
    }
  }, []);

  useEffect(() => {
    refreshPreferences();
    refreshUnreadCount();
  }, [refreshPreferences, refreshUnreadCount]);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled || !session?.user) return;

      channel = supabase
        .channel('notification_count_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`,
          },
          () => {
            void refreshUnreadCount();
          }
        )
        .subscribe();
    };

    void setupSubscription();

    return () => {
      cancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshUnreadCount]);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    getReminderPreferences,
    refreshPreferences,
    unreadCount,
    refreshUnreadCount,
  };
}
