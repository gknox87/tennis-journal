# Migration Verification Guide

## ✅ Migration Applied Successfully

The migration `20250108000000_all_sport_support.sql` has been applied to your Supabase project `pnlocibettgyqyttegcu`.

## Step-by-Step Verification

### 1. Verify Database Schema

Run these queries in your Supabase SQL Editor:

#### Check that new columns exist
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sports'
ORDER BY ordinal_position;
```

**Expected columns:**
- `id` (text)
- `created_at` (timestamp)
- `name` (text)
- `slug` (text)
- `short_name` (text)
- `category` (text)
- `scoring_format` (jsonb)
- `icon_url` (text)
- `is_individual` (boolean) ✨ NEW
- `is_published` (boolean) ✨ NEW
- `popularity` (integer) ✨ NEW
- `subcategory` (text) ✨ NEW
- `primary_colour` (text) ✨ NEW
- `accent_colour` (text) ✨ NEW
- `terminology` (jsonb) ✨ NEW
- `ai_context` (jsonb) ✨ NEW

#### Check indexes were created
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'sports';
```

**Expected indexes:**
- `idx_sports_category` on `category`
- `idx_sports_published` on `is_published`
- `idx_sports_popularity` on `popularity DESC`

### 2. Verify Sports Data

#### Count total sports
```sql
SELECT COUNT(*) as total_sports FROM sports;
```
**Expected:** 18 sports

#### Count by category
```sql
SELECT category, COUNT(*) as count
FROM sports
GROUP BY category
ORDER BY count DESC;
```

**Expected:**
- racket: 6 (Tennis, Table Tennis, Badminton, Padel, Pickleball, Squash)
- combat: 3 (Boxing, MMA, Judo)
- athletics: 3 (100m, 400m, 5K)
- endurance: 1 (Marathon)
- aquatic: 1 (Swimming)
- cycling: 1 (Road Cycling)
- gymnastics: 1 (Gymnastics)

#### View all sports ordered by popularity
```sql
SELECT id, name, category, subcategory, popularity, is_published
FROM sports
ORDER BY popularity DESC;
```

**Expected top 5:**
1. Tennis (100)
2. Badminton (95)
3. MMA (90)
4. Table Tennis (90)
5. Running 5K (85)

### 3. Test Database Functions

#### Test get_popular_sports()
```sql
SELECT id, name, popularity
FROM get_popular_sports(8);
```

**Expected:** Returns 8 most popular sports in descending order

#### Test get_sports_by_category() - All sports
```sql
SELECT id, name, category
FROM get_sports_by_category(NULL);
```

**Expected:** Returns all 18 published sports

#### Test get_sports_by_category() - Specific category
```sql
SELECT id, name, category
FROM get_sports_by_category('racket');
```

**Expected:** Returns 6 racket sports

#### Test get_sports_by_category() - Combat sports
```sql
SELECT id, name, category
FROM get_sports_by_category('combat');
```

**Expected:** Returns 3 combat sports (Boxing, MMA, Judo)

#### Test sports_catalogue view
```sql
SELECT id, name, category, popularity
FROM sports_catalogue
ORDER BY popularity DESC
LIMIT 10;
```

**Expected:** Returns top 10 published sports with all metadata

### 4. Verify Scoring Formats

#### Check time-based scoring (Running)
```sql
SELECT id, name, scoring_format
FROM sports
WHERE id IN ('running_100m', 'running_5k', 'running_marathon');
```

**Expected format examples:**
- `running_100m`: `{"type":"time","format":"mm:ss","lowerIsBetter":true}`
- `running_5k`: `{"type":"time","format":"hh:mm:ss","lowerIsBetter":true}`

#### Check numeric scoring (Gymnastics, Judo)
```sql
SELECT id, name, scoring_format
FROM sports
WHERE id IN ('gymnastics_artistic', 'judo');
```

**Expected format:**
- `{"type":"numeric","unit":"points","higherIsBetter":true,"decimals":2}`

#### Check rounds scoring (Boxing, MMA)
```sql
SELECT id, name, scoring_format
FROM sports
WHERE id IN ('boxing', 'mma');
```

**Expected formats:**
- Boxing: `{"type":"rounds","totalRounds":12,"scoringMethod":"knockout"}`
- MMA: `{"type":"rounds","totalRounds":3,"scoringMethod":"points"}`

### 5. Check AI Context and Terminology

```sql
SELECT id, name, terminology, ai_context
FROM sports
WHERE id = 'tennis';
```

**Expected:**
- `terminology`: Contains matchLabel, opponentLabel, trainingLabel, highlightLabel
- `ai_context`: Contains stylePrompt and focusAreas array

### 6. Test Application Build

Run these commands in your terminal:

```bash
cd /Users/gervisknox/Desktop/1.\ CURSOR\ /Sports\ Journal/tennis-journal

# Install any missing dependencies
npm install

# Build the application
npm run build
```

**Expected:** Build completes without TypeScript errors

### 7. Test Development Server

```bash
# Start dev server
npm run dev
```

**Then test in browser:**

1. **Navigate to onboarding/sport selection**
   - [ ] Search input appears
   - [ ] "Popular" tab shows 8 sports
   - [ ] Category tabs appear (racket, athletics, combat, etc.)
   - [ ] Sport icons display correctly
   - [ ] Can select a sport

2. **Test search functionality**
   - [ ] Search "tennis" - shows tennis
   - [ ] Search "running" - shows 100m, 400m, 5K, Marathon
   - [ ] Search "combat" - shows Boxing, MMA, Judo
   - [ ] Empty search shows all sports

3. **Test category filtering**
   - [ ] Click "racket" tab - shows 6 sports
   - [ ] Click "athletics" tab - shows 3 sports
   - [ ] Click "combat" tab - shows 3 sports
   - [ ] Sport selection persists when switching tabs

### 8. Verify Local Storage Cache

Open browser DevTools Console and run:

```javascript
// Check cache exists
const cache = localStorage.getItem('sports_catalogue_cache');
console.log('Cache exists:', !!cache);

// View cache contents
if (cache) {
  const data = JSON.parse(cache);
  console.log('Cached sports count:', data.sports.length);
  console.log('Cache timestamp:', new Date(data.timestamp));
}

// Clear cache to test refresh
localStorage.removeItem('sports_catalogue_cache');
location.reload(); // Should rebuild cache
```

### 9. Test Sport Context

In React DevTools or browser console:

```javascript
// After app loads, check context
// Should show current sport and metadata
```

## Quick Verification Checklist

Copy this checklist and mark off each item:

### Database ✅
- [ ] All 16 columns present in sports table
- [ ] 3 indexes created (category, is_published, popularity)
- [ ] 18 sports seeded
- [ ] All categories represented (7 total)
- [ ] `get_popular_sports()` function works
- [ ] `get_sports_by_category()` function works
- [ ] `sports_catalogue` view accessible

### Application ✅
- [ ] No TypeScript compilation errors
- [ ] Build completes successfully
- [ ] Dev server starts without errors
- [ ] No console errors in browser

### UI Functionality ✅
- [ ] Sport selector shows all sports
- [ ] Search works
- [ ] Category tabs work
- [ ] Popular sports shows 8 items
- [ ] Sport icons display
- [ ] Can select and change sports
- [ ] Selection persists

### Data Integrity ✅
- [ ] All sports have proper metadata
- [ ] Scoring formats valid JSON
- [ ] Terminology populated
- [ ] AI context populated
- [ ] Colors in valid hex format
- [ ] Popularity scores set

## Troubleshooting

### If sports don't appear in UI:

1. Check browser console for errors
2. Verify cache: `localStorage.removeItem('sports_catalogue_cache')`
3. Check that TypeScript constants match database IDs
4. Ensure `is_published = true` in database

### If search doesn't work:

1. Check `sportHelpers.ts` is imported correctly
2. Verify search function exists in utils
3. Check console for errors

### If categories are missing:

1. Verify all sports have `category` field populated
2. Check `getSportsByCategory()` function
3. Ensure categories defined in TypeScript types

### If scoring validation fails:

1. Check `scoring_format` JSON in database is valid
2. Verify format matches TypeScript `ScoreFormat` type
3. Test validation in `sportHelpers.ts`

## Success Criteria

Your migration is successful if:

✅ All database queries return expected results
✅ Application builds without errors
✅ UI shows all 18 sports organized by category
✅ Search and filtering work correctly
✅ Sport selection and context update properly
✅ No console errors in browser

## Next Steps After Verification

Once everything is verified:

1. **Clear any test data** from development
2. **Test end-to-end flows** (onboarding → match entry → viewing)
3. **Run full QA checklist** (see `docs/QA_CHECKLIST.md`)
4. **Document any issues** found during testing
5. **Deploy to production** when ready

## Need Help?

If any verification step fails:

1. Check the error message carefully
2. Review `docs/SPORT_MANAGEMENT.md` for troubleshooting
3. Check Supabase logs for database errors
4. Review browser console for frontend errors
5. Compare actual vs expected results from queries above

---

**Migration Applied:** 2025-01-08
**Supabase Project:** pnlocibettgyqyttegcu (tennis journal)
**Migration File:** `20250108000000_all_sport_support.sql`
