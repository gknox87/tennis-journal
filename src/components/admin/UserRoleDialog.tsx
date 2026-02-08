import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAdminUsers, type UserDetail } from "@/hooks/useAdminData";
import {
  Shield,
  ShieldPlus,
  ShieldMinus,
  User,
  Mail,
  Calendar,
  Trophy,
  Activity,
  Heart,
  Users,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface UserRoleDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRolesChanged: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-800 border-red-200",
  coach: "bg-blue-100 text-blue-800 border-blue-200",
  player: "bg-green-100 text-green-800 border-green-200",
};

export function UserRoleDialog({ userId, open, onOpenChange, onRolesChanged }: UserRoleDialogProps) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { getUserDetail, setUserRole } = useAdminUsers();
  const { toast } = useToast();

  useEffect(() => {
    if (open && userId) {
      loadDetail(userId);
    } else {
      setDetail(null);
    }
  }, [open, userId]);

  const loadDetail = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await getUserDetail(id);
      setDetail(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleAction = async (role: string, action: "grant" | "revoke") => {
    if (!userId) return;
    try {
      setIsUpdating(true);
      const updatedRoles = await setUserRole(userId, role, action);
      setDetail((prev) =>
        prev ? { ...prev, roles: updatedRoles } : prev
      );
      toast({
        title: "Role Updated",
        description: `${action === "grant" ? "Granted" : "Revoked"} '${role}' role successfully.`,
      });
      onRolesChanged();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const hasRole = (role: string) => detail?.roles?.includes(role) ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Details & Roles
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : detail ? (
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={detail.profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {detail.profile?.full_name
                    ? detail.profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {detail.profile?.full_name || "No name set"}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{detail.auth.email}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Calendar className="h-3 w-3" />
                  Joined {format(new Date(detail.auth.created_at), "MMM d, yyyy")}
                </div>
              </div>
            </div>

            {/* Current Roles */}
            <div>
              <h4 className="text-sm font-medium mb-2">Current Roles</h4>
              <div className="flex flex-wrap gap-2">
                {detail.roles.length > 0 ? (
                  detail.roles.map((role) => (
                    <Badge key={role} className={`capitalize ${ROLE_COLORS[role] || ""}`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {role}
                    </Badge>
                  ))
                ) : (
                  <Badge className={ROLE_COLORS.player}>
                    <Shield className="h-3 w-3 mr-1" />
                    player
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Role Actions */}
            <div>
              <h4 className="text-sm font-medium mb-3">Manage Roles</h4>
              <div className="space-y-2">
                {/* Coach role */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Coach</span>
                  </div>
                  {hasRole("coach") ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleRoleAction("coach", "revoke")}
                      disabled={isUpdating}
                    >
                      <ShieldMinus className="h-3 w-3 mr-1" />
                      Revoke
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => handleRoleAction("coach", "grant")}
                      disabled={isUpdating}
                    >
                      <ShieldPlus className="h-3 w-3 mr-1" />
                      Grant
                    </Button>
                  )}
                </div>

                {/* Admin role */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Admin</span>
                  </div>
                  {hasRole("admin") ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleRoleAction("admin", "revoke")}
                      disabled={isUpdating}
                    >
                      <ShieldMinus className="h-3 w-3 mr-1" />
                      Revoke
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleRoleAction("admin", "grant")}
                      disabled={isUpdating}
                    >
                      <ShieldPlus className="h-3 w-3 mr-1" />
                      Grant
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Activity Summary */}
            <div>
              <h4 className="text-sm font-medium mb-3">Activity</h4>
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center">
                  <Trophy className="h-4 w-4 mx-auto mb-1 text-green-600" />
                  <p className="text-lg font-bold">{detail.activity.matches}</p>
                  <p className="text-xs text-muted-foreground">Matches</p>
                </Card>
                <Card className="p-3 text-center">
                  <Activity className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <p className="text-lg font-bold">{detail.activity.trainingNotes}</p>
                  <p className="text-xs text-muted-foreground">Training</p>
                </Card>
                <Card className="p-3 text-center">
                  <Heart className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                  <p className="text-lg font-bold">{detail.activity.wellnessEntries}</p>
                  <p className="text-xs text-muted-foreground">Wellness</p>
                </Card>
              </div>
            </div>

            {/* Teams */}
            {detail.teams.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Teams</h4>
                  <div className="space-y-1">
                    {detail.teams.map((tm) => (
                      <div key={tm.team_id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                        <span>{(tm.teams as any)?.name || tm.team_id}</span>
                        <Badge variant="outline" className="capitalize text-xs">
                          {tm.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Profile Details */}
            {detail.profile && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Profile Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {detail.profile.club && (
                      <div>
                        <span className="text-muted-foreground">Club:</span>{" "}
                        <span className="font-medium">{detail.profile.club}</span>
                      </div>
                    )}
                    {detail.profile.ranking && (
                      <div>
                        <span className="text-muted-foreground">Ranking:</span>{" "}
                        <span className="font-medium">{detail.profile.ranking}</span>
                      </div>
                    )}
                    {detail.profile.primary_sport_id && (
                      <div>
                        <span className="text-muted-foreground">Sport:</span>{" "}
                        <span className="font-medium">{detail.profile.primary_sport_id}</span>
                      </div>
                    )}
                    {detail.auth.last_sign_in_at && (
                      <div>
                        <span className="text-muted-foreground">Last login:</span>{" "}
                        <span className="font-medium">
                          {format(new Date(detail.auth.last_sign_in_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No user data available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
