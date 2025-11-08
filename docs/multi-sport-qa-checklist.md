# Multi-sport Onboarding & UX QA Checklist

Use this checklist before each release that touches onboarding, sport preferences, or sport-aware UI.

## Account & Onboarding
- [ ] Sign up as a new user and confirm sport and goal persist after email verification.
- [ ] Confirm pending onboarding data in local storage is cleared once the profile is created.
- [ ] Switch between each sport in `Register` and ensure selector copy updates accurately.

## Dashboard & Matches
- [ ] Verify the dashboard only displays matches for the selected sport and realtime updates honour the filter.
- [ ] Add a new match for each sport, ensuring sport metadata (icon, terminology) appears in cards and detail view.
- [ ] Confirm match deletion triggers a refetch scoped to the active sport.

## Training Notes
- [ ] Create, edit, and delete training notes while switching sports; ensure only sport-specific notes render.
- [ ] Validate the training dialog stores `sport_id` and the sport pill appears on `TrainingNoteCard`.

## Multi-tab Consistency
- [ ] Change sport in one tab and refresh another tab to ensure preferences sync via Supabase.
- [ ] Confirm `View All Matches` respects sport filter and user scoping.

## Edge Integrations
- [ ] Trigger AI improvement notes after a match and check that sport context is sent (inspect network payload).
- [ ] Share match notes via email/WhatsApp and validate sport terminology in the message body.

## Regression Smoke
- [ ] Existing tennis-only accounts retain historical data with default sport set to tennis.
- [ ] Serve analysis page loads with sport context available (even though tennis-specific for now).
- [ ] No console errors when switching sports repeatedly or logging out/in.
