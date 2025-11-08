# All-Sport Support Implementation

## Overview

The Sports Journal has been extended from a tennis-only application to support 18+ individual sports across multiple categories. This implementation allows users to track matches, training, and progress in racket sports, athletics, combat sports, endurance events, and more.

## What Was Built

### 1. Extended Domain Models ✅

**Files Modified:**
- `src/types/sport.ts`

**Changes:**
- Added 4 new scoring types: `time`, `distance`, `rounds`, `numeric`
- Extended `ScoreFormat` union type to support all scoring methods
- Added `SportCategory` type with 10 categories
- Extended `SportMetadata` with new fields:
  - `isIndividual`: Flag for individual vs team sports
  - `isPublished`: Visibility control
  - `popularity`: Ranking for "Popular" section
  - `subcategory`: Optional grouping (e.g., "sprint" vs "distance")

**Scoring Types Supported:**
1. **Sets** - Tennis-style best-of-sets
2. **Rally** - Point-based with win-by margin (table tennis, badminton)
3. **Time** - mm:ss or hh:mm:ss for running/swimming
4. **Distance** - Meters, kilometers, feet for throws/jumps
5. **Rounds** - Boxing/MMA with knockout or points
6. **Numeric** - Gymnastics/diving with decimal scores

### 2. Dynamic Sport Catalogue ✅

**Files Created:**
- `supabase/migrations/20250108000000_all_sport_support.sql`

**Database Changes:**
- Extended `sports` table with 8 new columns
- Created `sports_catalogue` view for published sports
- Created `get_sports_by_category(category)` RPC function
- Created `get_popular_sports(limit)` RPC function
- Seeded 18 sports across 7 categories

**Seeded Sports:**
- Racket (6): Tennis, Table Tennis, Badminton, Padel, Pickleball, Squash
- Athletics (3): 100m Sprint, 400m, 5K Running
- Endurance (1): Marathon
- Aquatic (1): Freestyle Swimming
- Combat (3): Boxing, MMA, Judo
- Cycling (1): Road Cycling
- Gymnastics (1): Artistic Gymnastics

### 3. Onboarding UI Refresh ✅

**Files Modified:**
- `src/components/onboarding/SportGoalSelector.tsx`

**New Features:**
- **Search**: Real-time search by name, category, or subcategory
- **Category Tabs**: Browse by Popular, Racket, Athletics, Combat, etc.
- **Popular Section**: Top 8 sports by popularity shown first
- **Visual Enhancements**:
  - Sport icons (🎾🏃🥊🏊🚴🤸)
  - Subcategory labels
  - Selection highlights with ring
- **Responsive Grid**: 2-column on mobile, adaptable on desktop
- **Scrollable Lists**: Max-height with smooth scrolling for large categories

### 4. Sport Context Enhancements ✅

**Files Modified:**
- `src/context/SportContext.tsx`

**Files Created:**
- `src/utils/sportHelpers.ts`

**New Context Features:**
- `sportsByCategory`: Sports grouped by category
- `popularSports`: Top 8 sports by popularity
- `getSport(id)`: Lookup sport by ID
- **Local Storage Cache**: 1-hour TTL for fast loading
- Cache invalidation and refresh logic

**Helper Functions (30+):**
- `getSportsByCategory()` - Group sports
- `getPopularSports(limit)` - Get top N sports
- `formatScore(score, format)` - Format display
- `validateScoreInput(input, format)` - Validate entry
- `parseTimeToSeconds(time)` - Convert time strings
- `getScoringHint(format)` - Input helper text
- `searchSports(query)` - Search functionality
- `compareScores(s1, s2, format)` - Win/loss logic
- Category helpers: `getCategoryDisplayName()`, `getCategoryIcon()`
- Type guards: `isTimeBasedScoring()`, `isDistanceBasedScoring()`, etc.

### 5. Universal Score Input Component ✅

**Files Created:**
- `src/components/scoring/UniversalScoreInput.tsx`

**Components:**
- `UniversalScoreInput` - Main component, adapts to any ScoreFormat
- `TimeScoreInput` - Specialized time entry
- `DistanceScoreInput` - Specialized distance entry
- `NumericScoreInput` - Specialized numeric entry with decimals
- `RoundsScoreInput` - Specialized rounds/knockout entry

**Features:**
- Format-specific validation
- Real-time error messages
- Contextual placeholders and hints
- Appropriate input types (text/number)
- Step values for decimals
- Info icons with helpful tooltips

### 6. Documentation ✅

**Files Created:**
- `docs/SPORT_MANAGEMENT.md` - Complete management guide
- `docs/QA_CHECKLIST.md` - Comprehensive testing checklist
- `docs/ALL_SPORT_SUPPORT_README.md` - This file

**Documentation Includes:**
- Architecture overview
- Step-by-step guide to add new sports
- Scoring format reference
- Category guidelines
- AI context configuration
- Database function usage
- Troubleshooting guide
- Complete QA checklist (200+ items)

## File Structure

```
src/
├── types/
│   └── sport.ts                          # Extended type definitions
├── constants/
│   └── sports.ts                         # 18 sport definitions
├── utils/
│   └── sportHelpers.ts                   # 30+ helper functions
├── context/
│   └── SportContext.tsx                  # Enhanced context with caching
├── components/
│   ├── onboarding/
│   │   └── SportGoalSelector.tsx         # Refreshed UI with search/tabs
│   └── scoring/
│       └── UniversalScoreInput.tsx       # New scoring components
├── integrations/
│   └── supabase/
│       └── types.ts                      # Auto-generated from DB
supabase/
└── migrations/
    └── 20250108000000_all_sport_support.sql  # Database migration
docs/
├── ALL_SPORT_SUPPORT_README.md          # This file
├── SPORT_MANAGEMENT.md                  # Management guide
└── QA_CHECKLIST.md                      # Testing checklist
```

## Key Features

### 1. Category-Based Organization
Sports are organized into logical categories:
- **Racket Sports** 🎾 - Paddle/racket-based games
- **Athletics** 🏃 - Track and field events
- **Aquatic** 🏊 - Water-based sports
- **Combat** 🥊 - Fighting and martial arts
- **Endurance** 🏃‍♀️ - Long-distance events
- **Cycling** 🚴 - Road, track, and mountain biking
- **Gymnastics** 🤸 - Artistic, rhythmic events
- **Winter** ⛷️ - Snow and ice sports (framework ready)
- **Team** ⚽ - Team-based sports (framework ready)
- **Other** 🏅 - Miscellaneous sports

### 2. Flexible Scoring System
Each sport can use its natural scoring method:
- Tennis: Sets (6-4, 6-3)
- Running: Time (4:32, 1:23:45)
- Swimming: Time with decimals (23.45)
- Boxing: Rounds (KO Round 7, UD)
- Gymnastics: Numeric scores (15.75)
- Long Jump: Distance (7.52m)

### 3. Smart Input Validation
The `UniversalScoreInput` component provides:
- Format-specific placeholders
- Real-time validation
- Contextual error messages
- Appropriate keyboard types
- Helpful hints and tooltips

### 4. Performance Optimizations
- **Local Storage Caching**: Sports cached for 1 hour
- **Lazy Loading**: Categories loaded on-demand
- **Memoization**: Expensive computations cached
- **Efficient Searching**: Debounced search with indexed fields

### 5. AI-Ready Configuration
Each sport includes AI context:
```typescript
aiContext: {
  stylePrompt: "elite badminton",
  focusAreas: [
    "net play",
    "rear-court clears",
    "smash recovery"
  ]
}
```

This allows AI analysis to adapt to each sport's specific terminology and focus areas.

## How to Use

### For End Users

1. **Select Sport During Onboarding**
   - Browse popular sports or search by name
   - Switch between categories
   - See sport icons and subcategories

2. **Log Matches**
   - Score input adapts to your sport
   - Time-based sports show mm:ss format
   - Distance sports show units
   - Validation prevents invalid entries

3. **Review Progress**
   - Sport badges show on all cards
   - Scores formatted correctly
   - Win/loss calculated per sport rules

### For Developers

#### Adding a New Sport

```typescript
// 1. Add to src/constants/sports.ts
diving: {
  id: "diving",
  name: "Diving",
  shortName: "Diving",
  slug: "diving",
  category: "aquatic",
  isIndividual: true,
  isPublished: true,
  popularity: 60,
  defaultScoreFormat: numericScore,
  supportedScoreFormats: [numericScore],
  primaryColour: "#0096c7",
  accentColour: "#48cae4",
  icon: "🤿",
  terminology: {
    matchLabel: "Competition",
    opponentLabel: "Diver",
    trainingLabel: "Practice",
    highlightLabel: "Dive",
  },
  aiContext: {
    stylePrompt: "competitive diving",
    focusAreas: ["entry", "form", "degree of difficulty"],
  },
}

// 2. Insert into database (see SPORT_MANAGEMENT.md)
```

#### Using Score Helpers

```typescript
import { formatScore, validateScoreInput } from "@/utils/sportHelpers";

// Format a time-based score
const formatted = formatScore("252.5", {
  type: "time",
  format: "mm:ss",
  lowerIsBetter: true
}); // "4:12.50"

// Validate input
const isValid = validateScoreInput("4:32", {
  type: "time",
  format: "mm:ss",
  lowerIsBetter: true
}); // true
```

#### Using Sport Context

```typescript
import { useSport } from "@/context/SportContext";

function MyComponent() {
  const {
    sport,           // Current sport metadata
    sportsByCategory, // All sports grouped
    popularSports,    // Top 8 sports
    getSport         // Lookup function
  } = useSport();

  return (
    <div>
      <h1>{sport.name}</h1>
      <p>{sport.terminology.matchLabel}</p>
    </div>
  );
}
```

## Migration Guide

### Running the Migration

```bash
# If using Supabase CLI
supabase db push

# Or manually
psql -d your_database -f supabase/migrations/20250108000000_all_sport_support.sql
```

### Backwards Compatibility

✅ **Existing Data**: All existing tennis matches continue to work
✅ **User Preferences**: Preserved during migration
✅ **Score Formats**: Old formats automatically handled

### Post-Migration Steps

1. Verify all 18 sports appear in database:
   ```sql
   SELECT id, name, category FROM sports ORDER BY popularity DESC;
   ```

2. Test RPC functions:
   ```sql
   SELECT * FROM get_popular_sports(8);
   SELECT * FROM get_sports_by_category('racket');
   ```

3. Clear application cache (optional):
   ```javascript
   localStorage.removeItem('sports_catalogue_cache');
   ```

4. Run QA checklist (see `docs/QA_CHECKLIST.md`)

## Testing

### Unit Tests Needed
- [ ] Sport helper functions
- [ ] Score validation logic
- [ ] Time/distance parsing
- [ ] Score formatting
- [ ] Category grouping

### Integration Tests Needed
- [ ] Onboarding flow
- [ ] Match entry per sport type
- [ ] Training notes per sport
- [ ] AI analysis per sport

### E2E Tests Needed
- [ ] Complete user journey per sport
- [ ] Sport switching
- [ ] Search and filtering
- [ ] Cache invalidation

See complete checklist in `docs/QA_CHECKLIST.md` (200+ test cases)

## Known Limitations

1. **Team Sports**: Framework ready, but no team sports seeded yet
2. **Winter Sports**: Category defined, no sports added yet
3. **Custom Scoring**: Users cannot create custom scoring formats
4. **Multi-Sport**: Users can only select one primary sport
5. **Historical Data**: Migration doesn't convert old matches to new sports

## Future Enhancements

### Phase 2 (Planned)
- [ ] Team sports support (basketball, soccer, volleyball)
- [ ] Winter sports (skiing, skating, hockey)
- [ ] Multi-sport athlete profiles
- [ ] Sport-specific statistics and charts
- [ ] Custom scoring format builder

### Phase 3 (Proposed)
- [ ] Video analysis per sport type
- [ ] Sport-specific drill libraries
- [ ] Competition/league management
- [ ] Coach/athlete collaboration by sport
- [ ] Equipment tracking per sport

## Support & Troubleshooting

### Common Issues

**Sport not appearing in UI:**
- Check `is_published = true` in database
- Clear local storage cache
- Verify TypeScript constant exists

**Score validation failing:**
- Check format JSON in database matches TypeScript
- Verify validation logic supports the format
- See `sportHelpers.ts` for supported formats

**AI analysis incorrect:**
- Update `aiContext` for the sport
- Adjust `terminology` labels
- Check `stylePrompt` matches sport tone

See `docs/SPORT_MANAGEMENT.md` for detailed troubleshooting.

## Contributors

This implementation was built following the plan:
- Extended type system for multi-sport support
- Created flexible scoring architecture
- Implemented category-based organization
- Built universal input components
- Added caching and performance optimizations
- Comprehensive documentation and QA

## Version History

- **v2.0.0** (2025-01-08): Initial all-sport support
  - 18 sports across 7 categories
  - 6 scoring types
  - Dynamic catalogue with caching
  - Refreshed onboarding UI
  - Complete documentation

---

**For detailed management instructions, see:** `docs/SPORT_MANAGEMENT.md`
**For complete QA checklist, see:** `docs/QA_CHECKLIST.md`
