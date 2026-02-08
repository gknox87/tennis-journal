import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";
import type { TeamMember } from "@/hooks/useTeams";

interface TeamRosterProps {
  members: TeamMember[];
  isCoach: boolean;
  currentUserId: string;
  onRemoveMember?: (userId: string) => void;
}

export const TeamRoster = ({ members, isCoach, currentUserId, onRemoveMember }: TeamRosterProps) => {
  return (
    <div className="space-y-3">
      {members.map((member) => {
        const name = member.profiles?.full_name || "Unknown Player";
        const initials = name.charAt(0).toUpperCase();

        return (
          <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.profiles?.avatar_url || ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={member.role === "coach" ? "default" : "secondary"} className="capitalize">
                {member.role}
              </Badge>
              {isCoach && member.user_id !== currentUserId && member.role !== "coach" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onRemoveMember?.(member.user_id)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
      {members.length === 0 && (
        <p className="text-center text-muted-foreground py-6">No members yet. Invite players to get started!</p>
      )}
    </div>
  );
};
