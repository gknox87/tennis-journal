# Sport Enrichment & Language Cleanup - Implementation Summary

## Executive Summary

Successfully completed comprehensive audit and update of tennis-specific language/icons across the application, and enriched sport metadata with venue options and stat descriptors for future dashboard personalization.

## Status: ✅ Phase 1 Complete

### Completed Tasks

1. ✅ **Comprehensive Language Inventory** - Documented all tennis-specific terms
2. ✅ **Landing Page Updates** - Replaced court references with generic terms
3. ✅ **Type System Extension** - Added `venueOptions` and `stats` to SportMetadata
4. ✅ **Tennis Metadata Enrichment** - Added venue options and stat descriptors as example
5. ✅ **Build Verification** - Confirmed no TypeScript errors (build passed)

## Changes Made

### 1. Landing Page - Generic Terminology

**File**: [src/pages/Landing.tsx](../src/pages/Landing.tsx)

Replaced all tennis-specific court references:

| Before | After | Line |
|--------|-------|------|
| "courtside" | "during training" | 83 |
| "whichever court you step on" | "whatever sport you pursue" | 184 |
| "before you hit the court" | "before you compete" | 193 |
| "to the practice court" | "to your training" | 211 |
| "comes off the court" | "after each performance" | 278 |
| "like being courtside" | "like being there with them" | 283 |
| "results show on court" | "results speak for themselves" | 288 |

**Impact**: Landing page now reads naturally for all sports (boxing, running, swimming, etc.)

### 2. Type System - Sport Metadata Extension

**File**: [src/types/sport.ts](../src/types/sport.ts)

Added two new interfaces:

#### StatDescriptor Interface
```typescript
export interface StatDescriptor {
  id: string;                    // e.g., "sets_won", "personal_best", "knockouts"
  label: string;                 // e.g., "Sets Won", "Personal Best", "Knockouts"
  description: string;           // e.g., "Winning sets", "Fastest time", "KO victories"
  category: "universal" | "sport_specific";  // universal stats apply to all sports
}
```

#### Extended SportMetadata
```typescript
export interface SportMetadata {
  // ... existing fields
  venueOptions?: string[];       // Sport-specific venue types
  stats?: {
    primary: StatDescriptor[];   // Primary stats always shown in dashboard
    secondary?: StatDescriptor[]; // Optional/advanced stats for detailed views
  };
}
```

**Benefits**:
- Type-safe stat definitions
- Flexible venue/surface configuration per sport
- Future-proof for advanced analytics

### 3. Tennis Sport Metadata - Example Implementation

**File**: [src/constants/sports.ts](../src/constants/sports.ts)

Added venue options:
```typescript
venueOptions: [
  "Hard Court",
  "Clay Court",
  "Grass Court",
  "Artificial Grass",
  "Carpet Court"
]
```

Added stat descriptors:
```typescript
stats: {
  primary: [
    {
      id: "win_rate",
      label: "Win Rate",
      description: "Your success rate",
      category: "universal"
    },
    {
      id: "total_matches",
      label: "Total Matches",
      description: "Games played",
      category: "universal"
    },
    {
      id: "matches_this_year",
      label: "This Year",
      description: "Recent activity",
      category: "universal"
    },
    {
      id: "sets_won",
      label: "Sets Won",
      description: "Winning sets",
      category: "sport_specific"
    },
    {
      id: "sets_lost",
      label: "Sets Lost",
      description: "Learning moments",
      category: "sport_specific"
    },
    {
      id: "tiebreaks_won",
      label: "Tiebreaks",
      description: "Clutch wins",
      category: "sport_specific"
    }
  ]
}
```

## Documentation Created

### Comprehensive Inventory Document
**File**: [docs/TENNIS_LANGUAGE_INVENTORY.md](./TENNIS_LANGUAGE_INVENTORY.md)

Contains:
- Complete audit of all tennis-specific terms/icons
- Categorized findings (already fixed, needs updates, low priority)
- Detailed action items with code examples
- Proposed stat descriptors for all 18 sports
- Testing checklist per sport

### Key Findings from Inventory

#### ✅ Already Sport-Agnostic
- `StatsOverview.tsx` - Uses sport.name dynamically
- `AddMatch.tsx` - Uses sport.terminology
- `NotesSection.tsx` - Uses sport labels
- `Profile.tsx` - Uses sport context
- `MatchForm.tsx` - Has dynamic venue label logic

#### ⚠️ Still Needs Updates (Future Work)

**Profile Page - Venue Selector**:
- Currently shows hard-coded tennis court types
- **Fix**: Use `sport.venueOptions` if available
- Lines 324-327 in Profile.tsx

**Stats Overview - Sport-Aware Stats**:
- Currently shows hard-coded tennis stats (Sets Won, Tiebreaks)
- **Fix**: Pull stats from `sport.stats.primary`
- StatsOverview.tsx lines 32-81

**Match Form - Venue Types**:
- Has `courtTypes` array hard-coded
- **Fix**: Use `sport.venueOptions || []`
- MatchForm.tsx line 32

## Proposed Future Enhancements

### Phase 2: UI Component Updates

#### 2.1 Profile Venue Selector
```typescript
// In Profile.tsx - Make sport-aware
{sport.venueOptions && sport.venueOptions.length > 0 && (
  <div className="space-y-2">
    <Label>Preferred {sport.category === "racket" ? "Court Surface" : "Venue"}</Label>
    <Select ...>
      {sport.venueOptions.map(venue => (
        <SelectItem value={venue}>{venue}</SelectItem>
      ))}
    </Select>
  </div>
)}
```

#### 2.2 Stats Overview Component
```typescript
// In StatsOverview.tsx - Pull from sport metadata
const stats = sport.stats?.primary || defaultUniversalStats;

stats.map(statDescriptor => ({
  title: statDescriptor.label,
  value: calculateStat(statDescriptor.id, matchesData),
  description: statDescriptor.description,
  // ... other properties
}))
```

#### 2.3 Match Form Venue Selector
```typescript
// In MatchForm.tsx - Dynamic venue types
const venueTypes = sport.venueOptions || [];
const venueLabel = sport.category === "racket" ? "Court Surface" :
                   sport.category === "aquatic" ? "Pool Type" :
                   "Venue Type";
```

### Phase 3: Extend All Sports (Template)

Example stat descriptors for different sports:

#### Running (100m, 400m, Marathon)
```typescript
stats: {
  primary: [
    { id: "win_rate", label: "Win Rate", description: "Success rate", category: "universal" },
    { id: "total_races", label: "Total Races", description: "Races competed", category: "universal" },
    { id: "personal_best", label: "Personal Best", description: "Fastest time", category: "sport_specific" },
    { id: "podium_finishes", label: "Podiums", description: "Top 3 finishes", category: "sport_specific" },
    { id: "avg_time", label: "Average Time", description: "Avg performance", category: "sport_specific" }
  ]
}
```

#### Boxing
```typescript
stats: {
  primary: [
    { id: "win_rate", label: "Win Rate", description: "Success rate", category: "universal" },
    { id: "total_bouts", label: "Total Bouts", description: "Fights competed", category: "universal" },
    { id: "knockouts", label: "Knockouts", description: "KO victories", category: "sport_specific" },
    { id: "rounds_won", label: "Rounds Won", description: "Winning rounds", category: "sport_specific" },
    { id: "decisions", label: "Decisions", description: "Judge victories", category: "sport_specific" }
  ]
}
```

#### Swimming
```typescript
stats: {
  primary: [
    { id: "total_races", label: "Total Races", description: "Races competed", category: "universal" },
    { id: "personal_best", label: "Personal Best", description: "Fastest time", category: "sport_specific" },
    { id: "avg_split", label: "Avg Split", description: "Average split time", category: "sport_specific" },
    { id: "podium_finishes", label: "Podiums", description: "Top 3 finishes", category: "sport_specific" }
  ]
}
```

## Helper Functions Needed

### Stat Calculation Helper
```typescript
// src/utils/statCalculators.ts
export function calculateStat(
  statId: string,
  matches: Match[],
  sport: SportMetadata
): number | string {
  switch (statId) {
    case "win_rate":
      const wins = matches.filter(m => m.is_win).length;
      return matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;

    case "total_matches":
      return matches.length;

    case "matches_this_year":
      const thisYear = new Date().getFullYear();
      return matches.filter(m => new Date(m.date).getFullYear() === thisYear).length;

    case "sets_won":
      // Parse scores and count sets won
      return countSetsWon(matches);

    case "personal_best":
      // For time-based sports, find fastest time
      return findBestTime(matches);

    // ... more sport-specific calculations
  }
}
```

### Venue Display Helper
```typescript
// src/utils/sportHelpers.ts
export function getVenueLabel(sport: SportMetadata): string {
  switch (sport.category) {
    case "racket": return "Court Surface";
    case "aquatic": return "Pool Type";
    case "athletics": return "Track Type";
    case "combat": return "Venue Type";
    default: return "Venue";
  }
}
```

## Testing Recommendations

### Per-Sport Testing Matrix

| Sport | Venue Options | Primary Stats | Secondary Stats |
|-------|--------------|---------------|-----------------|
| **Tennis** | ✅ 5 court types | ✅ 6 stats defined | ⏳ Not yet |
| **Boxing** | ⏳ Arena, Gym, Stadium | ⏳ KO, Rounds Won | ⏳ Punch stats |
| **Running** | ⏳ Track, Road, Indoor | ⏳ PB, Podiums | ⏳ Split times |
| **Swimming** | ⏳ Olympic, Short Course | ⏳ PB, Avg Split | ⏳ Stroke stats |
| **Table Tennis** | ⏳ Indoor, Outdoor | ⏳ Games Won | ⏳ Rally length |

### UI Component Testing

- [ ] Profile venue selector shows correct options per sport
- [ ] Stats overview displays relevant metrics per sport
- [ ] Match form venue dropdown adapts to sport
- [ ] No "court" references appear for non-racket sports
- [ ] Empty venue options gracefully handled (no selector shown)

## Build Status

```
✓ 2767 modules transformed.
✓ built in 3.29s
```

**Result**: ✅ No TypeScript errors

## Migration Path for Remaining Sports

### Priority Order
1. **High Usage Sports** (Tennis, Table Tennis, Badminton) - ✅ Tennis done
2. **Combat Sports** (Boxing, MMA) - Clear stat needs (KO, rounds)
3. **Running** (100m, 400m, Marathon) - Time-based stats
4. **Swimming** - Similar to running, time + splits
5. **Other Racket Sports** - Can reuse tennis pattern

### Template for Adding Stats to Any Sport

```typescript
// In src/constants/sports.ts
{SPORT_NAME}: {
  // ... existing fields
  venueOptions: [
    // Sport-specific venue types
    // e.g., ["Track", "Road", "Indoor"] for running
  ],
  stats: {
    primary: [
      // Always include these 3 universal stats
      {
        id: "win_rate",
        label: "Win Rate",
        description: "Your success rate",
        category: "universal"
      },
      {
        id: "total_matches", // or "total_races", "total_bouts"
        label: "Total {MatchLabel}s",
        description: "Games played",
        category: "universal"
      },
      {
        id: "matches_this_year",
        label: "This Year",
        description: "Recent activity",
        category: "universal"
      },
      // Add 2-4 sport-specific stats
      {
        id: "{sport_specific_stat}",
        label: "{Stat Label}",
        description: "{Description}",
        category: "sport_specific"
      }
    ]
  }
}
```

## Files Reference

### Modified Files
- ✅ [src/pages/Landing.tsx](../src/pages/Landing.tsx) - Removed court references
- ✅ [src/types/sport.ts](../src/types/sport.ts) - Added StatDescriptor and metadata fields
- ✅ [src/constants/sports.ts](../src/constants/sports.ts) - Extended tennis with venues + stats

### Documentation Created
- ✅ [docs/TENNIS_LANGUAGE_INVENTORY.md](./TENNIS_LANGUAGE_INVENTORY.md) - Complete audit
- ✅ [docs/SPORT_ENRICHMENT_SUMMARY.md](./SPORT_ENRICHMENT_SUMMARY.md) - This file

### Files Analyzed (Already Sport-Agnostic)
- ✅ [src/components/StatsOverview.tsx](../src/components/StatsOverview.tsx) - Uses sport.name
- ✅ [src/components/match/MatchForm.tsx](../src/components/match/MatchForm.tsx) - Has venue label logic
- ✅ [src/pages/Profile.tsx](../src/pages/Profile.tsx) - Uses sport context

### Files Needing Future Updates
- ⏳ [src/pages/Profile.tsx](../src/pages/Profile.tsx):324-327 - Make venue selector use sport.venueOptions
- ⏳ [src/components/StatsOverview.tsx](../src/components/StatsOverview.tsx):32-81 - Pull stats from sport.stats
- ⏳ [src/components/match/MatchForm.tsx](../src/components/match/MatchForm.tsx):32 - Use sport.venueOptions

## Summary

### What's Done ✅
1. **Language Audit**: Complete inventory of all tennis-specific terms
2. **Landing Page**: All court references replaced with generic terms
3. **Type System**: Extended with venueOptions and stats support
4. **Tennis Metadata**: Enriched with venue options and stat descriptors as example
5. **Build**: Verified no TypeScript errors

### What's Next ⏳
1. **Update Profile**: Make venue selector use sport.venueOptions
2. **Update StatsOverview**: Pull stats from sport.stats.primary
3. **Update MatchForm**: Use sport.venueOptions for venue dropdown
4. **Extend All Sports**: Add venue options and stats to remaining 17 sports
5. **Create Stat Calculators**: Helper functions to compute sport-specific stats

### Impact
- ✅ Landing page now sport-agnostic (no court references)
- ✅ Type system ready for sport-specific stats and venues
- ✅ Tennis metadata serves as template for other sports
- ✅ Foundation in place for personalized dashboards
- ✅ No breaking changes - backward compatible

The app is now prepared for sport-specific stat dashboards and venue preferences. Next phase is implementing the UI components to use this new metadata.
