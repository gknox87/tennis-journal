import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types for notification preferences
export interface TimeBasedReminder {
  enabled: boolean;
  time: string; // HH:mm format
  days: string[]; // ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
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
  after_match_reminder: boolean;
  after_training_reminder: boolean;
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

const defaultPreferences: ReminderPreferences = {
  reminder_enabled: true,
  reminder_time: '20:00',
  reminder_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
  after_match_reminder: true,
  after_training_reminder: true,
  weekly_summary_enabled: true,
  location_tracking_enabled: false,
  smart_nudge_enabled: true,
  smart_nudge_threshold_days: 3,
};

/**
 * Hook to manage smart notification preferences for journaling
 * Reads/writes to profiles.journaling_preferences (JSONB)
 */
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
        console.error('Error fetching reminder preferences:', fetchError);
        throw fetchError;
      }

      if (data?.journaling_preferences) {
        // Deep merge with defaults to ensure all fields exist
        return {
          ...defaultPreferences,
          ...(data.journaling_preferences as Partial<ReminderPreferences>),
        };
      }

      return defaultPreferences;
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

      setIsLoading(true);
      setError(null);

      // Get current preferences
      const current = await getReminderPreferences();
      const updated: ReminderPreferences = {
        ...defaultPreferences,
        ...(current || {}),
        ...prefs,
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ journaling_preferences: updated })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('Error updating preferences:', updateError);
        throw updateError;
      }

      setPreferences(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getReminderPreferences]);

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

  // Initial fetch
  useEffect(() => {
    refreshPreferences();
    refreshUnreadCount();
  }, [refreshPreferences, refreshUnreadCount]);

  // Set up realtime subscription for notification count updates
  useEffect(() => {
    const { data: { session } } = supabase.auth.getSession();
    if (!session?.user) return;

    const channel = supabase
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
          // Refresh count when notifications change
          void refreshUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
