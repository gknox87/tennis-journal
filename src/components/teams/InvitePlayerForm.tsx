import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";

interface InvitePlayerFormProps {
  teamId: string;
  onInvited?: () => void;
}

export const InvitePlayerForm = ({ teamId, onInvited }: InvitePlayerFormProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { invitePlayer } = useTeams();
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email.trim()) return;
    try {
      setIsSubmitting(true);
      await invitePlayer(teamId, email.trim());
      toast({ title: "Player invited!", description: `${email} has been added to the team.` });
      setEmail("");
      onInvited?.();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Player's email address"
        type="email"
        onKeyDown={(e) => e.key === "Enter" && handleInvite()}
      />
      <Button onClick={handleInvite} disabled={!email.trim() || isSubmitting} size="default">
        <UserPlus className="h-4 w-4 mr-2" />
        Invite
      </Button>
    </div>
  );
};
