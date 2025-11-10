
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { ScheduledEvent } from "@/types/calendar";
import { StatsSection } from "@/components/StatsSection";
import { MatchList } from "@/components/MatchList";
import { NotesSection } from "@/components/dashboard/NotesSection";
import { NotesDialog } from "@/components/NotesDialog";
import { ImprovementChecklist } from "@/components/ImprovementChecklist";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { Card, CardContent } from "@/components/ui/card";
import { useState, memo, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();

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

  const handleEditNote = (note: PlayerNote) => {
    setEditingNote(note);
    setShowNotesDialog(true);
  };

  // Show recent matches - prefer filteredMatches (for search), fallback to all matches
  // Limit to 9 for display
  const matchesToShow = filteredMatches.length > 0 ? filteredMatches : matches;
  const recentMatches = matchesToShow.slice(0, 9);
  
  console.log('DashboardContent - Total matches:', matches.length, 'Filtered matches:', filteredMatches.length, 'Matches to show:', matchesToShow.length, 'Recent matches:', recentMatches.length);
  console.log('DashboardContent - Player notes:', playerNotes.length);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200/50 shadow-sm">
        <Suspense fallback={
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        }>
          <MemoizedStatsSection matches={matches} />
        </Suspense>
      </div>

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

      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      }>
        <MatchList
          matches={recentMatches}
          onMatchDelete={onMatchDelete}
        />
      </Suspense>

      <div className="space-y-6">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        }>
          <UpcomingEvents events={upcomingEvents} />
        </Suspense>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold gradient-text mb-6 text-center">🎯 Level Up Your Game</h2>
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        }>
          <MemoizedImprovementChecklist />
        </Suspense>
      </div>

      <NotesDialog
        open={showNotesDialog}
        onOpenChange={setShowNotesDialog}
        editingNote={editingNote}
        onDelete={onDeleteNote}
      />
    </div>
  );
};
