import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTeams } from "@/hooks/useTeams";
import { TeamCard } from "@/components/teams/TeamCard";
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { Plus, Users, Trophy } from "lucide-react";

const CoachDashboard = () => {
  const { teams, isLoading } = useTeams();
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const coachTeams = teams.filter((t) => t.my_role === "coach");
  const totalPlayers = coachTeams.reduce((sum, t) => sum + Math.max(0, t.member_count - 1), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header userProfile={null} />
      <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Coach Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage your teams and players</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="shadow-md">
            <Plus className="h-4 w-4 mr-2" /> New Team
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <Trophy className="h-6 w-6 mx-auto mb-1" />
            <p className="text-2xl font-bold">{coachTeams.length}</p>
            <p className="text-sm opacity-90">Teams</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <Users className="h-6 w-6 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalPlayers}</p>
            <p className="text-sm opacity-90">Players</p>
          </Card>
        </div>

        {/* Teams List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : coachTeams.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-1">No teams yet</h3>
            <p className="text-muted-foreground mb-4">Create your first team to start managing players.</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Team
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {coachTeams.map((team) => (
              <TeamCard key={team.id} team={team} onClick={() => navigate(`/team/${team.id}`)} />
            ))}
          </div>
        )}

        <CreateTeamDialog open={showCreate} onOpenChange={setShowCreate} />
      </div>
    </div>
  );
};

export default CoachDashboard;
