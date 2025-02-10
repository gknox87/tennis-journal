
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { StatsSection } from "@/components/StatsSection";
import { SearchSection } from "@/components/SearchSection";
import { MatchList } from "@/components/MatchList";
import { NotesSection } from "@/components/dashboard/NotesSection";
import { NotesDialog } from "@/components/NotesDialog";
import { ImprovementChecklist } from "@/components/ImprovementChecklist";
import { useState, memo, Suspense } from "react";

// Memoize static components
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

  const handleEditNote = (note: PlayerNote) => {
    setEditingNote(note);
    setShowNotesDialog(true);
  };

  // Take only the first 9 matches for the dashboard
  const recentMatches = filteredMatches.slice(0, 9);

  return (
    <>
      <div className="mt-4 sm:mt-8">
        <Suspense fallback={<div>Loading stats...</div>}>
          <MemoizedStatsSection matches={matches} />
        </Suspense>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Helpful Tips</h2>
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

      <div className="mt-6">
        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
      </div>

      <Suspense fallback={<div>Loading matches...</div>}>
        <div className="mt-4">
          <MatchList
            matches={recentMatches}
            onMatchDelete={onMatchDelete}
          />
        </div>
      </Suspense>

      <NotesDialog
        open={showNotesDialog}
        onOpenChange={setShowNotesDialog}
        editingNote={editingNote}
        onDelete={onDeleteNote}
      />
    </>
  );
};
