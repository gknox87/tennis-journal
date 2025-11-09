# Tennis-Specific Language & Icon Inventory

## Executive Summary

Comprehensive audit of all tennis-specific terminology, emojis, and icons across the codebase. This document identifies what needs to be updated to support true sport-agnostic UI.

## Findings by Category

### 1. ✅ Already Sport-Agnostic (No Action Needed)

#### Components with Dynamic Labels
- `StatsOverview.tsx` - Uses `sport.name` for journey label
- `AddMatch.tsx` - Uses `sport.terminology.matchLabel`
- `NotesSection.tsx` - Uses `sport.terminology.matchLabel`
- `Profile.tsx` - Uses `sport.name` and `sport.terminology`
- `MatchForm.tsx` - Uses `sport.terminology.opponentLabel` and dynamic venue labels

### 2. ⚠️ Tennis-Specific Terms Needing Updates

#### A. Court/Surface References (Tennis/Racket-Specific)

**File**: `src/components/match/MatchForm.tsx`
- **Line 32**: `const courtTypes = ["Hard", "Artificial Grass", "Clay", "Grass", "Carpet"]`
  - **Issue**: Hard-coded tennis court surfaces
  - **Fix**: Make sport-aware venue types

**File**: `src/pages/Profile.tsx`
- **Line 260**: `<span>{profileData.preferred_surface} Court</span>`
  - **Issue**: "Court" is tennis-specific
  - **Fix**: Use sport-aware venue label
- **Lines 324-327**: Court type dropdown (Hard, Clay, Grass, Carpet)
  - **Issue**: Tennis-only surfaces
  - **Fix**: Make sport-specific or generic "venue preference"

**File**: `src/pages/Landing.tsx`
- **Line 83**: `alt="Athlete reviewing Sports Journal insights courtside"`
- **Line 184**: `"whichever court you step on"`
- **Line 193**: `"before you hit the court"`
- **Line 211**: `"Bring match insights to the practice court"`
- **Line 278**: `"comes off the court more confident"`
- **Line 283**: `"It's like being courtside"`
- **Line 288**: `"results show on court"`
  - **Issue**: "Court" references throughout marketing copy
  - **Fix**: Use generic "venue" or "field of play"

#### B. Sets/Tiebreak References (Tennis-Specific Scoring)

**File**: `src/components/StatsOverview.tsx`
- **Lines 58-64**: "Sets Won" stat
- **Lines 66-72**: "Sets Lost" stat
- **Lines 74-80**: "Tiebreaks" stat
  - **Issue**: Tennis-specific scoring terminology
  - **Fix**: Make stats sport-aware based on scoring format

**File**: `src/integrations/supabase/types.ts` (from grep)
- Multiple references to "tiebreak" in database types
  - **Issue**: Database schema has tennis-specific fields
  - **Note**: May need conditional rendering in UI

### 3. 🎾 Tennis Emojis/Icons

**File**: `src/constants/sports.ts`
- Tennis sport icon: `"🎾"`
- Table Tennis: `"🏓"`
- Badminton: `"🏸"`
  - **Status**: ✅ Correct - sport-specific icons are appropriate

**File**: `src/components/match/MatchForm.tsx`
- **Line 119**: `const opponentPlaceholder = \`${sport.icon} Enter ${sport.terminology.opponentLabel.toLowerCase()}\``
  - **Status**: ✅ Already using sport.icon dynamically

### 4. 📊 Sport-Specific Stats (Need Metadata Extension)

#### Current Stats (Tennis-Focused)
From `StatsOverview.tsx`:
1. Win Rate - ✅ Universal
2. Total Matches - ✅ Universal
3. This Year - ✅ Universal
4. **Sets Won** - ⚠️ Tennis-specific
5. **Sets Lost** - ⚠️ Tennis-specific
6. **Tiebreaks** - ⚠️ Tennis-specific

#### Needed: Per-Sport Stat Descriptors

**Tennis/Racket Sports**:
- Sets won/lost
- Tiebreaks won
- Games won
- Aces (advanced)
- Break points (advanced)

**Running**:
- Personal bests
- Average pace
- Total distance
- Race placements

**Boxing/MMA**:
- Rounds won
- Knockouts
- Decisions
- Submissions (MMA)

**Swimming**:
- Personal bests by distance
- Average splits
- Events competed

## Detailed Action Items

### Priority 1: Critical UI Updates

#### 1.1 Make Court/Surface References Sport-Aware

**Profile.tsx** - Update surface display:
```typescript
// BEFORE (Line 260)
<span>{profileData.preferred_surface} Court</span>

// AFTER
<span>{profileData.preferred_surface} {sport.category === "racket" ? "Court" : "Venue"}</span>
```

**Profile.tsx** - Make surface selector sport-aware:
```typescript
// Add to sport metadata in constants/sports.ts
venueOptions?: string[]; // e.g., ["Hard Court", "Clay Court"] for tennis

// In Profile.tsx - conditional rendering
{sport.venueOptions && (
  <Select ...>
    {sport.venueOptions.map(venue => (
      <SelectItem value={venue}>{venue}</SelectItem>
    ))}
  </Select>
)}
```

**MatchForm.tsx** - Dynamic venue types:
```typescript
// BEFORE (Line 32)
const courtTypes = ["Hard", "Artificial Grass", "Clay", "Grass", "Carpet"];

// AFTER
const venueTypes = sport.venueOptions || [];
const venueLabel = sport.category === "racket" ? "Court Surface" : "Venue Type";
```

#### 1.2 Update Landing Page Copy

**Landing.tsx** - Replace court references:
```typescript
// Lines to update:
- Line 83: "courtside" → "during training"
- Line 184: "court you step on" → "venue you compete in"
- Line 193: "hit the court" → "compete"
- Line 211: "practice court" → "training venue"
- Line 278: "off the court" → "after competing"
- Line 283: "courtside" → "with them"
- Line 288: "on court" → "in competition"
```

### Priority 2: Stats System Enhancement

#### 2.1 Add Sport Stat Metadata

**New field in SportMetadata** (`src/types/sport.ts`):
```typescript
export interface SportMetadata {
  // ... existing fields
  stats: {
    primary: StatDescriptor[];    // Always shown
    secondary?: StatDescriptor[]; // Optional/advanced stats
  };
}

export interface StatDescriptor {
  id: string;                    // e.g., "sets_won", "personal_best"
  label: string;                 // e.g., "Sets Won", "Personal Best"
  description: string;           // e.g., "Winning sets", "Fastest time"
  icon: LucideIcon;             // Icon component
  color: string;                // Gradient color
  bgColor: string;              // Background gradient
  calculateFn?: string;         // Function name to calculate this stat
}
```

#### 2.2 Update StatsOverview Component

**StatsOverview.tsx** - Make stats dynamic:
```typescript
// BEFORE - Hard-coded stats array
const stats = [
  { title: "Sets Won", ... },
  { title: "Tiebreaks", ... }
];

// AFTER - Pull from sport metadata
const stats = sport.stats.primary.map(statDescriptor => ({
  title: statDescriptor.label,
  value: calculateStat(statDescriptor.id), // Dynamic calculation
  icon: statDescriptor.icon,
  color: statDescriptor.color,
  bgColor: statDescriptor.bgColor,
  description: statDescriptor.description
}));
```

### Priority 3: Database Field Handling

#### 3.1 Conditional Rendering for Tennis-Specific Fields

**Components** that use `court_type`, `tiebreaks`, `sets`:
- Show only for sports with matching score format
- Hide for non-racket sports

```typescript
// Example in MatchForm
{sport.category === "racket" && (
  <Select>
    <Label>{locationLabel}</Label>
    {/* Court surface selector */}
  </Select>
)}

{sport.defaultScoreFormat.type === "sets" && (
  <ScoreInput ... />
)}
```

## Proposed Sport Metadata Extensions

### Addition to `src/constants/sports.ts`

```typescript
// Tennis example
tennis: {
  // ... existing fields
  venueOptions: [
    "Hard Court",
    "Clay Court",
    "Grass Court",
    "Artificial Grass",
    "Carpet"
  ],
  stats: {
    primary: [
      {
        id: "win_rate",
        label: "Win Rate",
        description: "Your success rate",
        icon: Trophy,
        color: "from-yellow-400 to-orange-500",
        bgColor: "from-yellow-50 to-orange-50"
      },
      {
        id: "total_matches",
        label: "Total Matches",
        description: "Games played",
        icon: Star,
        color: "from-blue-500 to-purple-600",
        bgColor: "from-blue-50 to-purple-50"
      },
      {
        id: "sets_won",
        label: "Sets Won",
        description: "Winning sets",
        icon: CircleCheck,
        color: "from-emerald-400 to-teal-500",
        bgColor: "from-emerald-50 to-teal-50"
      },
      {
        id: "tiebreaks_won",
        label: "Tiebreaks",
        description: "Clutch wins",
        icon: Zap,
        color: "from-purple-500 to-indigo-600",
        bgColor: "from-purple-50 to-indigo-50"
      }
    ]
  }
}

// Running example
running_100m: {
  // ... existing fields
  venueOptions: ["Track", "Road", "Indoor"],
  stats: {
    primary: [
      {
        id: "personal_best",
        label: "Personal Best",
        description: "Fastest time",
        icon: Zap,
        color: "from-yellow-400 to-orange-500",
        bgColor: "from-yellow-50 to-orange-50"
      },
      {
        id: "total_races",
        label: "Total Races",
        description: "Races competed",
        icon: Star,
        color: "from-blue-500 to-purple-600",
        bgColor: "from-blue-50 to-purple-50"
      },
      {
        id: "avg_time",
        label: "Average Time",
        description: "Avg performance",
        icon: TrendingUp,
        color: "from-green-400 to-blue-500",
        bgColor: "from-green-50 to-blue-50"
      },
      {
        id: "podium_finishes",
        label: "Podiums",
        description: "Top 3 finishes",
        icon: Trophy,
        color: "from-purple-500 to-indigo-600",
        bgColor: "from-purple-50 to-indigo-50"
      }
    ]
  }
}

// Boxing example
boxing: {
  // ... existing fields
  venueOptions: ["Arena", "Gym", "Stadium"],
  stats: {
    primary: [
      {
        id: "win_rate",
        label: "Win Rate",
        description: "Your success rate",
        icon: Trophy,
        color: "from-yellow-400 to-orange-500",
        bgColor: "from-yellow-50 to-orange-50"
      },
      {
        id: "total_bouts",
        label: "Total Bouts",
        description: "Fights competed",
        icon: Star,
        color: "from-blue-500 to-purple-600",
        bgColor: "from-blue-50 to-purple-50"
      },
      {
        id: "knockouts",
        label: "Knockouts",
        description: "KO victories",
        icon: Zap,
        color: "from-red-500 to-orange-600",
        bgColor: "from-red-50 to-orange-50"
      },
      {
        id: "rounds_won",
        label: "Rounds Won",
        description: "Winning rounds",
        icon: CircleCheck,
        color: "from-emerald-400 to-teal-500",
        bgColor: "from-emerald-50 to-teal-50"
      }
    ]
  }
}
```

## Summary of Files Requiring Updates

### High Priority (User-Facing UI)
1. ✅ `src/components/StatsOverview.tsx` - Make stats sport-aware
2. ✅ `src/components/match/MatchForm.tsx` - Dynamic venue types
3. ✅ `src/pages/Profile.tsx` - Sport-aware surface/venue selector
4. ✅ `src/pages/Landing.tsx` - Replace "court" with generic terms

### Medium Priority (Type Definitions)
5. ✅ `src/types/sport.ts` - Add venueOptions and stats fields
6. ✅ `src/constants/sports.ts` - Add metadata for all 18 sports

### Low Priority (Helper Functions)
7. ✅ `src/utils/sportHelpers.ts` - Verify all helpers are sport-agnostic
8. ✅ Create stat calculation helpers

## Testing Checklist

### Per Sport Testing
- [ ] Tennis: Shows court types, sets/tiebreak stats
- [ ] Boxing: Shows venue types, round/KO stats
- [ ] Running: Shows venue types, PB/podium stats
- [ ] Table Tennis: Shows court types, game stats
- [ ] Swimming: Shows pool types, time stats

### UI Element Testing
- [ ] Profile surface selector adapts per sport
- [ ] Match form venue selector shows correct options
- [ ] Stats overview shows relevant metrics
- [ ] Landing page uses generic terminology
- [ ] No "court" references for non-racket sports

## Next Steps

1. **Create Sport Stat Descriptors** - Define stats for all 18 sports
2. **Update Type Definitions** - Add venueOptions and stats to SportMetadata
3. **Update Components** - Make Profile, MatchForm, StatsOverview sport-aware
4. **Update Landing Page** - Replace court references with generic terms
5. **Test Across Sports** - Verify each sport shows appropriate UI
6. **Documentation** - Update user guide with sport-specific features

## Notes

- **Database Schema**: `court_type`, `final_set_tiebreak` fields are tennis-specific but can remain in DB with conditional UI rendering
- **Video Analysis**: Already racket-sport specific (good design)
- **Backward Compatibility**: Existing tennis data will continue to work
- **Future Enhancement**: Add sport-specific advanced stats (e.g., ace count for tennis, split times for running)
