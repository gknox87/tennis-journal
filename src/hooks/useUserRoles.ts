import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "player" | "coach" | "admin";

export interface UseUserRolesReturn {
  roles: AppRole[];
  isCoach: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  refreshRoles: () => Promise<void>;
}

export function useUserRoles(): UseUserRolesReturn {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshRoles = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setRoles([]);
        setIsLoading(false);
        return;
      }

      // Sync roles from user metadata (handles coach assignment)
      const { data, error } = await supabase.functions.invoke("manage-roles", {
        body: { action: "sync_from_metadata" },
      });

      if (error) {
        console.error("Error syncing roles:", error);
        // Fallback: read directly from user_roles table
        const { data: directRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        setRoles((directRoles?.map((r: any) => r.role) as AppRole[]) || ["player"]);
      } else {
        setRoles((data?.roles as AppRole[]) || ["player"]);
      }
    } catch (err) {
      console.error("Error in useUserRoles:", err);
      setRoles(["player"]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRoles();
  }, [refreshRoles]);

  return {
    roles,
    isCoach: roles.includes("coach"),
    isAdmin: roles.includes("admin"),
    isLoading,
    refreshRoles,
  };
}
