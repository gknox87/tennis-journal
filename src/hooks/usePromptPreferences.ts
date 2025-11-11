import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PromptLevel, JournalingPreferences } from '@/types/reflection';

export interface UsePromptPreferencesReturn {
  promptLevel: PromptLevel;
  isLoading: boolean;
  setPromptLevel: (level: PromptLevel) => Promise<void>;
}

/**
 * Hook to manage user's prompt level preferences
 * Fetches and updates journaling_preferences in profiles table
 */
export function usePromptPreferences(): UsePromptPreferencesReturn {
  const [promptLevel, setPromptLevelState] = useState<PromptLevel>('standard');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setPromptLevelState('standard');
        setIsLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('journaling_preferences')
        .eq('id', session.user.id)
        .single();

      if (error) {
        // Handle case where column doesn't exist yet (migration not applied)
        if (error.code === '42703' || error.code === 'PGRST204') {
          console.warn('journaling_preferences column not found. Please run the migration.');
          setPromptLevelState('standard');
          setIsLoading(false);
          return;
        }
        if (error.code !== 'PGRST116') {
          console.error('Error fetching prompt preferences:', error);
        }
      }

      const preferences = (profile?.journaling_preferences as JournalingPreferences) || {};
      const level = preferences.prompt_level || 'standard';
      
      // Validate the level
      if (['quick', 'standard', 'deep'].includes(level)) {
        setPromptLevelState(level as PromptLevel);
      } else {
        setPromptLevelState('standard');
      }
    } catch (error) {
      console.error('Error in fetchPreferences:', error);
      setPromptLevelState('standard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setPromptLevel = useCallback(async (level: PromptLevel) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setPromptLevelState(level);
        return;
      }

      // Update local state immediately
      setPromptLevelState(level);

      // Fetch current preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('journaling_preferences')
        .eq('id', session.user.id)
        .single();

      const currentPreferences = (profile?.journaling_preferences as JournalingPreferences) || {};
      const updatedPreferences: JournalingPreferences = {
        ...currentPreferences,
        prompt_level: level,
      };

      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({
          journaling_preferences: updatedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) {
        // Handle case where column doesn't exist yet (migration not applied)
        if (error.code === '42703' || error.code === 'PGRST204') {
          console.warn('journaling_preferences column not found. Preferences will be stored locally only. Please run the migration.');
          // Don't revert - keep the local state since it's still useful
          return;
        }
        console.error('Error updating prompt preferences:', error);
        // Revert local state on error
        setPromptLevelState(currentPreferences.prompt_level || 'standard');
      }
    } catch (error) {
      console.error('Error in setPromptLevel:', error);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    promptLevel,
    isLoading,
    setPromptLevel,
  };
}

