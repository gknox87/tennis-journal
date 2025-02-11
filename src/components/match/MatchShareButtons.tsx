
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";
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
import { useState } from "react";
import { Match } from "@/types/match";

interface MatchShareButtonsProps {
  match: Match;
  onEmailShare: (email: string) => Promise<void>;
}

export const MatchShareButtons = ({ match, onEmailShare }: MatchShareButtonsProps) => {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const shareViaWhatsApp = () => {
    const text = `Match Details:\n
Opponent: ${match.opponent_name}\n
Date: ${new Date(match.date).toLocaleDateString()}\n
Result: ${match.is_win ? 'Win' : 'Loss'}\n
Score: ${match.score}\n
${match.notes ? `\nNotes:\n${match.notes}` : ''}`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleEmailShare = async () => {
    setIsSharing(true);
    try {
      await onEmailShare(recipientEmail);
      setShowEmailDialog(false);
      setRecipientEmail("");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              onClick={handleEmailShare}
              disabled={!recipientEmail || isSharing}
            >
              {isSharing ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
