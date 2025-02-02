import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Mail, MessageSquare, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Match } from "@/types/match";
import { MatchDetailView } from "@/components/match/MatchDetailView";
import { NotesDialog } from "@/components/NotesDialog";
import { PlayerNote } from "@/types/notes";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [match, setMatch] = useState<Match | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<PlayerNote | null>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const { data, error } = await supabase
          .from("matches")
          .select(`
            *,
            opponents (
              name
            )
          `)
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          const matchWithOpponent: Match = {
            ...data,
            opponent_name: data.opponents?.name || "Unknown Opponent"
          };
          setMatch(matchWithOpponent);
        }
      } catch (error) {
        console.error("Error fetching match:", error);
        toast({
          title: "Error",
          description: "Failed to fetch match details.",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    fetchMatch();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to delete matches.",
          variant: "destructive",
        });
        return;
      }

      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (matchError) throw matchError;

      toast({
        title: "Match deleted",
        description: "The match has been successfully deleted.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error in delete operation:', error);
      toast({
        title: "Error",
        description: "Failed to delete the match. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = () => {
    if (!match) return;

    const text = `Match Details:\n
Opponent: ${match.opponent_name}\n
Date: ${new Date(match.date).toLocaleDateString()}\n
Result: ${match.is_win ? 'Win' : 'Loss'}\n
Score: ${match.score}\n
${match.notes ? `\nNotes:\n${match.notes}` : ''}`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const shareViaEmail = async () => {
    if (!match) return;
    setIsSharing(true);

    try {
      const { error } = await supabase.functions.invoke('share-match-notes', {
        body: {
          recipientEmail,
          matchDetails: {
            opponent: match.opponent_name,
            date: new Date(match.date).toLocaleDateString(),
            score: match.score,
            notes: match.notes || '',
            isWin: match.is_win,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match notes have been shared via email.",
      });
      setShowEmailDialog(false);
      setRecipientEmail("");
    } catch (error) {
      console.error('Error sharing via email:', error);
      toast({
        title: "Error",
        description: "Failed to share match notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setShowNotesDialog(true);
  };

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p>Loading match details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex flex-col gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="w-full sm:w-auto flex items-center justify-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
          <Button 
            onClick={() => navigate(`/edit-match/${id}`)}
            className="w-full"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Match
          </Button>

          <Button
            variant="outline"
            onClick={handleAddNote}
            className="w-full"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Add Note
          </Button>

          {!isMobile && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowEmailDialog(true)}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Share via Email
              </Button>

              <Button
                variant="outline"
                onClick={shareViaWhatsApp}
                className="w-full"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Share via WhatsApp
              </Button>
            </>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Match
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Match</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this match? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {isMobile && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(true)}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Share via Email
            </Button>

            <Button
              variant="outline"
              onClick={shareViaWhatsApp}
              className="w-full"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Share via WhatsApp
            </Button>
          </div>
        )}
      </div>

      <MatchDetailView match={match} />

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Match Notes via Email</DialogTitle>
            <DialogDescription>
              Enter the recipient's email address to share the match notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter recipient's email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEmailDialog(false);
                setRecipientEmail("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={shareViaEmail}
              disabled={!recipientEmail || isSharing}
            >
              {isSharing ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NotesDialog
        open={showNotesDialog}
        onOpenChange={setShowNotesDialog}
        editingNote={editingNote}
      />
    </div>
  );
};

export default MatchDetail;