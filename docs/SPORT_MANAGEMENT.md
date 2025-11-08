# Sport Management Documentation

This document describes how to add, update, and manage sports in the Sports Journal application.

## Overview

The Sports Journal now supports multiple individual sports across various categories:
- **Racket Sports**: Tennis, Table Tennis, Badminton, Padel, Pickleball, Squash
- **Athletics**: Sprints (100m, 400m), Distance Running (5K)
- **Endurance**: Marathon
- **Aquatic**: Swimming (Freestyle)
- **Combat**: Boxing, MMA, Judo
- **Cycling**: Road Cycling
- **Gymnastics**: Artistic Gymnastics

## Architecture

### 1. Domain Models (`src/types/sport.ts`)

The core type definitions include:

```typescript
export type ScoreFormat =
  | { type: "sets"; maxSets: number; pointsPerGame: number; tiebreaks: boolean }
  | { type: "rally"; pointsToWin: number; winBy: number }
  | { type: "time"; format: "mm:ss" | "hh:mm:ss"; lowerIsBetter: boolean }
  | { type: "distance"; unit: "m" | "km" | "mi" | "ft"; higherIsBetter: boolean }
  | { type: "rounds"; totalRounds: number; scoringMethod: "points" | "knockout" }
  | { type: "numeric"; unit: string; higherIsBetter: boolean; decimals?: number };

export interface SportMetadata {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  category: SportCategory;
  subcategory?: string;
  isIndividual: boolean;
  isPublished: boolean;
  popularity?: number;
  defaultScoreFormat: ScoreFormat;
  supportedScoreFormats: ScoreFormat[];
  primaryColour: string;
  accentColour: string;
  icon: string;
  terminology: {...};
  aiContext: {...};
}
```

### 2. Sport Catalogue (`src/constants/sports.ts`)

This file contains the hardcoded sport definitions that are used as fallbacks and for type safety.

### 3. Database Schema

The Supabase `sports` table includes:
- `id`: Unique identifier (matches TypeScript constant)
- `name`: Full display name
- `short_name`: Abbreviated name
- `slug`: URL-friendly identifier
- `category`: Sport category (racket, athletics, etc.)
- `subcategory`: Optional subcategory
- `is_individual`: Boolean flag for individual vs team
- `is_published`: Whether the sport is visible to users
- `popularity`: Numeric ranking (higher = more popular)
- `scoring_format`: JSONB containing the ScoreFormat
- `icon_url`: Emoji or icon identifier
- `primary_colour`: Hex color code
- `accent_colour`: Hex color code
- `terminology`: JSONB with sport-specific terms
- `ai_context`: JSONB with AI prompt configuration

### 4. Helper Functions (`src/utils/sportHelpers.ts`)

Utility functions for:
- Grouping sports by category
- Getting popular sports
- Formatting scores based on type
- Validating score inputs
- Searching sports
- Time/distance conversions

## Adding a New Sport

### Step 1: Add to TypeScript Constants

Edit `src/constants/sports.ts` and add your sport definition:

```typescript
new_sport: {
  id: "new_sport",
  name: "New Sport",
  shortName: "New Sport",
  slug: "new-sport",
  category: "other", // or appropriate category
  isIndividual: true,
  isPublished: true,
  popularity: 50,
  defaultScoreFormat: numericScore, // or appropriate format
  supportedScoreFormats: [numericScore],
  primaryColour: "#000000",
  accentColour: "#ffffff",
  icon: "🏅",
  terminology: {
    matchLabel: "Competition",
    opponentLabel: "Competitor",
    trainingLabel: "Practice",
    highlightLabel: "Key Moment",
  },
  aiContext: {
    stylePrompt: "competitive new sport",
    focusAreas: ["focus area 1", "focus area 2", "focus area 3"],
  },
},
```

### Step 2: Add to Database

Run an SQL insert against your Supabase database:

```sql
INSERT INTO public.sports (
  id, name, short_name, slug, category, is_individual, is_published, popularity,
  scoring_format, icon_url, primary_colour, accent_colour, terminology, ai_context
) VALUES (
  'new_sport',
  'New Sport',
  'New Sport',
  'new-sport',
  'other',
  true,
  true,
  50,
  '{"type":"numeric","unit":"points","higherIsBetter":true,"decimals":2}'::jsonb,
  '🏅',
  '#000000',
  '#ffffff',
  '{"matchLabel":"Competition","opponentLabel":"Competitor","trainingLabel":"Practice","highlightLabel":"Key Moment"}'::jsonb,
  '{"stylePrompt":"competitive new sport","focusAreas":["focus area 1","focus area 2","focus area 3"]}'::jsonb
);
```

### Step 3: Update Type Definitions (if needed)

If adding a new category, update the `SportCategory` type in `src/types/sport.ts`:

```typescript
export type SportCategory =
  | "racket"
  | "athletics"
  // ... existing categories
  | "new_category";
```

And add display name/icon in `src/utils/sportHelpers.ts`:

```typescript
export function getCategoryDisplayName(category: SportCategory): string {
  const displayNames: Record<SportCategory, string> = {
    // ... existing categories
    new_category: "New Category",
  };
  return displayNames[category] || category;
}

export function getCategoryIcon(category: SportCategory): string {
  const icons: Record<SportCategory, string> = {
    // ... existing icons
    new_category: "🎯",
  };
  return icons[category] || "🏅";
}
```

## Updating an Existing Sport

### Update Popularity

```sql
UPDATE public.sports
SET popularity = 95
WHERE id = 'tennis';
```

### Retire a Sport

```sql
UPDATE public.sports
SET is_published = false
WHERE id = 'old_sport';
```

### Change Scoring Format

```sql
UPDATE public.sports
SET scoring_format = '{"type":"rally","pointsToWin":15,"winBy":2}'::jsonb
WHERE id = 'sport_id';
```

## Scoring Types Reference

### Sets (Tennis-style)
```json
{
  "type": "sets",
  "maxSets": 3,
  "pointsPerGame": 4,
  "tiebreaks": true
}
```

### Rally (Table Tennis, Badminton)
```json
{
  "type": "rally",
  "pointsToWin": 21,
  "winBy": 2
}
```

### Time (Running, Swimming)
```json
{
  "type": "time",
  "format": "mm:ss",
  "lowerIsBetter": true
}
```

### Distance (Throws, Jumps)
```json
{
  "type": "distance",
  "unit": "m",
  "higherIsBetter": true
}
```

### Rounds (Boxing, MMA)
```json
{
  "type": "rounds",
  "totalRounds": 12,
  "scoringMethod": "knockout"
}
```

### Numeric (Gymnastics, Diving)
```json
{
  "type": "numeric",
  "unit": "points",
  "higherIsBetter": true,
  "decimals": 2
}
```

## Category Guidelines

### Popular Sports
The top 8 sports by popularity are shown in the "Popular" tab during onboarding. Adjust popularity scores to control this ordering.

### Category Organization
- **racket**: All racket/paddle sports
- **athletics**: Track events (sprints, middle distance)
- **endurance**: Long-distance events (marathon, ultra)
- **aquatic**: Swimming, diving, water polo
- **combat**: Boxing, MMA, wrestling, martial arts
- **cycling**: Road, track, mountain biking
- **gymnastics**: Artistic, rhythmic, trampoline
- **winter**: Skiing, skating, snowboarding
- **team**: Team-based sports
- **other**: Miscellaneous individual sports

## AI Context Configuration

The `aiContext` field customizes AI analysis for each sport:

```json
{
  "stylePrompt": "high-performance tennis",
  "focusAreas": [
    "serve consistency",
    "return depth",
    "baseline aggression"
  ]
}
```

- **stylePrompt**: Sets the tone for AI-generated analysis
- **focusAreas**: Key technical areas the AI should emphasize

## Cache Management

Sports are cached in local storage with a 1-hour TTL. To force a refresh:

```javascript
localStorage.removeItem('sports_catalogue_cache');
```

## Database Functions

### Get Sports by Category
```sql
SELECT * FROM get_sports_by_category('racket');
```

### Get Popular Sports
```sql
SELECT * FROM get_popular_sports(8);
```

### Get Published Sports
```sql
SELECT * FROM sports_catalogue;
```

## Testing New Sports

1. Add the sport to both TypeScript and database
2. Test onboarding flow - verify sport appears in correct category
3. Test match entry - verify score input works with the sport's format
4. Test AI analysis - verify terminology and prompts are appropriate
5. Test filtering and search functionality
6. Verify sport badge displays correctly in UI

## Troubleshooting

### Sport not appearing in UI
- Check `is_published = true` in database
- Verify cache hasn't expired
- Ensure TypeScript constant matches database ID

### Score input validation failing
- Verify `scoring_format` JSON is valid
- Check format type is supported by `UniversalScoreInput`
- Ensure validation logic in `sportHelpers.ts` handles the format

### AI analysis incorrect
- Update `aiContext.stylePrompt` for better tone
- Adjust `aiContext.focusAreas` to match sport specifics
- Update `terminology` for sport-specific labels

## Migration Notes

The migration `20250108000000_all_sport_support.sql` includes:
- Schema updates
- Initial sport seeding
- View and function creation
- Permission grants

To apply:
```bash
supabase db push
```

Or manually run the migration SQL against your database.
