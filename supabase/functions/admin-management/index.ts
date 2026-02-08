import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Auth: get calling user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();
    console.log(`[admin-management] action=${action} caller=${user.id}`);

    let result: unknown;

    switch (action) {
      // ─── Dashboard Stats ───────────────────────────────────────
      case "get_dashboard_stats": {
        // Total users from auth
        const { data: authUsers, error: authErr } = await adminClient.auth.admin.listUsers({
          perPage: 1,
          page: 1,
        });

        // We need total count — listUsers returns .users and we can estimate from multiple calls
        // For efficiency, query profiles table for count
        const { count: totalUsers } = await adminClient
          .from("profiles")
          .select("id", { count: "exact", head: true });

        const { count: totalCoaches } = await adminClient
          .from("user_roles")
          .select("id", { count: "exact", head: true })
          .eq("role", "coach");

        const { count: totalAdmins } = await adminClient
          .from("user_roles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin");

        const { count: totalTeams } = await adminClient
          .from("teams")
          .select("id", { count: "exact", head: true });

        const { count: totalMatches } = await adminClient
          .from("matches")
          .select("id", { count: "exact", head: true });

        const { count: totalTrainingSessions } = await adminClient
          .from("training_sessions")
          .select("id", { count: "exact", head: true });

        const { count: totalTrainingNotes } = await adminClient
          .from("training_notes")
          .select("id", { count: "exact", head: true });

        const { count: totalWellnessEntries } = await adminClient
          .from("wellness_entries")
          .select("id", { count: "exact", head: true });

        // Recent signups (last 7 days) from auth
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentAuthUsers } = await adminClient.auth.admin.listUsers({
          perPage: 100,
          page: 1,
        });
        const recentSignups = recentAuthUsers?.users?.filter(
          (u: any) => new Date(u.created_at) >= sevenDaysAgo
        ).length || 0;

        result = {
          totalUsers: totalUsers || 0,
          totalCoaches: totalCoaches || 0,
          totalAdmins: totalAdmins || 0,
          totalTeams: totalTeams || 0,
          totalMatches: totalMatches || 0,
          totalTrainingSessions: totalTrainingSessions || 0,
          totalTrainingNotes: totalTrainingNotes || 0,
          totalWellnessEntries: totalWellnessEntries || 0,
          recentSignups,
        };
        break;
      }

      // ─── List Users ────────────────────────────────────────────
      case "list_users": {
        const { page = 1, perPage = 50, roleFilter, searchQuery } = params;

        // Get all auth users
        const { data: authData, error: authErr } = await adminClient.auth.admin.listUsers({
          page,
          perPage,
        });
        if (authErr) throw authErr;

        const authUsers = authData?.users || [];
        const userIds = authUsers.map((u: any) => u.id);

        // Get profiles for these users
        const { data: profiles } = await adminClient
          .from("profiles")
          .select("*")
          .in("id", userIds);

        // Get roles for these users
        const { data: roles } = await adminClient
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", userIds);

        // Build role map
        const roleMap: Record<string, string[]> = {};
        for (const r of roles || []) {
          if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
          roleMap[r.user_id].push(r.role);
        }

        // Build profile map
        const profileMap: Record<string, any> = {};
        for (const p of profiles || []) {
          profileMap[p.id] = p;
        }

        // Combine data
        let users = authUsers.map((u: any) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed_at: u.email_confirmed_at,
          full_name: profileMap[u.id]?.full_name || u.user_metadata?.full_name || null,
          club: profileMap[u.id]?.club || null,
          avatar_url: profileMap[u.id]?.avatar_url || null,
          primary_sport_id: profileMap[u.id]?.primary_sport_id || null,
          roles: roleMap[u.id] || ["player"],
          account_type: u.user_metadata?.account_type || "player",
        }));

        // Apply role filter
        if (roleFilter && roleFilter !== "all") {
          users = users.filter((u: any) => u.roles.includes(roleFilter));
        }

        // Apply search filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          users = users.filter(
            (u: any) =>
              (u.email && u.email.toLowerCase().includes(q)) ||
              (u.full_name && u.full_name.toLowerCase().includes(q)) ||
              (u.club && u.club.toLowerCase().includes(q))
          );
        }

        result = {
          users,
          total: authData?.users?.length || 0,
          page,
          perPage,
        };
        break;
      }

      // ─── Get User Detail ───────────────────────────────────────
      case "get_user_detail": {
        const { user_id } = params;
        if (!user_id) throw new Error("user_id required");

        // Auth user info
        const { data: authUser, error: authErr } = await adminClient.auth.admin.getUserById(user_id);
        if (authErr) throw authErr;

        // Profile
        const { data: profile } = await adminClient
          .from("profiles")
          .select("*")
          .eq("id", user_id)
          .maybeSingle();

        // Roles
        const { data: userRoles } = await adminClient
          .from("user_roles")
          .select("role, created_at")
          .eq("user_id", user_id);

        // Teams
        const { data: teamMemberships } = await adminClient
          .from("team_members")
          .select("team_id, role, joined_at, teams:team_id(name)")
          .eq("user_id", user_id);

        // Activity counts
        const { count: matchCount } = await adminClient
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user_id);

        const { count: trainingCount } = await adminClient
          .from("training_notes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user_id);

        const { count: wellnessCount } = await adminClient
          .from("wellness_entries")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user_id);

        result = {
          auth: {
            id: authUser.user.id,
            email: authUser.user.email,
            created_at: authUser.user.created_at,
            last_sign_in_at: authUser.user.last_sign_in_at,
            email_confirmed_at: authUser.user.email_confirmed_at,
            user_metadata: authUser.user.user_metadata,
          },
          profile: profile || null,
          roles: userRoles?.map((r: any) => r.role) || [],
          teams: teamMemberships || [],
          activity: {
            matches: matchCount || 0,
            trainingNotes: trainingCount || 0,
            wellnessEntries: wellnessCount || 0,
          },
        };
        break;
      }

      // ─── Set User Role ─────────────────────────────────────────
      case "set_user_role": {
        const { user_id, role, action: roleAction } = params;
        if (!user_id || !role || !roleAction) {
          throw new Error("user_id, role, and action (grant/revoke) required");
        }

        if (!["player", "coach", "admin"].includes(role)) {
          throw new Error("Invalid role. Must be player, coach, or admin");
        }

        if (roleAction === "grant") {
          // Add role
          const { error: insertErr } = await adminClient
            .from("user_roles")
            .insert({ user_id, role })
            .select();

          if (insertErr && !insertErr.message.includes("duplicate")) {
            throw insertErr;
          }

          // Also update user metadata if granting coach
          if (role === "coach") {
            await adminClient.auth.admin.updateUserById(user_id, {
              user_metadata: { account_type: "coach" },
            });
          }

          console.log(`[admin-management] Granted role '${role}' to user ${user_id}`);
        } else if (roleAction === "revoke") {
          // Prevent revoking own admin role
          if (user_id === user.id && role === "admin") {
            throw new Error("Cannot revoke your own admin role");
          }

          const { error: delErr } = await adminClient
            .from("user_roles")
            .delete()
            .eq("user_id", user_id)
            .eq("role", role);

          if (delErr) throw delErr;

          // Update user metadata if revoking coach
          if (role === "coach") {
            await adminClient.auth.admin.updateUserById(user_id, {
              user_metadata: { account_type: "player" },
            });
          }

          console.log(`[admin-management] Revoked role '${role}' from user ${user_id}`);
        } else {
          throw new Error("Invalid action. Must be 'grant' or 'revoke'");
        }

        // Return updated roles
        const { data: updatedRoles } = await adminClient
          .from("user_roles")
          .select("role")
          .eq("user_id", user_id);

        result = { roles: updatedRoles?.map((r: any) => r.role) || [] };
        break;
      }

      // ─── List All Teams ────────────────────────────────────────
      case "list_all_teams": {
        const { data: teams, error: teamsErr } = await adminClient
          .from("teams")
          .select("*")
          .order("created_at", { ascending: false });
        if (teamsErr) throw teamsErr;

        // Get member counts
        const teamIds = teams?.map((t: any) => t.id) || [];
        let memberCounts: Record<string, number> = {};
        if (teamIds.length > 0) {
          const { data: members } = await adminClient
            .from("team_members")
            .select("team_id")
            .in("team_id", teamIds);
          if (members) {
            for (const m of members) {
              memberCounts[m.team_id] = (memberCounts[m.team_id] || 0) + 1;
            }
          }
        }

        // Get creator profiles
        const creatorIds = [...new Set(teams?.map((t: any) => t.created_by) || [])];
        const { data: creatorProfiles } = await adminClient
          .from("profiles")
          .select("id, full_name")
          .in("id", creatorIds);
        const creatorMap: Record<string, string> = {};
        for (const p of creatorProfiles || []) {
          creatorMap[p.id] = p.full_name || "Unknown";
        }

        result = {
          teams: teams?.map((t: any) => ({
            ...t,
            member_count: memberCounts[t.id] || 0,
            created_by_name: creatorMap[t.created_by] || "Unknown",
          })) || [],
        };
        break;
      }

      // ─── Get Team Detail (Admin View) ──────────────────────────
      case "get_team_detail": {
        const { team_id } = params;
        if (!team_id) throw new Error("team_id required");

        const { data: team, error: tErr } = await adminClient
          .from("teams")
          .select("*")
          .eq("id", team_id)
          .single();
        if (tErr) throw tErr;

        // Get members with profile info
        const { data: members, error: mErr } = await adminClient
          .from("team_members")
          .select("id, user_id, role, joined_at, profiles:user_id(full_name, avatar_url)")
          .eq("team_id", team_id);
        if (mErr) throw mErr;

        // Get creator profile
        const { data: creator } = await adminClient
          .from("profiles")
          .select("full_name")
          .eq("id", team.created_by)
          .maybeSingle();

        result = {
          team: { ...team, created_by_name: creator?.full_name || "Unknown" },
          members: members || [],
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[admin-management] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
