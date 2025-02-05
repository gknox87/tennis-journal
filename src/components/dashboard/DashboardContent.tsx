
import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { StatsSection } from "@/components/StatsSection";
import { SearchSection } from "@/components/SearchSection";
import { MatchList } from "@/components/MatchList";
import { NotesSection } from "@/components/dashboard/NotesSection";
import { NotesDialog } from "@/components/NotesDialog";
import { useState } from "react";
import { ImprovementChecklist } from "@/components/ImprovementChecklist";

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

  return (
    <>
      <div className="mt-4 sm:mt-8">
        <StatsSection matches={matches} />
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Helpful Tips</h2>
        <ImprovementChecklist />
      </div>

      <NotesSection
        playerNotes={playerNotes}
        onAddNote={() => {
          setEditingNote(null);
          setShowNotesDialog(true);
        }}
        onEditNote={handleEditNote}
        onDeleteNote={onDeleteNote}
      />

      <div className="mt-6">
        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
      </div>

      <div className="mt-4">
        <MatchList
          matches={filteredMatches}
          onMatchDelete={onMatchDelete}
        />
      </div>

      <NotesDialog
        open={showNotesDialog}
        onOpenChange={setShowNotesDialog}
        editingNote={editingNote}
      />
    </>
  );
};
