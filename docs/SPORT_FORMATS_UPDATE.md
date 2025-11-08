# Sport Formats Update - Implementation Guide

## Summary of Changes

Based on research, each sport now has multiple format options with correct defaults:

### Tennis
- **Default:** Best of 3 Sets (most common)
- **Options:**
  - Best of 3 Sets ✅
  - Best of 5 Sets (Grand Slam men's)
  - Pro Set (First to 8 games)
  - Best of 3 with Match Tiebreak (10-point tiebreak for 3rd set)

### Table Tennis
- **Default:** Best of 5 to 11 (most common club level)
- **Options:**
  - Best of 3 to 11 (casual)
  - Best of 5 to 11 ✅
  - Best of 7 to 11 (professional)

### Badminton
- **Default:** Best of 3 to 21 (standard)
- **Options:**
  - Best of 3 to 21 ✅
  - Single Game to 21 (practice)

### Squash
- **Default:** Best of 5 to 11 (competitive standard)
- **Options:**
  - Best of 3 to 11 (club level)
  - Best of 5 to 11 ✅

### Pickleball
- **Default:** Best of 3 to 11 (tournament standard)
- **Options:**
  - Best of 3 to 11 ✅
  - Single Game to 11 (recreational)
  - Single Game to 15 (some tournaments)
  - Single Game to 21 (rally scoring)

### Padel
- **Default:** Best of 3 Sets (standard)
- **Options:**
  - Best of 3 Sets ✅
  - Best of 5 Sets (rare, long tournaments)

### Boxing
- **Default:** 12 Rounds × 3 min (championship)
- **Options:**
  - 4 Rounds × 2 min (amateur/novice)
  - 6 Rounds × 3 min (professional, early career)
  - 8 Rounds × 3 min (professional, mid-level)
  - 10 Rounds × 3 min (professional, eliminator)
  - 12 Rounds × 3 min ✅ (championship)

### MMA
- **Default:** 3 Rounds × 5 min (standard)
- **Options:**
  - 3 Rounds × 5 min ✅ (non-title)
  - 5 Rounds × 5 min (title fights/main events)

## Implementation Files

### 1. Type Definitions (COMPLETED)
File: `src/types/sport.ts`
- ✅ Added `bestOf` field to rally format
- ✅ Added `label` field to all formats
- ✅ Added `matchTiebreak` to sets format
- ✅ Added `roundDuration` to rounds format
- ✅ Constrained `maxSets` to 3 | 5
- ✅ Constrained `totalRounds` to 3 | 4 | 5 | 6 | 8 | 10 | 12

### 2. Sport Constants (IN PROGRESS)
File: `src/constants/sports.ts`
- ✅ Created format constants for Tennis (4 formats)
- ✅ Created format constants for Table Tennis (3 formats)
- ✅ Created format constants for Badminton (2 formats)
- ✅ Created format constants for Squash (2 formats)
- ✅ Created format constants for Pickleball (4 formats)
- ✅ Created format constants for Padel (2 formats)
- ⏳ Need to add combat sport format constants
- ⏳ Need to update sport definitions to use new formats

### 3. Sport Definitions Update Needed

```typescript
tennis: {
  // ... existing fields
  defaultScoreFormat: tennisBestOf3,  // Changed from racketSetFormat
  supportedScoreFormats: [
    tennisBestOf3,
    tennisBestOf5,
    tennisProSet,
    tennisMatchTiebreak
  ],
},

table_tennis: {
  // ... existing fields
  defaultScoreFormat: tableTennisBestOf5,  // Changed! Was bestOf3 implicitly
  supportedScoreFormats: [
    tableTennisBestOf3,
    tableTennisBestOf5,
    tableTennisBestOf7
  ],
},
```

## Combat Sports Format Constants Needed

```typescript
// Boxing Formats
const boxing4Rounds: ScoreFormat = {
  type: "rounds",
  totalRounds: 4,
  roundDuration: 2,
  scoringMethod: "points",
  label: "4 Rounds × 2 min (Amateur)",
};

const boxing6Rounds: ScoreFormat = {
  type: "rounds",
  totalRounds: 6,
  roundDuration: 3,
  scoringMethod: "points",
  label: "6 Rounds × 3 min",
};

const boxing8Rounds: ScoreFormat = {
  type: "rounds",
  totalRounds: 8,
  roundDuration: 3,
  scoringMethod: "points",
  label: "8 Rounds × 3 min",
};

const boxing10Rounds: ScoreFormat = {
  type: "rounds",
  totalRounds: 10,
  roundDuration: 3,
  scoringMethod: "points",
  label: "10 Rounds × 3 min",
};

const boxing12Rounds: ScoreFormat = {
  type: "rounds",
  totalRounds: 12,
  roundDuration: 3,
  scoringMethod: "knockout",
  label: "12 Rounds × 3 min (Championship)",
};

// MMA Formats
const mma3Rounds: ScoreFormat = {
  type: "rounds",
  totalRounds: 3,
  roundDuration: 5,
  scoringMethod: "points",
  label: "3 Rounds × 5 min",
};

const mma5Rounds: ScoreFormat = {
  type: "rounds",
  totalRounds: 5,
  roundDuration: 5,
  scoringMethod: "points",
  label: "5 Rounds × 5 min (Title Fight)",
};
```

## UI Component Needed

Create `src/components/match/MatchFormatSelector.tsx`:

```typescript
interface MatchFormatSelectorProps {
  sport: SportMetadata;
  selectedFormat: ScoreFormat;
  onFormatChange: (format: ScoreFormat) => void;
}

export const MatchFormatSelector = ({
  sport,
  selectedFormat,
  onFormatChange
}: MatchFormatSelectorProps) => {
  if (sport.supportedScoreFormats.length <= 1) {
    return null; // No options to choose from
  }

  return (
    <div className="space-y-2">
      <Label>Match Format</Label>
      <Select
        value={JSON.stringify(selectedFormat)}
        onValueChange={(value) => onFormatChange(JSON.parse(value))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sport.supportedScoreFormats.map((format, index) => (
            <SelectItem
              key={index}
              value={JSON.stringify(format)}
            >
              {format.label || getFormatLabel(format)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
```

## Database Migration Needed

File: `supabase/migrations/20250108000002_add_format_flexibility.sql`

```sql
-- Add match_format column to matches table to store the specific format used
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS match_format JSONB DEFAULT NULL;

COMMENT ON COLUMN public.matches.match_format IS 'Specific scoring format used for this match (e.g., Best of 3, Best of 5). Falls back to sport default if NULL.';

-- Example: Update existing tennis matches to explicitly use Best of 3
UPDATE public.matches
SET match_format = '{"type":"sets","maxSets":3,"pointsPerGame":4,"tiebreaks":true,"label":"Best of 3 Sets"}'::jsonb
WHERE sport_id = 'tennis' AND match_format IS NULL;
```

## Helper Function Updates

Add to `src/utils/sportHelpers.ts`:

```typescript
/**
 * Get display label for a score format
 */
export function getFormatLabel(format: ScoreFormat): string {
  if (format.label) return format.label;

  switch (format.type) {
    case "sets":
      return `Best of ${format.maxSets} Sets${format.matchTiebreak ? ' (MT)' : ''}`;
    case "rally":
      return format.bestOf
        ? `Best of ${format.bestOf} to ${format.pointsToWin}`
        : `First to ${format.pointsToWin}`;
    case "rounds":
      return format.roundDuration
        ? `${format.totalRounds} Rounds × ${format.roundDuration} min`
        : `${format.totalRounds} Rounds`;
    case "games":
      return `Pro Set to ${format.gamesPerMatch}`;
    default:
      return "Standard Format";
  }
}

/**
 * Find format in supported formats by comparing key fields
 */
export function findMatchingFormat(
  format: ScoreFormat,
  supportedFormats: ScoreFormat[]
): ScoreFormat | undefined {
  return supportedFormats.find(f => {
    if (f.type !== format.type) return false;

    switch (f.type) {
      case "sets":
        return f.maxSets === format.maxSets &&
               f.matchTiebreak === format.matchTiebreak;
      case "rally":
        return f.pointsToWin === format.pointsToWin &&
               f.bestOf === format.bestOf;
      case "rounds":
        return f.totalRounds === format.totalRounds;
      default:
        return true;
    }
  });
}
```

## Match Entry Flow

1. User selects sport → Sport loads with default format
2. MatchFormatSelector appears if sport has multiple formats
3. User can keep default or choose alternative
4. Selected format is stored with match in `match_format` column
5. When viewing match, use `match_format` if present, else use sport default

## Testing Checklist

### Tennis
- [ ] Default shows "Best of 3 Sets"
- [ ] Can select "Best of 5 Sets"
- [ ] Can select "Pro Set"
- [ ] Can select "Match Tiebreak"
- [ ] Selected format saves with match
- [ ] Match display shows correct format

### Table Tennis
- [ ] Default shows "Best of 5 to 11"
- [ ] Can select "Best of 3 to 11"
- [ ] Can select "Best of 7 to 11"
- [ ] Format label displays correctly

### Boxing
- [ ] Default shows "12 Rounds (Championship)"
- [ ] Can select 4, 6, 8, 10 rounds
- [ ] Round duration shows in label

### MMA
- [ ] Default shows "3 Rounds × 5 min"
- [ ] Can select "5 Rounds × 5 min"
- [ ] Format saves correctly

## Benefits

1. **Accuracy:** Matches real-world sport variations
2. **Flexibility:** Users can log any match format they play
3. **Simplicity:** Default is always most common format
4. **Clarity:** Labels make format selection obvious
5. **Historical:** Can accurately represent Grand Slam vs regular matches

## Next Steps

1. ✅ Update type definitions
2. ✅ Create format constants
3. ⏳ Update all sport definitions in constants
4. ⏳ Create MatchFormatSelector component
5. ⏳ Add match_format column to database
6. ⏳ Update Match entry form
7. ⏳ Update Match display components
8. ⏳ Test all sport format selections

