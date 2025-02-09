
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlayerNote } from "@/types/notes";

interface UseNoteActionsProps {
  onOpenChange: (open: boolean) => void;
  editingNote: PlayerNote | null;
}

export const useNoteActions = ({ onOpenChange, editingNote }: UseNoteActionsProps) => {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!editingNote) return;
    
    try {
      const { error } = await supabase
        .from("player_notes")
        .delete()
        .eq("id", editingNote.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (title: string) => {
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

  return {
    imagePreview,
    handleFileChange,
    handleSubmit,
    handleDelete
  };
};
