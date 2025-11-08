import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SPORT_ID, SPORTS, type SupportedSportId } from "@/constants/sports";
import type { SportMetadata, SportCategory } from "@/types/sport";
import { ONBOARDING_STORAGE_KEY, type PendingOnboardingSelection } from "@/constants/onboarding";
import {
  getPublishedSports,
  getSportsByCategory,
  getPopularSports,
  getSportById,
} from "@/utils/sportHelpers";

const SPORTS_CACHE_KEY = "sports_catalogue_cache";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

interface SportsCacheData {
  timestamp: number;
  sports: SportMetadata[];
}

interface SportContextValue {
  sportId: SupportedSportId;
  goalId: string;
  sport: SportMetadata;
  setPreferences: (sportId: SupportedSportId, goalId: string) => Promise<void>;
  isLoading: boolean;
  sports: SportMetadata[];
  sportsByCategory: Record<SportCategory, SportMetadata[]>;
  popularSports: SportMetadata[];
  getSport: (id: string) => SportMetadata | undefined;
}

const SportContext = createContext<SportContextValue | undefined>(undefined);

const toSupportedSport = (sportId: string | null | undefined): SupportedSportId => {
  if (sportId && sportId in SPORTS) {
    return sportId as SupportedSportId;
  }
  return DEFAULT_SPORT_ID;
};

const flushPendingOnboarding = () => {
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingOnboardingSelection;
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    return parsed;
  } catch (error) {
    console.warn("Failed to read onboarding selection", error);
    return null;
  }
};

const getCachedSports = (): SportMetadata[] | null => {
  try {
    const cached = localStorage.getItem(SPORTS_CACHE_KEY);
    if (!cached) return null;

    const cacheData: SportsCacheData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - cacheData.timestamp < CACHE_TTL) {
      return cacheData.sports;
    }

    // Cache expired, remove it
    localStorage.removeItem(SPORTS_CACHE_KEY);
    return null;
  } catch (error) {
    console.warn("Failed to read sports cache", error);
    return null;
  }
};

const setCachedSports = (sports: SportMetadata[]) => {
  try {
    const cacheData: SportsCacheData = {
      timestamp: Date.now(),
      sports,
    };
    localStorage.setItem(SPORTS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("Failed to cache sports", error);
  }
};

export const SportProvider = ({ children }: { children: React.ReactNode }) => {
  const [sportId, setSportId] = useState<SupportedSportId>(DEFAULT_SPORT_ID);
  const [goalId, setGoalId] = useState<string>("performance");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allSports, setAllSports] = useState<SportMetadata[]>(() => {
    // Try to load from cache on init
    return getCachedSports() || getPublishedSports();
  });

  const fetchProfilePreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        setSportId(DEFAULT_SPORT_ID);
        setGoalId("performance");
        setIsLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("primary_sport_id, performance_goal")
        .eq("id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Failed to load profile preferences", error);
      }

      const pending = flushPendingOnboarding();
      const nextSportId = toSupportedSport(pending?.sportId ?? profile?.primary_sport_id ?? DEFAULT_SPORT_ID);
      const nextGoalId = pending?.goalId ?? profile?.performance_goal ?? "performance";

      setSportId(nextSportId);
      setGoalId(nextGoalId);

      if (session && (pending || !profile)) {
        await supabase
          .from("profiles")
          .upsert({
            id: session.user.id,
            primary_sport_id: nextSportId,
            performance_goal: nextGoalId,
            updated_at: new Date().toISOString(),
          }, { onConflict: "id" });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfilePreferences();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfilePreferences();
      } else {
        setSportId(DEFAULT_SPORT_ID);
        setGoalId("performance");
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [fetchProfilePreferences]);

  const setPreferences = useCallback(async (nextSport: SupportedSportId, nextGoal: string) => {
    setSportId(nextSport);
    setGoalId(nextGoal);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ sportId: nextSport, goalId: nextGoal }));
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        primary_sport_id: nextSport,
        performance_goal: nextGoal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (error) {
      console.error("Failed to update sport preferences", error);
    }
  }, []);

  // Update cache when allSports changes
  useEffect(() => {
    if (allSports.length > 0) {
      setCachedSports(allSports);
    }
  }, [allSports]);

  const sportsByCategory = useMemo(() => getSportsByCategory(), []);
  const popularSports = useMemo(() => getPopularSports(8), []);

  const value = useMemo<SportContextValue>(() => ({
    sportId,
    goalId,
    sport: SPORTS[sportId],
    setPreferences,
    isLoading,
    sports: allSports,
    sportsByCategory,
    popularSports,
    getSport: getSportById,
  }), [sportId, goalId, setPreferences, isLoading, allSports, sportsByCategory, popularSports]);

  return (
    <SportContext.Provider value={value}>
      {children}
    </SportContext.Provider>
  );
};

export const useSport = () => {
  const context = useContext(SportContext);
  if (!context) {
    throw new Error("useSport must be used within a SportProvider");
  }
  return context;
};
