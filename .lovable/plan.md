

# Roles & Safeguarding System: Players, Coaches, and Teams

## Overview

This plan introduces a robust, futureproof roles system with three layers -- Players (existing), Coaches, and Teams -- while prioritising child safety (safeguarding) throughout. All role checks happen server-side via security-definer functions; no client-side role storage.

---

## 1. Safeguarding Requirements for Junior Players

Since the app serves young athletes, the following protections are essential:

- **Parental/guardian consent** -- Junior accounts (under 18) require a linked guardian who approves coach and team connections
- **Coach verification** -- Coaches must request to link with a player; the player (or their guardian) must accept
- **No direct messaging initially** -- Coaches see only journal data the player explicitly shares (opt-in visibility, not opt-out)
- **Audit trail** -- All link/unlink actions are timestamped and logged
- **Data minimisation** -- Coaches see shared match/training data only; never email, password, or personal contact info
- **Revocable access** -- Players/guardians can unlink a coach or leave a team at any time, immediately revoking data access
- **Age-gated features** -- Profile stores date of birth; players under 13 cannot be linked without guardian approval
- **Team admin accountability** -- Only verified coaches can create and manage teams

---

## 2. Database Schema

### New Tables

```text
+------------------+       +---------------------+       +------------------+
|   user_roles     |       |  coach_player_links  |       |      teams       |
+------------------+       +---------------------+       +------------------+
| id (uuid PK)     |       | id (uuid PK)        |       | id (uuid PK)     |
| user_id (uuid)   |       | coach_id (uuid)      |       | name (text)      |
| role (app_role)  |       | player_id (uuid)     |       | sport_id (text)  |
| created_at       |       | status (link_status) |       | created_by (uuid)|
+------------------+       | shared_data (jsonb)  |       | description      |
                            | requested_at         |       | created_at       |
                            | approved_at          |       | updated_at       |
                            | approved_by (uuid)   |       +------------------+
                            | revoked_at           |
                            +---------------------+       +------------------+
                                                          |  team_members    |
+------------------+                                      +------------------+
|   guardians      |                                      | id (uuid PK)     |
+------------------+                                      | team_id (uuid)   |
| id (uuid PK)     |                                      | user_id (uuid)   |
| player_id (uuid) |                                      | role (team_role) |
| guardian_id (uuid)|                                     | joined_at        |
| relationship     |                                      | invited_by (uuid)|
| verified_at      |                                      +------------------+
| created_at       |
+------------------+
```

### Enums

- **app_role**: `'player'`, `'coach'`, `'admin'`
- **link_status**: `'pending'`, `'approved'`, `'revoked'`
- **team_role**: `'coach'`, `'player'`, `'assistant_coach'`

### Migration SQL Summary

1. Create `app_role` enum and `user_roles` table (separate from profiles, per security rules)
2. Create `link_status` and `team_role` enums
3. Create `coach_player_links` table with status workflow (pending -> approved -> revoked)
4. Create `teams` table
5. Create `team_members` table linking users to teams with a role
6. Create `guardians` table for parental consent tracking
7. Add `date_of_birth` column to `profiles` (nullable, for age-gating)
8. Seed all existing users with `'player'` role in `user_roles`
9. Create security-definer functions: `has_role()`, `is_linked_coach()`, `is_team_member()`
10. Apply RLS policies on every new table

### Key RLS Rules

| Table | Policy Summary |
|---|---|
| `user_roles` | Users can read their own roles only. No client-side insert/update/delete (admin-only via edge function). |
| `coach_player_links` | Coaches can insert (request). Players/guardians can update status to approved/revoked. Both parties can read their own links. |
| `teams` | Creators (coaches) can manage. Members can read. |
| `team_members` | Team coaches can insert/remove. Members can read their own membership. |
| `guardians` | Players and guardians can read their own records. Only guardians can approve links for their player. |

---

## 3. Security-Definer Functions

These prevent RLS recursion and keep role checks server-side:

- **`has_role(user_id, role)`** -- Returns boolean; used in all RLS policies
- **`is_linked_coach(coach_id, player_id)`** -- Returns true only if link status is `'approved'`
- **`is_team_member(user_id, team_id)`** -- Returns true if user belongs to team
- **`is_guardian_of(guardian_id, player_id)`** -- Returns true if verified guardian relationship exists

---

## 4. Frontend Changes

### Phase 1 (This Implementation)

- **Profile page** -- Add "Account Type" display (Player / Coach) and date of birth field
- **Coach registration flow** -- During signup, allow choosing "I'm a Coach" which assigns the coach role
- **Coach dashboard** -- New route `/coach` showing linked players and their shared data
- **Player linking** -- Coach enters player invite code or email; player sees pending request and approves/declines
- **Team management** -- Coach can create a team, invite players by code, view team roster

### Phase 2 (Future, Not Built Now)

- Guardian consent workflow UI
- In-app coach-player messaging (with moderation)
- Team-level analytics and reporting
- Bulk data sharing controls

---

## 5. Edge Functions

- **`manage-roles`** -- Admin-only function to assign/revoke roles (not callable from client without admin auth)
- **`coach-link-request`** -- Handles the coach-to-player link request, validates both parties, sends notification

---

## 6. Implementation Steps

1. **Database migrations** -- Create all new tables, enums, functions, RLS policies, and indexes
2. **Update registration** -- Add coach/player role selection to signup flow
3. **Profile updates** -- Add date of birth field and role display
4. **Coach dashboard page** -- New `/coach` route with linked players list
5. **Player linking flow** -- Request/approve/revoke UI for both coach and player views
6. **Team CRUD** -- Create, view, and manage teams (coach-only)
7. **Shared data views** -- Coaches see only explicitly shared match/training data from linked players
8. **Fix existing build errors** -- Address the pre-existing TypeScript errors (coaches table reference, missing columns) as part of this work

---

## Technical Notes

- Roles are stored in a dedicated `user_roles` table, never on `profiles` (per security guidelines)
- All role checks use `security definer` functions to avoid RLS recursion
- The `coach_player_links` table uses a status-based workflow rather than delete-based, preserving audit history
- `shared_data` JSONB column on links allows granular control: `{"matches": true, "training": true, "notes": false}`
- No PII (email, contact details) is ever exposed through coach or team views
- All foreign keys reference `profiles.id` (not `auth.users`), keeping the public schema self-contained

