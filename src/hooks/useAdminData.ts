import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalUsers: number;
  totalCoaches: number;
  totalAdmins: number;
  totalTeams: number;
  totalMatches: number;
  totalTrainingSessions: number;
  totalTrainingNotes: number;
  totalWellnessEntries: number;
  recentSignups: number;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  full_name: string | null;
  club: string | null;
  avatar_url: string | null;
  primary_sport_id: string | null;
  roles: string[];
  account_type: string;
}

export interface AdminTeam {
  id: string;
  name: string;
  sport_id: string | null;
  description: string | null;
  created_at: string;
  created_by: string;
  member_count: number;
  created_by_name: string;
}

export interface UserDetail {
  auth: {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
    email_confirmed_at: string | null;
    user_metadata: Record<string, unknown>;
  };
  profile: {
    full_name: string | null;
    club: string | null;
    ranking: string | null;
    avatar_url: string | null;
    primary_sport_id: string | null;
    date_of_birth: string | null;
  } | null;
  roles: string[];
  teams: Array<{
    team_id: string;
    role: string;
    joined_at: string;
    teams: { name: string } | null;
  }>;
  activity: {
    matches: number;
    trainingNotes: number;
    wellnessEntries: number;
  };
}

export interface TeamDetail {
  team: AdminTeam;
  members: Array<{
    id: string;
    user_id: string;
    role: string;
    joined_at: string;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
  }>;
}

async function invokeAdmin(action: string, params: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("admin-management", {
    body: { action, ...params },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await invokeAdmin("get_dashboard_stats");
      setStats(data as DashboardStats);
    } catch (err: unknown) {
      console.error("Error fetching admin stats:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { stats, isLoading, error, fetchStats };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (roleFilter?: string, searchQuery?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await invokeAdmin("list_users", { roleFilter, searchQuery });
      setUsers(data.users || []);
    } catch (err: unknown) {
      console.error("Error fetching admin users:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserDetail = useCallback(async (userId: string): Promise<UserDetail> => {
    const data = await invokeAdmin("get_user_detail", { user_id: userId });
    return data as UserDetail;
  }, []);

  const setUserRole = useCallback(async (userId: string, role: string, roleAction: "grant" | "revoke") => {
    const data = await invokeAdmin("set_user_role", {
      user_id: userId,
      role,
      action: roleAction,
    });
    return data.roles as string[];
  }, []);

  return { users, isLoading, error, fetchUsers, getUserDetail, setUserRole };
}

export function useAdminTeams() {
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await invokeAdmin("list_all_teams");
      setTeams(data.teams || []);
    } catch (err: unknown) {
      console.error("Error fetching admin teams:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTeamDetail = useCallback(async (teamId: string): Promise<TeamDetail> => {
    const data = await invokeAdmin("get_team_detail", { team_id: teamId });
    return data as TeamDetail;
  }, []);

  return { teams, isLoading, error, fetchTeams, getTeamDetail };
}
