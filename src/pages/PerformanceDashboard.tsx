import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FormCurveChart, SurfaceHeatmap, OpponentRadarChart, MonthlyVolumeChart, WeeklyDigestCard } from "@/components/dashboard/PerformanceCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatchesData } from "@/hooks/useMatchesData";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import type { Database } from "@/integrations/supabase/types";
import { Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface WeeklyDigest {
  summary_text?: string;
  key_improvement?: string;
  concern?: string;
  next_focus?: string;
}

const PerformanceDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [weeklyDigest, setWeeklyDigest] = useState<WeeklyDigest | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const { sport } = useSport();

  const {
    matches,
    filteredMatches,
    setFilteredMatches,
    refreshMatches
  } = useMatchesData();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        } else {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([refreshMatches(undefined)]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    if (!isLoading) {
      loadInitialData();
    }
  }, [refreshMatches, isLoading]);

  useEffect(() => {
    if (matches.length > 0) {
      setFilteredMatches(matches);
    }
  }, [matches, setFilteredMatches]);

  const fetchWeeklyDigest = async () => {
    setDigestLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      const weekEnd = now;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weekly-performance-digest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: session.user.id,
          week_start: weekStart.toISOString(),
          week_end: weekEnd.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWeeklyDigest(data);
      }
    } catch (error) {
      console.error('Error fetching weekly digest:', error);
    } finally {
      setDigestLoading(false);
    }
  };

  useEffect(() => {
    if (matches.length > 0) {
      fetchWeeklyDigest();
    }
  }, [matches.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isEmpty = filteredMatches.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Header userProfile={userProfile} />

      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-0 sm:pt-1 lg:pt-2 pb-24 sm:pb-28">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
              <p className="text-sm text-muted-foreground">Visual intelligence for your tennis journey</p>
            </div>
            <button
              onClick={fetchWeeklyDigest}
              disabled={digestLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {digestLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Digest
            </button>
          </div>

          {isEmpty ? (
            <Card className="p-12 text-center">
              <CardHeader>
                <CardTitle className="text-lg">No Match Data Yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Start logging matches to see your performance analytics and AI-powered insights.
                </p>
                <Badge variant="secondary">Add your first match to unlock the dashboard</Badge>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* AI Weekly Digest */}
              <WeeklyDigestCard
                summaryText={weeklyDigest?.summary_text}
                keyImprovement={weeklyDigest?.key_improvement}
                concern={weeklyDigest?.concern}
                nextFocus={weeklyDigest?.next_focus}
              />

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Curve Chart */}
                <FormCurveChart matches={filteredMatches} />

                {/* Surface Heatmap */}
                <SurfaceHeatmap matches={filteredMatches} />

                {/* Opponent Radar Chart */}
                <OpponentRadarChart matches={filteredMatches} />

                {/* Monthly Volume Chart */}
                <MonthlyVolumeChart matches={filteredMatches} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PerformanceDashboard;