
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { ScheduledEvent } from "@/types/calendar";
import { StatsSection } from "@/components/StatsSection";
import { MatchList } from "@/components/MatchList";
import { NotesSection } from "@/components/dashboard/NotesSection";
import { NotesDialog } from "@/components/NotesDialog";
import { ImprovementChecklist } from "@/components/ImprovementChecklist";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { JournalingStreak } from "@/components/dashboard/JournalingStreak";
import { MilestoneCelebration } from "@/components/dashboard/MilestoneCelebration";
import { TrainingLoadWidget } from "@/components/dashboard/TrainingLoadWidget";
import { WellnessWidget } from "@/components/dashboard/WellnessWidget";
import { InjuryWidget } from "@/components/dashboard/InjuryWidget";
import { Heart } from "lucide-react";
import { useState, memo, Suspense, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useJournalingStreak } from "@/hooks/useJournalingStreak";
import { useTrainingLoad } from "@/hooks/useTrainingLoad";
import { useWellness } from "@/hooks/useWellness";
import { useInjuryReports } from "@/hooks/useInjuryReports";
import { isMilestone } from "@/utils/streakCalculations";

const MemoizedStatsSection = memo(StatsSection);
const MemoizedImprovementChecklist = memo(ImprovementChecklist);

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
  
  // Check if any wellness data exists
  const { sessions } = useTrainingLoad();
  const { metrics: wellnessMetrics } = useWellness();
  const { activeInjuries } = useInjuryReports();
  
  const hasWellnessData = 
    sessions.length > 0 || 
    wellnessMetrics.todayScore !== null || 
    activeInjuries.length > 0;

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

      {/* ─── 1. JOURNALING STREAK ─── */}
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      }>
        <JournalingStreak />
      </Suspense>

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

      {/* ─── 3. WHAT'S NEXT ─── */}
      <section>
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        }>
          <UpcomingEvents events={upcomingEvents} />
        </Suspense>
      </section>

      {/* ─── 4. JOURNAL NOTES ─── */}
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

      {/* ─── 5. RECENT MATCHES ─── */}
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
          />
        </Suspense>
      </section>

      {/* ─── 6. BODY & WELLNESS ─── */}
      {hasWellnessData && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Body & Wellness
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
