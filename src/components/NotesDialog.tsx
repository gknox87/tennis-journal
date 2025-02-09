
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { PlayerNote } from "@/types/notes";
import { NoteDialogContent } from "./notes/NoteDialogContent";
import { NoteForm } from "./notes/NoteForm";
import { useNoteActions } from "@/hooks/useNoteActions";

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote?: PlayerNote | null;
  onDelete?: (noteId: string) => void;
}

export const NotesDialog = ({ open, onOpenChange, editingNote, onDelete }: NotesDialogProps) => {
  const [title, setTitle] = useState("");
  const { imagePreview, handleFileChange, handleSubmit } = useNoteActions({
    onOpenChange,
    editingNote: editingNote || null,
  });

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
    } else {
      setTitle("");
    }
  }, [editingNote]);

  const handleDelete = async () => {
    if (editingNote && onDelete) {
      onDelete(editingNote.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <NoteDialogContent isEditing={!!editingNote}>
        <NoteForm
          title={title}
          setTitle={setTitle}
          imagePreview={imagePreview}
          editingNote={editingNote || null}
          onImageUpload={handleFileChange}
          onSubmit={() => handleSubmit(title)}
          onDelete={handleDelete}
        />
      </NoteDialogContent>
    </Dialog>
  );
};
