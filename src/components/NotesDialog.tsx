import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2 } from "lucide-react";
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
}

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote?: Note | null;
}

export const NotesDialog = ({ open, onOpenChange, editingNote }: NotesDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [editingNote]);

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

      if (!title.trim() || !content.trim()) {
        toast({
          title: "Error",
          description: "Please fill in both title and content",
          variant: "destructive",
        });
        return;
      }

      if (editingNote) {
        const { error } = await supabase
          .from("player_notes")
          .update({
            title,
            content,
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
            content,
            user_id: session.session.user.id,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Note added successfully",
        });
      }

      setTitle("");
      setContent("");
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
            <Textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={handleSubmit}>
              {editingNote ? "Update Note" : "Add Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};