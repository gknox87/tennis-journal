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

    const { action, ...params } = await req.json();
    console.log(`[team-management] action=${action} user=${user.id}`);

    let result: unknown;

    switch (action) {
      case "create_team": {
        const { name, sport_id, description } = params;
        if (!name) throw new Error("Team name is required");

        // Verify coach role
        const { data: isCoach } = await adminClient.rpc("has_role", {
          _user_id: user.id,
          _role: "coach",
        });
        if (!isCoach) throw new Error("Only coaches can create teams");

        // Create team
        const { data: team, error: teamErr } = await adminClient
          .from("teams")
          .insert({
            name,
            sport_id: sport_id || null,
            description: description || null,
            created_by: user.id,
          })
          .select()
          .single();
        if (teamErr) throw teamErr;

        // Add coach as member
        const { error: memberErr } = await adminClient
          .from("team_members")
          .insert({
            team_id: team.id,
            user_id: user.id,
            role: "coach",
          });
        if (memberErr) throw memberErr;

        console.log(`[team-management] Team created: ${team.id}`);
        result = { team };
        break;
      }

      case "invite_player": {
        const { team_id, player_email } = params;
        if (!team_id || !player_email) throw new Error("team_id and player_email required");

        // Verify caller is coach of this team
        const { data: membership } = await adminClient
          .from("team_members")
          .select("role")
          .eq("team_id", team_id)
          .eq("user_id", user.id)
          .single();
        if (!membership || membership.role !== "coach") {
          throw new Error("Only team coaches can invite players");
        }

        // Look up player by email using admin auth API
        const { data: usersData, error: lookupErr } = await adminClient.auth.admin.listUsers();
        if (lookupErr) throw lookupErr;

        const targetUser = usersData.users.find(
          (u: any) => u.email?.toLowerCase() === player_email.toLowerCase()
        );
        if (!targetUser) {
          throw new Error("No user found with that email address");
        }

        // Check if already a member
        const { data: existing } = await adminClient
          .from("team_members")
          .select("id")
          .eq("team_id", team_id)
          .eq("user_id", targetUser.id)
          .maybeSingle();
        if (existing) throw new Error("Player is already a member of this team");

        // Add as player
        const { data: member, error: addErr } = await adminClient
          .from("team_members")
          .insert({
            team_id,
            user_id: targetUser.id,
            role: "player",
            invited_by: user.id,
          })
          .select()
          .single();
        if (addErr) throw addErr;

        console.log(`[team-management] Player ${targetUser.id} invited to team ${team_id}`);
        result = { member };
        break;
      }

      case "remove_member": {
        const { team_id, member_user_id } = params;
        if (!team_id || !member_user_id) throw new Error("team_id and member_user_id required");

        // Verify caller is coach
        const { data: callerMembership } = await adminClient
          .from("team_members")
          .select("role")
          .eq("team_id", team_id)
          .eq("user_id", user.id)
          .single();
        if (!callerMembership || callerMembership.role !== "coach") {
          throw new Error("Only team coaches can remove members");
        }

        // Cannot remove yourself as coach
        if (member_user_id === user.id) {
          throw new Error("Coaches cannot remove themselves");
        }

        const { error: delErr } = await adminClient
          .from("team_members")
          .delete()
          .eq("team_id", team_id)
          .eq("user_id", member_user_id);
        if (delErr) throw delErr;

        console.log(`[team-management] Member ${member_user_id} removed from team ${team_id}`);
        result = { success: true };
        break;
      }

      case "leave_team": {
        const { team_id } = params;
        if (!team_id) throw new Error("team_id required");

        // Check membership
        const { data: myMembership } = await adminClient
          .from("team_members")
          .select("role")
          .eq("team_id", team_id)
          .eq("user_id", user.id)
          .single();
        if (!myMembership) throw new Error("Not a member of this team");
        if (myMembership.role === "coach") {
          throw new Error("Coaches cannot leave their own team. Delete the team instead.");
        }

        const { error: leaveErr } = await adminClient
          .from("team_members")
          .delete()
          .eq("team_id", team_id)
          .eq("user_id", user.id);
        if (leaveErr) throw leaveErr;

        console.log(`[team-management] User ${user.id} left team ${team_id}`);
        result = { success: true };
        break;
      }

      case "get_team_details": {
        const { team_id } = params;
        if (!team_id) throw new Error("team_id required");

        // Get team
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

        result = { team, members };
        break;
      }

      case "get_my_teams": {
        // Get all teams the user belongs to
        const { data: memberships, error: mErr } = await adminClient
          .from("team_members")
          .select("team_id, role, teams:team_id(id, name, sport_id, description, created_at)")
          .eq("user_id", user.id);
        if (mErr) throw mErr;

        // Get member counts for each team
        const teamIds = memberships?.map((m: any) => m.team_id) || [];
        let memberCounts: Record<string, number> = {};
        if (teamIds.length > 0) {
          const { data: counts } = await adminClient
            .from("team_members")
            .select("team_id")
            .in("team_id", teamIds);
          if (counts) {
            for (const c of counts) {
              memberCounts[c.team_id] = (memberCounts[c.team_id] || 0) + 1;
            }
          }
        }

        const teams = memberships?.map((m: any) => ({
          ...m.teams,
          my_role: m.role,
          member_count: memberCounts[m.team_id] || 0,
        })) || [];

        result = { teams };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[team-management] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
