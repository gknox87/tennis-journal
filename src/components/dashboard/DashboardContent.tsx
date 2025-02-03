import { Match } from "@/types/match";
import { PlayerNote } from "@/types/notes";
import { Tag } from "@/types/match";
import { StatsSection } from "@/components/StatsSection";
import { SearchSection } from "@/components/SearchSection";
import { MatchList } from "@/components/MatchList";
import { NotesSection } from "@/components/dashboard/NotesSection";
import { NotesDialog } from "@/components/NotesDialog";
import { useState } from "react";
import { AddMatchButton } from "@/components/AddMatchButton";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImprovementChecklist } from "@/components/ImprovementChecklist";

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
  const navigate = useNavigate();

  const handleEditNote = (note: PlayerNote) => {
    setEditingNote(note);
    setShowNotesDialog(true);
  };

  return (
    <>
      <div className="mt-4 sm:mt-8">
        <StatsSection matches={matches} />
      </div>

      <div className="flex justify-between items-center gap-4 mt-6">
        <AddMatchButton />
        <Button
          onClick={() => navigate("/key-opponents")}
          variant="outline"
          className="flex-1 sm:flex-none"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add Opponent</span>
          <span className="sm:hidden">Opponent</span>
        </Button>
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
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagToggle={onTagToggle}
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