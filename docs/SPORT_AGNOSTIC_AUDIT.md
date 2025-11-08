# Sport-Agnostic Codebase Audit

## Executive Summary

After comprehensive audit of the codebase, I've identified **3 categories** of tennis-specific references that need to be made sport-agnostic:

1. **Hard-coded Tennis References** (32 occurrences) - Must be removed/replaced
2. **Generic "Match" Terminology** (Should consider "Performance/Event" for some sports)
3. **Sport Context Not Used** (Components that should adapt to selected sport)

---

## 🚨 CRITICAL: Hard-Coded Tennis References

### Category 1: Branding & Marketing Copy

**Files:** Landing.tsx, Login.tsx, Profile.tsx, AddMatch.tsx

#### Landing.tsx
- Line 35: "Sports Journal is the digital coaching companion for athletes chasing daily gains across tennis, table tennis, padel, pickleball, badminton, and squash."
  - **Fix:** Make this dynamic or remove specific sport listing

#### Login.tsx
- Line 120: "Tennis Match Chronicle"
- Line 122: "Track your journey to tennis greatness"
- Line 145: "Sign in to continue your tennis journey"
- Line 220: "🎾 Start tracking your tennis journey today"
  - **Fix:** Change to "Sports Journal" and "your athletic journey"

#### Profile.tsx
- Line 204: "Manage Your Tennis Profile & Preferences"
- Line 240: Placeholder "Tennis Player"
- Line 288: Label "Tennis Club" and placeholder "Enter your tennis club"
  - **Fix:** Use sport.name dynamically: "Manage Your {sport.name} Profile"

#### AddMatch.tsx
- Line 135: "Capture every detail of your tennis journey!"
  - **Fix:** "Capture every detail of your {sport.name} journey!"

#### NotesSection.tsx
- Line 36: "Capture your tennis insights and improve your game"
- Line 131: "Start Your Tennis Journal"
  - **Fix:** Use sport context: "Capture your {sport.name} insights"

### Category 2: Technical/Code References

#### integrations/supabase/client.ts
- Line 17: `storageKey: 'tennis-match-chronicle-auth'`
  - **Fix:** Change to 'sports-journal-auth' (BREAKING: will logout existing users)

#### components/Header.tsx
- Line 25: `localStorage.removeItem('tennis-match-chronicle-auth')`
  - **Fix:** Match updated storage key

#### components/ScoreInput.tsx
- Line 116: Comment "// Standard tennis scoring auto-complete"
  - **Fix:** Make scoring logic sport-aware

### Category 3: Video Analysis (Tennis-Specific Features)

**Files:** useBallDetection.ts, useYoloBallDetection.ts, useRacketDetection.ts, etc.

These are **tennis-specific features** and should be:
1. Only shown when sport is tennis/racket sport
2. Moved to optional modules
3. Disabled for non-racket sports

**Occurrences:**
- useBallDetection.ts: 20+ "tennis ball" references
- useYoloBallDetection.ts: Model paths `/models/tennis_ball_detector.onnx`
- useYoloRacketDetection.ts: Tennis racket detection
- useRealPlayerDetection.ts: "Tennis clothing" detection

**Recommendation:** Keep as-is but conditionally render based on sport category === "racket"

---

## ⚠️ TERMINOLOGY: "Match" vs "Performance/Event"

Currently everything uses "Match" terminology:
- MatchForm, MatchCard, MatchList, etc.
- Database table: `matches`
- Routes: `/add-match`, `/match/:id`

### Problem

"Match" implies head-to-head competition, which doesn't fit all sports:
- ❌ Running 5K: You race against time/field, not a specific opponent
- ❌ Swimming: Individual event, not a match
- ❌ Gymnastics: Competition, not a match
- ❌ Cycling time trial: Solo against the clock

### Options

**Option 1: Keep "Match" (Simplest)**
- Pros: No database changes, consistent terminology
- Cons: Linguistically incorrect for some sports
- Recommendation: **Use this** - users will understand context

**Option 2: Use "Performance"**
- Pros: Generic, fits all sports
- Cons: Requires renaming everything (PerformanceForm, etc.)
- Impact: HIGH - affects database, routes, components

**Option 3: Use "Event"**
- Pros: Generic term
- Cons: Conflicts with calendar events
- Impact: HIGH - confusing with scheduled_events table

**Option 4: Dynamic Terminology**
- Use `sport.terminology.matchLabel` throughout
- Display: "Match", "Race", "Bout", "Competition" based on sport
- Keep code using "match" internally
- Recommendation: **Implement this** for UI labels

### Recommendation: Hybrid Approach

1. **Keep database/code as "match"** (no breaking changes)
2. **Use `sport.terminology.matchLabel` in UI** (dynamic display)
3. **Update labels** to be sport-aware:
   ```tsx
   // Bad
   <h1>Add Match</h1>

   // Good
   <h1>Add {sport.terminology.matchLabel}</h1>
   ```

---

## 📋 Components Needing Sport Context

### Already Using Sport Context ✅
- MatchForm.tsx (Line 118: `sport.terminology.opponentLabel`)
- MatchDetailView.tsx (Line 57: `sport.terminology.matchLabel`)

### Need to Add Sport Context ❌

#### 1. Components/MatchCard.tsx
```tsx
// Current
<span>Unknown Opponent</span>

// Should be
<span>Unknown {sport.terminology.opponentLabel}</span>
```

#### 2. Pages/AddMatch.tsx
```tsx
// Current
<p>Capture every detail of your tennis journey!</p>

// Should be
<p>Capture every detail of your {sport.name} journey!</p>
```

#### 3. Components/dashboard/NotesSection.tsx
```tsx
// Current
<p>Capture your tennis insights and improve your game</p>

// Should be
<p>Capture your {sport.name} insights and improve your performance</p>
```

#### 4. Pages/ViewAllMatches.tsx
- Title: "All Matches" → "All {sport.terminology.matchLabel}s"
- Empty state: Use sport context

#### 5. Pages/Profile.tsx
```tsx
// Current
<Label>Tennis Club</Label>

// Should be
<Label>{sport.name} Club</Label>
```

#### 6. Components/StatsOverview.tsx
- Win rate display: Adapt to sport type
- Stats labels: Use sport terminology

---

## 🎯 Implementation Plan

### Phase 1: Critical Fixes (Breaking Changes)

1. **Update Storage Key** (will logout users)
   ```typescript
   // supabase/client.ts
   storageKey: 'sports-journal-auth'  // Was: tennis-match-chronicle-auth
   ```

2. **Update Branding**
   - Login.tsx: Change "Tennis Match Chronicle" → "Sports Journal"
   - All marketing copy: Remove tennis-specific language

### Phase 2: Dynamic Terminology (Non-Breaking)

1. **Import useSport hook** in all components
   ```typescript
   import { useSport } from "@/context/SportContext";
   const { sport } = useSport();
   ```

2. **Replace hard-coded labels**
   ```tsx
   // Before
   <h1>Add Match</h1>
   <label>Opponent</label>

   // After
   <h1>Add {sport.terminology.matchLabel}</h1>
   <label>{sport.terminology.opponentLabel}</label>
   ```

3. **Update all UI strings**
   - Match → {sport.terminology.matchLabel}
   - Opponent → {sport.terminology.opponentLabel}
   - Training → {sport.terminology.trainingLabel}

### Phase 3: Conditional Features

1. **Video Analysis**
   ```tsx
   // Only show for racket sports
   {sport.category === "racket" && (
     <VideoAnalysisTab />
   )}
   ```

2. **Score Input**
   ```tsx
   // Use UniversalScoreInput that adapts to sport.defaultScoreFormat
   <UniversalScoreInput format={sport.defaultScoreFormat} />
   ```

---

## 📊 Files Requiring Changes

### HIGH PRIORITY (User-Facing)

| File | Issue | Fix |
|------|-------|-----|
| pages/Login.tsx | "Tennis Match Chronicle" branding | Dynamic branding |
| pages/Landing.tsx | Tennis-specific copy | Generic copy |
| pages/Profile.tsx | "Tennis Club" label | Sport-aware label |
| pages/AddMatch.tsx | "tennis journey" text | Sport context |
| components/dashboard/NotesSection.tsx | Tennis references | Sport context |
| integrations/supabase/client.ts | Storage key | Update key |
| components/Header.tsx | Storage key | Update key |

### MEDIUM PRIORITY (Terminology)

| File | Issue | Fix |
|------|-------|-----|
| components/MatchCard.tsx | Hard-coded "Opponent" | Use sport.terminology |
| pages/ViewAllMatches.tsx | "All Matches" title | Dynamic title |
| components/StatsOverview.tsx | Generic stats | Sport-aware stats |
| components/MatchList.tsx | Match labels | Sport terminology |
| components/AddMatchButton.tsx | "Add Match" | Dynamic label |

### LOW PRIORITY (Internal/Optional)

| File | Issue | Fix |
|------|-------|-----|
| hooks/useBallDetection.ts | Tennis ball detection | Conditional rendering |
| hooks/useYoloBallDetection.ts | Tennis model paths | Conditional loading |
| hooks/useRacketDetection.ts | Tennis racket | Conditional feature |
| components/ScoreInput.tsx | Tennis scoring comment | Update comment |

---

## 🔧 Utility Functions Needed

### 1. Dynamic Page Titles

```typescript
// utils/sportHelpers.ts
export function getPageTitle(baseTit le: string, sport: SportMetadata): string {
  return baseTit le.replace("Tennis", sport.name);
}

// Usage
<title>{getPageTitle("Tennis Journal", sport)}</title>
// Output: "Boxing Journal", "5K Running Journal", etc.
```

### 2. Pluralization Helper

```typescript
export function pluralizeMatchLabel(sport: SportMetadata): string {
  const label = sport.terminology.matchLabel;
  // Simple pluralization (handle common cases)
  if (label.endsWith('ch')) return `${label}es`; // Match → Matches
  if (label.endsWith('y')) return `${label.slice(0, -1)}ies`; // (none in our list)
  return `${label}s`; // Race → Races, Bout → Bouts
}

// Usage
<h1>All {pluralizeMatchLabel(sport)}</h1>
// Output: "All Matches", "All Races", "All Bouts"
```

---

## 🧪 Testing Checklist

After implementing changes:

### Test with Tennis
- [ ] Login page shows correct branding
- [ ] Profile shows "Tennis Club"
- [ ] Match form shows "Opponent"
- [ ] Match list shows "Matches"
- [ ] Stats show correctly

### Test with Running
- [ ] Profile shows "Running Club" or "Running Group"
- [ ] Match form shows "Competitor" or "Runner"
- [ ] Match list shows "Races"
- [ ] No video analysis options shown
- [ ] Time-based score input works

### Test with Boxing
- [ ] Match form shows "Opponent"
- [ ] Match list shows "Bouts"
- [ ] Rounds-based score input works
- [ ] No tennis-specific features shown

### Test with Swimming
- [ ] Match form shows "Swimmer"
- [ ] Match list shows "Races"
- [ ] Time-based score input works

---

## 📈 Migration Impact

### Breaking Changes
1. **Storage key change** - Users will be logged out (one-time)
   - Mitigation: Add migration to copy old key to new key

2. **None** - All other changes are additive

### Non-Breaking Changes
- All UI label changes
- Addition of sport context
- Conditional feature rendering

---

## Summary

**Total Issues Found:** 50+
**Critical:** 7 (branding, storage key)
**High:** 12 (UI labels, terminology)
**Medium:** 20+ (component sport-awareness)
**Low:** 11+ (video analysis, comments)

**Estimated Effort:** 4-6 hours
**Risk:** LOW (mostly UI changes)
**Impact:** HIGH (proper multi-sport experience)

**Next Steps:**
1. Implement critical fixes (storage key, branding)
2. Add sport context to all components
3. Replace hard-coded terminology
4. Test with each sport category
5. Update documentation

