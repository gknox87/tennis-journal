import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface JournalingExperience {
  experienceLevel: ExperienceLevel;
  totalEntries: number;
  isLoading: boolean;
}

/**
 * Hook to determine user's journaling experience level based on entry count
 * - Beginner: < 10 entries
 * - Intermediate: 10-30 entries
 * - Advanced: > 30 entries
 */
export function useJournalingExperience(): JournalingExperience {
  const [experience, setExperience] = useState<JournalingExperience>({
    experienceLevel: 'beginner',
    totalEntries: 0,
    isLoading: true,
  });

  const calculateExperience = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setExperience({
          experienceLevel: 'beginner',
          totalEntries: 0,
          isLoading: false,
        });
        return;
      }

      const userId = session.user.id;
      let totalEntries = 0;

      // Count matches
      const { count: matchesCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      totalEntries += matchesCount || 0;

      // Count training notes
      const { count: trainingCount } = await supabase
        .from('training_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      totalEntries += trainingCount || 0;

      // Count player notes
      const { count: notesCount } = await supabase
        .from('player_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      totalEntries += notesCount || 0;

      // Determine experience level
      let experienceLevel: ExperienceLevel = 'beginner';
      if (totalEntries >= 30) {
        experienceLevel = 'advanced';
      } else if (totalEntries >= 10) {
        experienceLevel = 'intermediate';
      }

      setExperience({
        experienceLevel,
        totalEntries,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error calculating journaling experience:', error);
      setExperience({
        experienceLevel: 'beginner',
        totalEntries: 0,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    calculateExperience();
  }, [calculateExperience]);

  return experience;
}

