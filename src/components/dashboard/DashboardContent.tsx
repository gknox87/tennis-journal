
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { ScheduledEvent } from "@/types/calendar";
import { StatsSection } from "@/components/StatsSection";
import { SearchSection } from "@/components/SearchSection";
import { MatchList } from "@/components/MatchList";
import { NotesSection } from "@/components/dashboard/NotesSection";
import { NotesDialog } from "@/components/NotesDialog";
import { ImprovementChecklist } from "@/components/ImprovementChecklist";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { useState, memo, Suspense, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const MemoizedStatsSection = memo(StatsSection);
const MemoizedImprovementChecklist = memo(ImprovementChecklist);

interface DashboardContentProps {
  matches: Match[];
  filteredMatches: Match[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  playerNotes: PlayerNote[];
  onMatchDelete: () => void;
  onDeleteNote: (noteId: string) => void;
}

export const DashboardContent = ({
  matches,
  filteredMatches,
  searchTerm,
  onSearchChange,
  playerNotes,
  onMatchDelete,
  onDeleteNote,
}: DashboardContentProps) => {
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<PlayerNote | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<ScheduledEvent[]>([]);

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

  const recentMatches = filteredMatches.slice(0, 9);

  return (
    <div className="grid gap-6 md:gap-8">
      <div>
        <Suspense fallback={<div>Loading stats...</div>}>
          <MemoizedStatsSection matches={matches} />
        </Suspense>
      </div>

      <div>
        <Suspense fallback={<div>Loading upcoming events...</div>}>
          <UpcomingEvents events={upcomingEvents} />
        </Suspense>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 text-left">Helpful Tips</h2>
        <Suspense fallback={<div>Loading tips...</div>}>
          <MemoizedImprovementChecklist />
        </Suspense>
      </div>

      <Suspense fallback={<div>Loading notes...</div>}>
        <NotesSection
          playerNotes={playerNotes}
          onAddNote={() => {
            setEditingNote(null);
            setShowNotesDialog(true);
          }}
          onEditNote={handleEditNote}
          onDeleteNote={onDeleteNote}
        />
      </Suspense>

      <div>
        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
      </div>

      <Suspense fallback={<div>Loading matches...</div>}>
        <MatchList
          matches={recentMatches}
          onMatchDelete={onMatchDelete}
        />
      </Suspense>

      <NotesDialog
        open={showNotesDialog}
        onOpenChange={setShowNotesDialog}
        editingNote={editingNote}
        onDelete={onDeleteNote}
      />
    </div>
  );
};
