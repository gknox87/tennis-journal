import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Share2, Mail, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Match } from "@/types/match";
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

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);

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

      // First delete associated improvement points
      const { error: improvementPointsError } = await supabase
        .from('improvement_points')
        .delete()
        .eq('source_match_id', id);

      if (improvementPointsError) {
        console.error('Error deleting improvement points:', improvementPointsError);
        throw new Error('Failed to delete improvement points');
      }

      // Then delete associated tags
      const { error: tagError } = await supabase
        .from('match_tags')
        .delete()
        .eq('match_id', id);

      if (tagError) {
        console.error('Error deleting match tags:', tagError);
        throw new Error('Failed to delete match tags');
      }

      // Finally delete the match
      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (matchError) {
        console.error('Error deleting match:', matchError);
        throw new Error('Failed to delete match');
      }

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

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p>Loading match details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <Button 
            onClick={() => navigate(`/edit-match/${id}`)}
            className="w-full sm:w-auto"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Match
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowEmailDialog(true)}
            className="w-full sm:w-auto"
          >
            <Mail className="mr-2 h-4 w-4" />
            Share via Email
          </Button>

          <Button
            variant="outline"
            onClick={shareViaWhatsApp}
            className="w-full sm:w-auto"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Share via WhatsApp
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                className="w-full sm:w-auto"
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
      </div>

      <Card className="w-full">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
              {match.opponent_name}
            </CardTitle>
            <Badge 
              variant={match.is_win ? "default" : "destructive"}
              className={`${match.is_win ? "bg-green-500 hover:bg-green-600" : ""} text-center px-4 py-1`}
            >
              {match.is_win ? "Win" : "Loss"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Date</h3>
            <p className="text-base sm:text-lg">
              {new Date(match.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Score</h3>
            <p className="text-xl sm:text-2xl">{match.score}</p>
          </div>
          {match.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-base sm:text-lg whitespace-pre-wrap">{match.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
};

export default MatchDetail;
