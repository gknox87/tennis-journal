import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTeams, type TeamDetail as TeamDetailType, type TeamMember } from "@/hooks/useTeams";
import { TeamRoster } from "@/components/teams/TeamRoster";
import { InvitePlayerForm } from "@/components/teams/InvitePlayerForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Users, LogOut } from "lucide-react";

const TeamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTeamDetails, removeMember, leaveTeam } = useTeams();
  const { toast } = useToast();
  const [team, setTeam] = useState<TeamDetailType | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setCurrentUserId(session.user.id);

      const details = await getTeamDetails(id);
      setTeam(details.team);
      setMembers(details.members);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [id, getTeamDetails, toast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const myRole = members.find((m) => m.user_id === currentUserId)?.role;
  const isCoach = myRole === "coach";

  const handleRemove = async (userId: string) => {
    if (!id) return;
    try {
      await removeMember(id, userId);
      toast({ title: "Member removed" });
      fetchDetails();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleLeave = async () => {
    if (!id) return;
    try {
      await leaveTeam(id);
      toast({ title: "You left the team" });
      navigate("/coach");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header userProfile={null} />
      <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/coach")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        {team && (
          <>
            {/* Team Header */}
            <Card className="p-6 mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{team.name}</h1>
                  {team.description && (
                    <p className="text-white/80 mt-1">{team.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-white/90 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{members.length} {members.length === 1 ? "member" : "members"}</span>
                  </div>
                </div>
                {!isCoach && (
                  <Button variant="secondary" size="sm" onClick={handleLeave}>
                    <LogOut className="h-4 w-4 mr-1" /> Leave
                  </Button>
                )}
              </div>
            </Card>

            {/* Invite Section (Coach Only) */}
            {isCoach && (
              <Card className="p-5 mb-6">
                <h2 className="text-lg font-semibold mb-3 text-foreground">Invite a Player</h2>
                <InvitePlayerForm teamId={id!} onInvited={fetchDetails} />
              </Card>
            )}

            {/* Roster */}
            <Card className="p-5">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Team Roster</h2>
              <TeamRoster
                members={members}
                isCoach={isCoach}
                currentUserId={currentUserId}
                onRemoveMember={handleRemove}
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamDetail;
