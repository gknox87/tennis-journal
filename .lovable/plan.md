

# Teams Management System -- Frontend Implementation

## What We're Building

A complete team management experience that lets coaches create and manage teams, invite players, and view rosters. Players can see their team memberships and accept/decline invitations.

The database layer (tables, RLS policies, security-definer functions) is already in place from the previous migration. This work is purely frontend + one new edge function.

---

## 1. New Edge Function: `team-management`

A single edge function handling all team operations securely server-side:

- **create_team** -- Coach creates a team (name, sport, description). Automatically adds coach as team member with `coach` role.
- **invite_player** -- Coach invites a player by email. Looks up the player's profile, creates a `team_members` entry with `pending` status (or uses `coach_player_links` for the invitation workflow).
- **remove_member** -- Coach removes a player from the team.
- **leave_team** -- Player leaves a team voluntarily.
- **get_team_details** -- Returns team info with full roster (member names, roles, join dates).

All operations validate the caller's coach role server-side using the service role key.

---

## 2. New Hook: `useTeams`

Located at `src/hooks/useTeams.ts`, provides:

- `teams` -- List of teams the current user belongs to (as coach or player)
- `createTeam(name, sportId, description)` -- Calls the edge function
- `invitePlayer(teamId, playerEmail)` -- Sends invitation
- `removeMember(teamId, userId)` -- Removes a member
- `leaveTeam(teamId)` -- Player leaves
- `isLoading` / `error` state

---

## 3. New Pages & Components

### Coach Dashboard (`src/pages/CoachDashboard.tsx`)
- Route: `/coach`
- Shows all teams the coach manages
- Quick stats: total players, total teams
- Links to create new team or manage existing ones

### Team Detail Page (`src/pages/TeamDetail.tsx`)
- Route: `/team/:id`
- Shows team name, sport, description
- Full roster with member names and roles
- Invite player form (email input)
- Remove member button (coach only)

### Team Components
- `src/components/teams/TeamCard.tsx` -- Card showing team name, sport, member count
- `src/components/teams/CreateTeamDialog.tsx` -- Dialog with name, sport selector, description fields
- `src/components/teams/InvitePlayerForm.tsx` -- Email input + invite button
- `src/components/teams/TeamRoster.tsx` -- List of team members with roles and actions

---

## 4. Route & Navigation Updates

### App.tsx
- Add `/coach` route (protected, coach-only via `useUserRoles`)
- Add `/team/:id` route (protected)

### BottomNavigation
- For coach users: replace "Opponents" with "Teams" nav item (or add a 6th item)
- Uses `useUserRoles` hook to conditionally show coach nav

### Profile Page
- Display account role badge (Player / Coach)
- Add date of birth field
- Link to coach dashboard if user is a coach

---

## 5. Implementation Order

1. Create `team-management` edge function and deploy
2. Create `useTeams` hook
3. Build `TeamCard`, `CreateTeamDialog`, `InvitePlayerForm`, `TeamRoster` components
4. Build `CoachDashboard` page
5. Build `TeamDetail` page
6. Update `App.tsx` with new routes
7. Update `BottomNavigation` for coach users
8. Update `Profile` page with role display and date of birth

---

## Technical Details

- The `teams` and `team_members` tables already exist with full RLS
- Security-definer functions `has_role()`, `is_team_member()` are already deployed
- The edge function uses the service role key for operations that bypass RLS (like looking up a player by email)
- Player email lookup in the edge function queries `auth.users` via service role -- only returns the user ID, never exposes email to the coach client-side
- Team creation requires `has_role(auth.uid(), 'coach')` -- enforced both in RLS and the edge function

