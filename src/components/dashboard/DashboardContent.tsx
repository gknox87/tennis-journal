import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { Tag } from "@/types/match";
import { StatsSection } from "@/components/StatsSection";
import { SearchSection } from "@/components/SearchSection";
import { MatchList } from "@/components/MatchList";
import { NotesSection } from "@/components/dashboard/NotesSection";
import { NotesDialog } from "@/components/NotesDialog";
import { useState } from "react";

interface DashboardContentProps {
  matches: Match[];
  filteredMatches: Match[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  availableTags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  playerNotes: PlayerNote[];
  onMatchDelete: () => void;
  onDeleteNote: (noteId: string) => void;
}

export const DashboardContent = ({
  matches,
  filteredMatches,
  searchTerm,
  onSearchChange,
  availableTags,
  selectedTags,
  onTagToggle,
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

      <NotesSection
        playerNotes={playerNotes}
        onAddNote={() => {
          setEditingNote(null);
          setShowNotesDialog(true);
        }}
        onEditNote={handleEditNote}
        onDeleteNote={onDeleteNote}
      />

      <div className="mt-6 sm:mt-8">
        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagToggle={onTagToggle}
        />
      </div>

      <div className="mt-4 sm:mt-6">
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