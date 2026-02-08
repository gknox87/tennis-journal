

# Session-RPE Training Load Monitoring

## Overview

Add a comprehensive training load monitoring system based on Foster's Session-RPE method. Athletes log RPE (0-10) and session duration after each training session. The system calculates derived metrics (ACWR, monotony, strain) and displays them via interactive charts -- all to help athletes and coaches manage workload and reduce injury risk.

---

## 1. Database Changes

### New Table: `training_sessions`

Stores each RPE-rated session. This is separate from the existing `training_notes` table (which captures qualitative reflections) -- the two serve different purposes but can coexist.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | Auto-generated |
| user_id | uuid | FK to profiles, RLS-protected |
| sport_id | text | Nullable, links to sports |
| rpe | smallint | 0-10, NOT NULL |
| duration_minutes | integer | NOT NULL |
| training_load | integer | Computed: rpe x duration_minutes, stored for query efficiency |
| activity_type | text | One of: technical, tactical, conditioning, strength, plyometrics, match_play, practice_match, recovery, other |
| sport_specific | text | Free text (e.g., "serve practice") |
| session_date | date | NOT NULL |
| session_start_time | timestamptz | Nullable |
| session_end_time | timestamptz | Nullable |
| rpe_collected_at | timestamptz | When RPE was logged |
| planned_duration | integer | Coach-prescribed duration (optional) |
| notes | text | Optional free text |
| training_note_id | uuid | Nullable FK to training_notes (link qualitative note to load data) |
| created_at | timestamptz | Default now() |

**RLS Policies**: Same pattern as `training_notes` -- users can CRUD their own rows only. Linked coaches can SELECT via `is_linked_coach()`.

**Migration**: Single SQL migration creating the table, RLS policies, and an index on `(user_id, session_date)`.

---

## 2. New Files

### Types
- **`src/types/trainingLoad.ts`** -- TypeScript interfaces for `TrainingSession`, `ActivityType` enum, `WeeklyLoadMetrics`, RPE scale descriptor data, and chart data shapes.

### Utility / Calculations
- **`src/utils/trainingLoadCalc.ts`** -- Pure functions for:
  - `calculateTrainingLoad(rpe, duration)`
  - `calculateACWR(sessions)` using EWMA method
  - `calculateMonotony(dailyLoads)`
  - `calculateStrain(weeklyLoad, monotony)`
  - `getWeeklyMetrics(sessions)`
  - `getRiskZone(acwr)` returning "optimal" | "caution" | "danger"

### Hook
- **`src/hooks/useTrainingLoad.ts`** -- Data fetching and mutations:
  - Fetches sessions for the current user and sport
  - `logSession(data)` -- inserts a new training session
  - `updateSession(id, data)` / `deleteSession(id)`
  - Exposes computed metrics (ACWR, monotony, strain, weekly totals)
  - 28-day rolling window fetch for chronic load calculation

### Components
- **`src/components/training/RPESlider.tsx`** -- Foster's CR-10 vertical slider with:
  - Large touch targets (minimum 48px)
  - Color gradient from green (0) to red (10)
  - Verbal anchor labels displayed alongside each value
  - Prompt text: "How was your workout?"

- **`src/components/training/LogSessionDialog.tsx`** -- Dialog for logging a session:
  - RPE slider (required)
  - Duration input in minutes (required)
  - Activity type dropdown (required)
  - Sport-specific text input (optional)
  - Session date picker (defaults to today)
  - Optional link to an existing training note
  - Shows calculated training load in real-time as RPE/duration change
  - Notes textarea (optional)

- **`src/components/training/LoadDashboard.tsx`** -- Main dashboard container with tabs for:
  - Overview (key metric cards + daily bar chart)
  - Trends (ACWR line chart + weekly comparison)
  - Distribution (activity type pie chart)

- **`src/components/training/DailyLoadChart.tsx`** -- Recharts bar chart showing daily training load for the past 7-14 days. Color-coded bars by activity type.

- **`src/components/training/ACWRChart.tsx`** -- Recharts line chart showing ACWR over time with shaded zones:
  - Green band: 0.8-1.3 (optimal)
  - Yellow band: 1.3-1.5 (caution)
  - Red zone: above 1.5 (danger)

- **`src/components/training/WeeklyTrendChart.tsx`** -- Line chart comparing weekly total loads over 4-8 weeks.

- **`src/components/training/ActivityDistribution.tsx`** -- Pie/donut chart showing percentage breakdown by activity type.

- **`src/components/training/LoadMetricCards.tsx`** -- Summary cards displaying:
  - Current ACWR (with risk zone color)
  - Weekly total load
  - Training monotony (with warning if > 2.0)
  - Training strain

### Page
- **`src/pages/TrainingLoad.tsx`** -- New page at route `/training-load` combining:
  - Header with sport context
  - "Log Session" button
  - LoadDashboard with all charts
  - Recent sessions list (last 7 days)

---

## 3. Modifications to Existing Files

| File | Change |
|---|---|
| `src/App.tsx` | Add `/training-load` route |
| `src/components/BottomNavigation.tsx` | Update "Notes" nav item to link to `/training-notes` with a sub-menu or add a new "Load" nav item -- likely replace the Notes label to encompass both, or add a 6th item for training load accessible from the training notes page |
| `src/types/training.ts` | Add optional `training_session_id` field to link notes to sessions |
| `src/pages/TrainingNotes.tsx` | Add a banner/link at the top: "Track your training load" linking to `/training-load` |
| `src/integrations/supabase/types.ts` | Will be auto-updated after migration |

---

## 4. Implementation Order

1. **Database migration** -- Create `training_sessions` table with RLS
2. **Types and calculations** -- `trainingLoad.ts` types + `trainingLoadCalc.ts` pure functions
3. **RPE Slider component** -- The core input widget with Foster's scale
4. **Log Session Dialog** -- Form to capture RPE, duration, activity type
5. **useTrainingLoad hook** -- Data layer connecting to Supabase
6. **Metric cards** -- ACWR, monotony, strain, weekly load summary
7. **Charts** -- Daily load bars, ACWR line, weekly trend, activity pie
8. **LoadDashboard** -- Compose charts and cards into tabbed layout
9. **TrainingLoad page** -- Wire everything together at `/training-load`
10. **Navigation and routing** -- Add route, update nav, cross-link from training notes

---

## 5. Technical Details

- All charts use **Recharts** (already installed) via the existing `ChartContainer` pattern in `src/components/ui/chart.tsx`
- EWMA lambda defaults to `2 / (7 + 1) = 0.25` for acute load; chronic uses `2 / (28 + 1)`
- ACWR calculated client-side from the 28-day session fetch -- no edge function needed
- RPE slider uses Radix `Slider` component (already installed) with custom styling for the color gradient and verbal anchors
- The `training_load` column is stored (not just computed) so aggregate queries stay fast
- Activity type is stored as text (not a DB enum) for flexibility -- validated on the frontend
- Mobile-first design: vertical RPE slider, stacked chart layout on small screens

