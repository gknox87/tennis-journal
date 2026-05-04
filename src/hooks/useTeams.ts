import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TeamSummary {
  id: string;
  name: string;
  sport_id: string | null;
  description: string | null;
  created_at: string;
  my_role: "coach" | "player" | "assistant_coach";
  member_count: number;
}

export interface TeamMember {
  id: string;
  user_id: string;
  role: "coach" | "player" | "assistant_coach";
  joined_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

export interface TeamDetail {
  id: string;
  name: string;
  sport_id: string | null;
  description: string | null;
  created_at: string;
  created_by: string;
}

export function useTeams() {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fnErr } = await supabase.functions.invoke("team-management", {
        body: { action: "get_my_teams" },
      });
      if (fnErr) throw fnErr;
      setTeams(data?.teams || []);
    } catch (err: unknown) {
      console.error("Error fetching teams:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch teams");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const createTeam = useCallback(async (name: string, sportId?: string, description?: string) => {
    const { data, error: fnErr } = await supabase.functions.invoke("team-management", {
      body: { action: "create_team", name, sport_id: sportId, description },
    });
    if (fnErr) throw fnErr;
    if (data?.error) throw new Error(data.error);
    await fetchTeams();
    return data.team;
  }, [fetchTeams]);

  const invitePlayer = useCallback(async (teamId: string, playerEmail: string) => {
    const { data, error: fnErr } = await supabase.functions.invoke("team-management", {
      body: { action: "invite_player", team_id: teamId, player_email: playerEmail },
    });
    if (fnErr) throw fnErr;
    if (data?.error) throw new Error(data.error);
    return data.member;
  }, []);

  const removeMember = useCallback(async (teamId: string, memberUserId: string) => {
    const { data, error: fnErr } = await supabase.functions.invoke("team-management", {
      body: { action: "remove_member", team_id: teamId, member_user_id: memberUserId },
    });
    if (fnErr) throw fnErr;
    if (data?.error) throw new Error(data.error);
  }, []);

  const leaveTeam = useCallback(async (teamId: string) => {
    const { data, error: fnErr } = await supabase.functions.invoke("team-management", {
      body: { action: "leave_team", team_id: teamId },
    });
    if (fnErr) throw fnErr;
    if (data?.error) throw new Error(data.error);
    await fetchTeams();
  }, [fetchTeams]);

  const getTeamDetails = useCallback(async (teamId: string): Promise<{ team: TeamDetail; members: TeamMember[] }> => {
    const { data, error: fnErr } = await supabase.functions.invoke("team-management", {
      body: { action: "get_team_details", team_id: teamId },
    });
    if (fnErr) throw fnErr;
    if (data?.error) throw new Error(data.error);
    return { team: data.team, members: data.members };
  }, []);

  return {
    teams,
    isLoading,
    error,
    createTeam,
    invitePlayer,
    removeMember,
    leaveTeam,
    getTeamDetails,
    refreshTeams: fetchTeams,
  };
}
