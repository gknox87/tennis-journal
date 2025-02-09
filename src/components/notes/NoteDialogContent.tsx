
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NoteDialogContentProps {
  isEditing: boolean;
  children: React.ReactNode;
}

export const NoteDialogContent = ({ isEditing, children }: NoteDialogContentProps) => {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Note" : "Add Note"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          {children}
        </div>
      </div>
    </DialogContent>
  );
};
