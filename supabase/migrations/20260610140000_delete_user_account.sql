-- Self-service account deletion: removes all user-owned data before auth user is deleted.
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.injury_check_ins WHERE user_id = v_user_id;
  DELETE FROM public.injury_reports WHERE user_id = v_user_id;
  DELETE FROM public.athlete_patterns WHERE user_id = v_user_id;
  DELETE FROM public.improvement_points WHERE user_id = v_user_id;
  DELETE FROM public.training_sessions WHERE user_id = v_user_id;
  DELETE FROM public.training_notes WHERE user_id = v_user_id;
  DELETE FROM public.matches WHERE user_id = v_user_id;
  DELETE FROM public.opponents WHERE user_id = v_user_id;
  DELETE FROM public.partners WHERE user_id = v_user_id;
  DELETE FROM public.player_notes WHERE user_id = v_user_id;
  DELETE FROM public.scheduled_events WHERE user_id = v_user_id;
  DELETE FROM public.wellness_entries WHERE user_id = v_user_id;
  DELETE FROM public.period_goals WHERE user_id = v_user_id;
  DELETE FROM public.user_badges WHERE user_id = v_user_id;
  DELETE FROM public.user_challenge_progress WHERE user_id = v_user_id;
  DELETE FROM public.notifications WHERE user_id = v_user_id;
  DELETE FROM public.google_sheet_links WHERE user_id = v_user_id;
  DELETE FROM public.data_export_requests WHERE user_id = v_user_id;
  DELETE FROM public.data_retention_settings WHERE user_id = v_user_id;
  DELETE FROM public.user_location_sessions WHERE user_id = v_user_id;
  DELETE FROM public.subscriptions WHERE user_id = v_user_id;
  DELETE FROM public.coach_player_links WHERE coach_id = v_user_id OR player_id = v_user_id;
  DELETE FROM public.team_members WHERE user_id = v_user_id;
  DELETE FROM public.guardians WHERE player_id = v_user_id OR guardian_id = v_user_id;
  DELETE FROM public.coaches WHERE user_id = v_user_id;
  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  DELETE FROM public.profiles WHERE id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
