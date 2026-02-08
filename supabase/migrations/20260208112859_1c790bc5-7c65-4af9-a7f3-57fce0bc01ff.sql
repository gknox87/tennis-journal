
-- 1. Create enums
CREATE TYPE public.app_role AS ENUM ('player', 'coach', 'admin');
CREATE TYPE public.link_status AS ENUM ('pending', 'approved', 'revoked');
CREATE TYPE public.team_role AS ENUM ('coach', 'player', 'assistant_coach');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create coach_player_links table
CREATE TABLE public.coach_player_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status link_status NOT NULL DEFAULT 'pending',
  shared_data JSONB NOT NULL DEFAULT '{"matches": false, "training": false, "notes": false}'::jsonb,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT coach_player_different CHECK (coach_id != player_id)
);
ALTER TABLE public.coach_player_links ENABLE ROW LEVEL SECURITY;

-- 4. Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sport_id TEXT REFERENCES public.sports(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 5. Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'player',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  invited_by UUID REFERENCES public.profiles(id),
  UNIQUE (team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 6. Create guardians table
CREATE TABLE public.guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'parent',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT guardian_player_different CHECK (player_id != guardian_id),
  UNIQUE (player_id, guardian_id)
);
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- 7. Add date_of_birth to profiles
ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE;

-- 8. Seed existing users with 'player' role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'player'::app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- 9. Security-definer functions

-- has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- is_linked_coach
CREATE OR REPLACE FUNCTION public.is_linked_coach(_coach_id UUID, _player_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coach_player_links
    WHERE coach_id = _coach_id
      AND player_id = _player_id
      AND status = 'approved'
  )
$$;

-- is_team_member
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id
  )
$$;

-- is_guardian_of
CREATE OR REPLACE FUNCTION public.is_guardian_of(_guardian_id UUID, _player_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guardians
    WHERE guardian_id = _guardian_id
      AND player_id = _player_id
      AND verified_at IS NOT NULL
  )
$$;

-- 10. RLS Policies

-- user_roles: read own only
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- coach_player_links: coaches can insert requests
CREATE POLICY "Coaches can request player links"
  ON public.coach_player_links FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = coach_id
    AND public.has_role(auth.uid(), 'coach')
  );

-- coach_player_links: both parties can read their own links
CREATE POLICY "Users can read their own links"
  ON public.coach_player_links FOR SELECT
  TO authenticated
  USING (auth.uid() = coach_id OR auth.uid() = player_id);

-- coach_player_links: players/guardians can update status
CREATE POLICY "Players can update link status"
  ON public.coach_player_links FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = player_id
    OR public.is_guardian_of(auth.uid(), player_id)
  );

-- teams: coaches can create
CREATE POLICY "Coaches can create teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND public.has_role(auth.uid(), 'coach')
  );

-- teams: creator can update/delete
CREATE POLICY "Team creators can manage teams"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Team creators can delete teams"
  ON public.teams FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- teams: members can read
CREATE POLICY "Team members can view teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by
    OR public.is_team_member(auth.uid(), id)
  );

-- team_members: team coaches can insert
CREATE POLICY "Team coaches can add members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('coach', 'assistant_coach')
    )
  );

-- team_members: members can read their team's members
CREATE POLICY "Team members can view roster"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));

-- team_members: team coaches can remove members
CREATE POLICY "Team coaches can remove members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('coach', 'assistant_coach')
    )
    OR auth.uid() = user_id -- members can leave
  );

-- guardians: both parties can read
CREATE POLICY "Guardians and players can view their records"
  ON public.guardians FOR SELECT
  TO authenticated
  USING (auth.uid() = guardian_id OR auth.uid() = player_id);

-- guardians: guardians can insert
CREATE POLICY "Users can create guardian links"
  ON public.guardians FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = guardian_id OR auth.uid() = player_id);

-- 11. Indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_coach_player_links_coach_id ON public.coach_player_links(coach_id);
CREATE INDEX idx_coach_player_links_player_id ON public.coach_player_links(player_id);
CREATE INDEX idx_coach_player_links_status ON public.coach_player_links(status);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_guardians_player_id ON public.guardians(player_id);
CREATE INDEX idx_guardians_guardian_id ON public.guardians(guardian_id);

-- 12. Trigger to auto-assign player role on new user signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'player')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();

-- 13. Updated_at trigger for teams
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
