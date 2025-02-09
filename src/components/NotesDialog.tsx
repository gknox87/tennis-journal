
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlayerNote } from "@/types/notes";
import { NoteDialogContent } from "./notes/NoteDialogContent";
import { NoteForm } from "./notes/NoteForm";

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote?: PlayerNote | null;
  onDelete?: (noteId: string) => void;
}

export const NotesDialog = ({ open, onOpenChange, editingNote, onDelete }: NotesDialogProps) => {
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setImagePreview(editingNote.image_url || null);
    } else {
      setTitle("");
      setImagePreview(null);
    }
  }, [editingNote]);

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('note_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('note_images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to add notes",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = editingNote?.image_url;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      if (editingNote) {
        const { error } = await supabase
          .from("player_notes")
          .update({
            title,
            content: document.querySelector('.ProseMirror')?.innerHTML || '',
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingNote.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Note updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("player_notes")
          .insert({
            title,
            content: document.querySelector('.ProseMirror')?.innerHTML || '',
            image_url: imageUrl,
            user_id: session.session.user.id,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Note added successfully",
        });
      }

      setTitle("");
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };

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
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </NoteDialogContent>
    </Dialog>
  );
};
