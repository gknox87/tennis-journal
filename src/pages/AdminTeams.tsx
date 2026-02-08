import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminTeams, type TeamDetail } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import {
  Trophy,
  Users,
  Eye,
  Loader2,
  AlertCircle,
  Calendar,
  User,
} from "lucide-react";
import { format } from "date-fns";

const AdminTeams = () => {
  const { teams, isLoading, error, fetchTeams, getTeamDetail } = useAdminTeams();
  const [selectedTeam, setSelectedTeam] = useState<TeamDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const openTeamDetail = async (teamId: string) => {
    try {
      setDetailLoading(true);
      setDetailOpen(true);
      const detail = await getTeamDetail(teamId);
      setSelectedTeam(detail);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-6 pb-24 max-w-6xl">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar */}
          <div className="sm:w-48 shrink-0">
            <AdminSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-800 bg-clip-text text-transparent">
                Team Management
              </h1>
              <p className="text-muted-foreground mt-1">
                View all teams across the platform
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <Card className="p-8 text-center">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
                <h3 className="text-lg font-semibold mb-1">Failed to load teams</h3>
                <p className="text-muted-foreground text-sm">{error}</p>
              </Card>
            ) : teams.length === 0 ? (
              <Card className="p-8 text-center">
                <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-1">No teams yet</h3>
                <p className="text-muted-foreground text-sm">
                  Teams will appear here once coaches create them.
                </p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead className="text-center">Members</TableHead>
                        <TableHead className="hidden sm:table-cell">Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teams.map((team) => (
                        <TableRow key={team.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{team.name}</p>
                              {team.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {team.description}
                                </p>
                              )}
                              {team.sport_id && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {team.sport_id}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {team.created_by_name}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {team.member_count}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {format(new Date(team.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openTeamDetail(team.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="p-3 border-t text-xs text-muted-foreground text-center">
                  Showing {teams.length} team{teams.length !== 1 ? "s" : ""}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Team Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Team Details
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedTeam ? (
            <div className="space-y-4">
              {/* Team Info */}
              <div>
                <h3 className="text-lg font-semibold">{selectedTeam.team.name}</h3>
                {selectedTeam.team.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTeam.team.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Created by {(selectedTeam.team as any).created_by_name || "Unknown"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(selectedTeam.team.created_at), "MMM d, yyyy")}
                  </div>
                  {selectedTeam.team.sport_id && (
                    <Badge variant="outline" className="text-xs">
                      {selectedTeam.team.sport_id}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Members */}
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Members ({selectedTeam.members.length})
                </h4>
                <div className="space-y-2">
                  {selectedTeam.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.profiles?.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {member.profiles?.full_name
                              ? member.profiles.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {member.profiles?.full_name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {format(new Date(member.joined_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs ${
                          member.role === "coach"
                            ? "border-blue-200 text-blue-700"
                            : "border-green-200 text-green-700"
                        }`}
                      >
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No team data available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTeams;
