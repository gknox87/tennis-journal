# Multi-sport Schema Overview

This document captures the front-end schema decisions required to extend the journal experience beyond tennis. It is intended to mirror future Supabase updates and give the product, design, and data teams a shared reference.

## Core Concepts

- **Sport Catalogue**: Central definition of supported sports with scoring rules, terminology, and AI prompts. Implemented in `src/constants/sports.ts` and typed via `SportMetadata`.
- **Sport-aware Records**: Every journal entity (matches, opponents, training notes, player notes, events) carries a `sport_id` that maps back to the catalogue.
- **Profile Preferences**: Profiles gain `primary_sport_id` and `performance_goal` fields so onboarding can personalise guidance and AI reflections.

## Database Changes (planned)

| Table | New fields | Notes |
| --- | --- | --- |
| `sports` | `id`, `slug`, `name`, `short_name`, `category`, `scoring_format`, `icon_url`, timestamps | Seeded with tennis, table tennis, padel, pickleball, badminton, squash. `scoring_format` stores JSON derived from `ScoreFormat`. |
| `profiles` | `primary_sport_id`, `performance_goal` | Links a user to their default sport and goal. |
| `matches` | `sport_id`, `coach_notes` | Every match references a sport; optional private coaching notes. |
| `opponents` | `sport_id` | Supports per-sport opponent views. |
| `player_notes` | `sport_id` | Enables sport-filtered reflections. |
| `training_notes` | `sport_id` | Ensures plans and analysis remain sport-specific. |
| `scheduled_events` | `sport_id` | Allows calendars to filter or colour-code by sport. |

### Relationships

- Foreign keys from each sport-aware table to `sports.id` (nullable to keep backwards compatibility during migration).
- Supabase RLS policies will need updating to include `sport_id` in predicates where appropriate.

## Front-end Types

- `SportMetadata` and `ScoreFormat` reside in `src/types/sport.ts`.
- Existing domain types (`Match`, `TrainingNote`, `PlayerNote`, `Opponent`, `ScheduledEvent`) now carry optional `sport_id` and friendly sport descriptors where relevant.

## Next Steps

1. Apply corresponding Supabase migrations (see plan task `Plan Supabase schema updates and data backfill`).
2. Populate `/sports` data via SQL seed or Supabase dashboard.
3. Update onboarding and UI flows to read from the catalogue and persist user choices.

## Migration Plan (Supabase SQL)

1. **Create sports catalogue**
   ```sql
   create table public.sports (
     id text primary key,
     slug text unique not null,
     name text not null,
     short_name text,
     category text default 'racket',
     scoring_format jsonb default '{}'::jsonb,
     icon_url text,
     created_at timestamp with time zone default now()
   );
   ```
   Seed with the six racket sports using `insert` statements.

2. **Extend profiles**
   ```sql
   alter table public.profiles
     add column primary_sport_id text references public.sports (id),
     add column performance_goal text;
   update public.profiles set primary_sport_id = 'tennis' where primary_sport_id is null;
   ```

3. **Update journal tables**
   ```sql
   alter table public.matches add column sport_id text references public.sports (id);
   alter table public.matches add column coach_notes text;
   alter table public.opponents add column sport_id text references public.sports (id);
   alter table public.player_notes add column sport_id text references public.sports (id);
   alter table public.training_notes add column sport_id text references public.sports (id);
   alter table public.scheduled_events add column sport_id text references public.sports (id);
   ```
   Backfill each `sport_id` with `'tennis'` for legacy rows.

4. **Data hygiene**
   ```sql
   update public.matches set sport_id = 'tennis' where sport_id is null;
   update public.opponents set sport_id = 'tennis' where sport_id is null;
   update public.player_notes set sport_id = 'tennis' where sport_id is null;
   update public.training_notes set sport_id = 'tennis' where sport_id is null;
   update public.scheduled_events set sport_id = 'tennis' where sport_id is null;
   ```

5. **Policies and indexes**
   - Amend RLS policies to include `sport_id` where appropriate (e.g. `using ( user_id = auth.uid() )` already covers, but composite indexes on `(user_id, sport_id)` improve filter performance).
   - Add indexes:
     ```sql
     create index on public.matches (user_id, sport_id, date desc);
     create index on public.training_notes (user_id, sport_id, training_date desc);
     create index on public.player_notes (user_id, sport_id, created_at desc);
     ```

6. **Edge Functions**
   - Pass `sport_id` to AI functions (`analyze-match-notes`, `share-match-notes`) so downstream services can tailor tone and content.
