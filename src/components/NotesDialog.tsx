import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotesDialog = ({ open, onOpenChange }: NotesDialogProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data, error } = await supabase
        .from("player_notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      });
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
      setEditingNote(null);
      await fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("player_notes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      await fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotes();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Player Notes</DialogTitle>
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
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{note.title}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};