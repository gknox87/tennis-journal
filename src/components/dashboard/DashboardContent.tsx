
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { ScheduledEvent } from "@/types/calendar";
import { StatsSection } from "@/components/StatsSection";
import { MatchList } from "@/components/MatchList";
import { NotesSection } from "@/components/dashboard/NotesSection";
import { NotesDialog } from "@/components/NotesDialog";
import { PatternInsightsWidget } from "@/components/dashboard/PatternInsightsWidget";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { JournalingStreak } from "@/components/dashboard/JournalingStreak";
import { MilestoneCelebration } from "@/components/dashboard/MilestoneCelebration";
import { TrainingLoadWidget } from "@/components/dashboard/TrainingLoadWidget";
import { WellnessWidget } from "@/components/dashboard/WellnessWidget";
import { MindsetWidget } from "@/components/dashboard/MindsetWidget";
import { AdherenceNudges } from "@/components/dashboard/AdherenceNudges";
import { hasMatchPreMatchData } from "@/components/match/PreMatchStateCard";
import { InjuryWidget } from "@/components/dashboard/InjuryWidget";
import { PeriodGoalsSection } from "@/components/goals/PeriodGoalsSection";
import { BadgeWidget } from "@/components/badges/BadgeWidget";
import { Heart, Rocket, Trophy, Target, BarChart3 } from "lucide-react";
import { useState, memo, Suspense, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useJournalingStreak } from "@/hooks/useJournalingStreak";
import { useTrainingLoad } from "@/hooks/useTrainingLoad";
import { useWellness } from "@/hooks/useWellness";
import { useInjuryReports } from "@/hooks/useInjuryReports";
import { isMilestone } from "@/utils/streakCalculations";

const MemoizedStatsSection = memo(StatsSection);

interface DashboardContentProps {
  matches: Match[];
  filteredMatches: Match[];
  playerNotes: PlayerNote[];
  onMatchDelete: () => void;
  onDeleteNote: (noteId: string) => void;
}

export const DashboardContent = ({
  matches,
  filteredMatches,
  playerNotes,
  onMatchDelete,
  onDeleteNote,
}: DashboardContentProps) => {
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<PlayerNote | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<ScheduledEvent[]>([]);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState(0);
  const navigate = useNavigate();
  const { streakData } = useJournalingStreak();
  const previousStreakRef = useRef<number>(0);
  const celebratedMilestonesRef = useRef<Set<number>>(new Set());
  
  // Check if any wellness data exists — wait for hooks to finish before showing/hiding section
  const { sessions, isLoading: trainingLoading } = useTrainingLoad();
  const { metrics: wellnessMetrics, isLoading: wellnessLoading } = useWellness();
  const { activeInjuries, isLoading: injuryLoading } = useInjuryReports();

  const wellnessDataReady = !trainingLoading && !wellnessLoading && !injuryLoading;
  const hasMindsetData = matches.some(hasMatchPreMatchData);
  const hasWellnessData =
    wellnessDataReady &&
    (sessions.length > 0 ||
      wellnessMetrics.todayScore !== null ||
      activeInjuries.length > 0 ||
      hasMindsetData);

  const fetchUpcomingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);

      if (error) throw error;

      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  // Milestone detection and celebration
  useEffect(() => {
    const currentStreak = streakData.currentStreak;
    const previousStreak = previousStreakRef.current;

    // Check if streak increased and hit a milestone
    if (currentStreak > previousStreak && currentStreak > 0 && isMilestone(currentStreak)) {
      // Only celebrate if we haven't celebrated this milestone yet
      if (!celebratedMilestonesRef.current.has(currentStreak)) {
        setMilestoneStreak(currentStreak);
        setShowMilestone(true);
        celebratedMilestonesRef.current.add(currentStreak);
      }
    }

    previousStreakRef.current = currentStreak;
  }, [streakData.currentStreak]);

  const handleEditNote = (note: PlayerNote) => {
    setEditingNote(note);
    setShowNotesDialog(true);
  };

  // Show recent matches - prefer filteredMatches (for search), fallback to all matches
  // Limit to 9 for display
  const matchesToShow = filteredMatches.length > 0 ? filteredMatches : matches;
  const recentMatches = matchesToShow.slice(0, 9);

  return (
    <div className="space-y-8">
      {/* Milestone Celebration */}
      <MilestoneCelebration
        streak={milestoneStreak}
        open={showMilestone}
        onOpenChange={setShowMilestone}
      />

      {/* ─── 0. ADHERENCE NUDGES ─── */}
      <AdherenceNudges matches={matches} />

      {/* ─── 1. JOURNALING STREAK ─── */}
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      }>
        <JournalingStreak />
      </Suspense>

      {/* ─── 1.5. WELCOME CARD (new athletes) ─── */}
      {matches.length === 0 && playerNotes.length === 0 && (
        <section>
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Rocket className="w-6 h-6" />
              <h2 className="text-lg font-bold">Welcome to Sports Journal!</h2>
            </div>
            <p className="text-sm text-white/80 mb-5">
              You're ready to track your athletic journey. Start with one of these:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => navigate("/add-match")}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-left"
              >
                <Trophy className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Log a match</p>
                  <p className="text-xs text-white/70">Record your first result</p>
                </div>
              </button>
              <button
                onClick={() => navigate("/training-notes")}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-left"
              >
                <BarChart3 className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Training session</p>
                  <p className="text-xs text-white/70">Log a practice or workout</p>
                </div>
              </button>
              <button
                onClick={() => navigate("/goals")}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-left"
              >
                <Target className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Set a goal</p>
                  <p className="text-xs text-white/70">Define your first target</p>
                </div>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ─── 2. PERFORMANCE SNAPSHOT ─── */}
      <section>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-gray-200/50 shadow-sm">
          <Suspense fallback={
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          }>
            <MemoizedStatsSection matches={matches} />
          </Suspense>
        </div>
      </section>

      {/* ─── 2.5. PATTERN INSIGHTS ─── */}
      <PatternInsightsWidget matchCount={matches.length} />

      {/* ─── 3. BADGES ─── */}
      <section>
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        }>
          <BadgeWidget />
        </Suspense>
      </section>

      {/* ─── 4. PERIOD GOALS ─── */}
      <section>
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        }>
          <PeriodGoalsSection />
        </Suspense>
      </section>

      {/* ─── 5. WHAT'S NEXT ─── */}
      <section>
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        }>
          <UpcomingEvents events={upcomingEvents} onPreMatchSaved={fetchUpcomingEvents} />
        </Suspense>
      </section>

      {/* ─── 6. JOURNAL NOTES ─── */}
      <section>
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        }>
          <NotesSection
            playerNotes={playerNotes}
            onEditNote={handleEditNote}
            onDeleteNote={onDeleteNote}
            hasMatches={matches.length > 0}
          />
        </Suspense>
      </section>

      {/* ─── 7. RECENT MATCHES ─── */}
      <section>
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        }>
          <MatchList
            matches={recentMatches}
            onMatchDelete={onMatchDelete}
            showAddButton={false}
            showEmptySearchMessage={false}
          />
        </Suspense>
      </section>

      {/* ─── 8. BODY & WELLNESS ─── */}
      {hasWellnessData && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Body & Wellness
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <TrainingLoadWidget />
            </Suspense>
            <Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
              </div>
            }>
              <WellnessWidget />
            </Suspense>
            <Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            }>
              <MindsetWidget matches={matches} />
            </Suspense>
          </div>
          <div className="mt-4">
            <Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            }>
              <InjuryWidget />
            </Suspense>
          </div>
        </section>
      )}

      
      <NotesDialog
        open={showNotesDialog}
        onOpenChange={setShowNotesDialog}
        editingNote={editingNote}
        onDelete={onDeleteNote}
      />
    </div>
  );
};
