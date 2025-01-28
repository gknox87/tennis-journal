import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Bold, Underline as UnderlineIcon, Highlighter, ImagePlus } from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  image_url?: string;
}

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote?: Note | null;
}

export const NotesDialog = ({ open, onOpenChange, editingNote }: NotesDialogProps) => {
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },
    },
  });

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      editor?.commands.setContent(editingNote.content);
      setImagePreview(editingNote.image_url || null);
    } else {
      setTitle("");
      editor?.commands.setContent('');
      setImagePreview(null);
    }
  }, [editingNote, editor]);

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

      if (!title.trim() || !editor?.getHTML()) {
        toast({
          title: "Error",
          description: "Please fill in both title and content",
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
            content: editor.getHTML(),
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
            content: editor.getHTML(),
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
      editor?.commands.setContent('');
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
    try {
      if (!editingNote) return;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingNote ? "Edit Note" : "Add Note"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={editor?.isActive('bold') ? 'bg-accent' : ''}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={editor?.isActive('underline') ? 'bg-accent' : ''}
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editor?.chain().focus().toggleHighlight().run()}
                className={editor?.isActive('highlight') ? 'bg-accent' : ''}
              >
                <Highlighter className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="relative"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <EditorContent editor={editor} />
            {(imagePreview || editingNote?.image_url) && (
              <div className="mt-4">
                <img
                  src={imagePreview || editingNote?.image_url}
                  alt="Note image"
                  className="max-h-48 rounded-md"
                />
              </div>
            )}
            <div className="flex justify-between items-center mt-4">
              <Button onClick={handleSubmit}>
                {editingNote ? "Update Note" : "Add Note"}
              </Button>
              {editingNote && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Note
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Note</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this note? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};