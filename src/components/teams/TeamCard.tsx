import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy } from "lucide-react";
import type { TeamSummary } from "@/hooks/useTeams";

interface TeamCardProps {
  team: TeamSummary;
  onClick: () => void;
}

export const TeamCard = ({ team, onClick }: TeamCardProps) => {
  return (
    <Card
      className="p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 border-transparent hover:border-primary/20"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">{team.name}</h3>
          {team.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{team.description}</p>
          )}
        </div>
        <Badge variant={team.my_role === "coach" ? "default" : "secondary"} className="ml-2 capitalize">
          {team.my_role}
        </Badge>
      </div>
      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>{team.member_count} {team.member_count === 1 ? "member" : "members"}</span>
        </div>
      </div>
    </Card>
  );
};
