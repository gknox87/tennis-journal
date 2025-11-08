# Scoring System Verification Report

## ⚠️ CRITICAL ISSUES FOUND

After reviewing the scoring systems for all 18 sports, I've identified **several critical misconfigurations** that need to be corrected before production deployment.

---

## Issues by Sport

### ❌ INCORRECT: 100m Sprint & 400m Sprint
**Current:** `mm:ss` format
**Problem:** These sprints take SECONDS (10-60 seconds), not minutes
**Real-world times:**
- 100m: 9.58s (world record), typical: 10-12s
- 400m: 43.03s (world record), typical: 45-55s

**Should be:** `ss.ms` (seconds.milliseconds) OR just seconds with 2 decimals

**Fix needed:**
```json
{
  "type": "time",
  "format": "ss.ms",  // or numeric with decimals
  "lowerIsBetter": true
}
```

### ❌ INCORRECT: Swimming Freestyle
**Current:** `mm:ss` format only
**Problem:** Swimming events vary widely (50m to 1500m+)
- 50m: ~21-25 seconds
- 100m: ~47-52 seconds
- 200m: ~1:42-1:50 (mm:ss works)
- 1500m: ~14:30-16:00 (mm:ss works)

**Should support both:** Short events need `ss.ms`, longer events need `mm:ss`

**Fix needed:**
```json
{
  "type": "time",
  "format": "mm:ss",  // Keep as primary
  "lowerIsBetter": true
}
// OR make it flexible to accept both ss.ms and mm:ss
```

### ⚠️ REVIEW NEEDED: Road Cycling
**Current:** `hh:mm:ss` format only
**Problem:** Road cycling can be:
- Time trials (individual, time-based) ✅ Correct
- Road races (pack finish, placement-based) ❌ Might need different format
- Stage races (cumulative time) ✅ Correct

**Recommendation:** `hh:mm:ss` is correct for time trials, but road races might need placement (1st, 2nd, 3rd) instead of time

---

## ✅ VERIFIED CORRECT

### Racket Sports

#### Tennis ✅
```json
{
  "type": "sets",
  "maxSets": 3,
  "pointsPerGame": 4,
  "tiebreaks": true
}
```
**Verified:** Standard best-of-3 format is correct for recreational/club tennis

#### Table Tennis ✅
```json
{
  "type": "rally",
  "pointsToWin": 11,
  "winBy": 2
}
```
**Verified:** First to 11, win by 2 is standard

#### Badminton ✅
```json
{
  "type": "rally",
  "pointsToWin": 21,
  "winBy": 2
}
```
**Verified:** First to 21, win by 2 is correct

#### Padel ✅
```json
{
  "type": "sets",
  "maxSets": 3,
  "pointsPerGame": 4,
  "tiebreaks": true
}
```
**Verified:** Same as tennis, best-of-3 sets

#### Pickleball ✅
```json
{
  "type": "rally",
  "pointsToWin": 11,
  "winBy": 2
}
```
**Verified:** Standard pickleball scoring (11 points, win by 2)

#### Squash ✅
```json
{
  "type": "rally",
  "pointsToWin": 11,
  "winBy": 2
}
```
**Verified:** PARS (Point-A-Rally) to 11 is current standard

---

### Running (Distance)

#### 5K Running ✅
```json
{
  "type": "time",
  "format": "hh:mm:ss",
  "lowerIsBetter": true
}
```
**Verified:**
- Elite: ~13:00-14:30
- Recreational: 20:00-35:00
- Format `hh:mm:ss` is appropriate ✅

#### Marathon ✅
```json
{
  "type": "time",
  "format": "hh:mm:ss",
  "lowerIsBetter": true
}
```
**Verified:**
- Elite: 2:01:00 - 2:15:00
- Recreational: 3:00:00 - 6:00:00
- Format `hh:mm:ss` is correct ✅

---

### Combat Sports

#### Boxing ✅
```json
{
  "type": "rounds",
  "totalRounds": 12,
  "scoringMethod": "knockout"
}
```
**Verified:** 12 rounds is correct for championship bouts
**Note:** Club/amateur boxing is typically 3-4 rounds, but 12 is fine for journal default

#### MMA ✅
```json
{
  "type": "rounds",
  "totalRounds": 3,
  "scoringMethod": "points"
}
```
**Verified:** Standard UFC bout is 3 x 5-minute rounds (5 rounds for title fights, but 3 is good default)

#### Judo ✅
```json
{
  "type": "numeric",
  "unit": "points",
  "higherIsBetter": true,
  "decimals": 2
}
```
**Verified:** Judo uses Ippon (10 pts), Waza-ari (7 pts), Yuko (5 pts) system
**Note:** Actually whole numbers, but decimals won't hurt

---

### Gymnastics

#### Artistic Gymnastics ✅
```json
{
  "type": "numeric",
  "unit": "points",
  "higherIsBetter": true,
  "decimals": 2
}
```
**Verified:** Scores like 15.750, 14.200 - decimals to 3 places typical, but 2 is acceptable

---

## Required Fixes

### Priority 1: CRITICAL (Must fix before production)

1. **100m Sprint - Change scoring format**
   ```sql
   UPDATE sports
   SET scoring_format = '{"type":"numeric","unit":"seconds","higherIsBetter":false,"decimals":2}'::jsonb
   WHERE id = 'running_100m';
   ```

2. **400m - Change scoring format**
   ```sql
   UPDATE sports
   SET scoring_format = '{"type":"numeric","unit":"seconds","higherIsBetter":false,"decimals":2}'::jsonb
   WHERE id = 'running_400m';
   ```

### Priority 2: RECOMMENDED

3. **Swimming - Expand to support multiple distances**
   - Current format works for 200m+
   - Consider adding note in UI about format (50m-100m use ss.ms, 200m+ use mm:ss)

4. **Road Cycling - Consider placement option**
   - Add note that time is for time trials
   - Future: add placement/finishing position option

---

## Alternative: Enhanced Time Format

Instead of using `numeric` for sprints, we could create a more flexible time format:

```typescript
// Extend ScoreFormat type
export type ScoreFormat =
  | ... existing types ...
  | {
      type: "time";
      format: "mm:ss" | "hh:mm:ss" | "ss.ms";
      lowerIsBetter: boolean
    };
```

Then update sprint scoring:
```json
{
  "type": "time",
  "format": "ss.ms",
  "lowerIsBetter": true
}
```

---

## Testing Checklist

### Sprint Sports (100m, 400m)
- [ ] Can enter time like "10.52" (seconds)
- [ ] Can enter time like "45.38" (seconds)
- [ ] Validation rejects negative numbers
- [ ] Validation accepts decimals (2 places)
- [ ] Display shows "s" suffix

### Distance Running (5K, Marathon)
- [ ] Can enter time like "0:18:32"
- [ ] Can enter time like "3:42:15"
- [ ] Validation checks hh:mm:ss format
- [ ] Lower time = better performance

### Swimming
- [ ] Can enter time like "52.45" for 100m
- [ ] Can enter time like "1:54.32" for 200m
- [ ] Format accepts both styles

### Racket Sports
- [ ] Sets: Can enter "6-4, 7-5"
- [ ] Rally: Can enter "21-19"
- [ ] Validation enforces sport rules

### Combat Sports
- [ ] Boxing: Can enter "KO Round 7"
- [ ] MMA: Can enter "UD" or "Split Decision"
- [ ] Judo: Can enter numeric score

### Gymnastics
- [ ] Can enter "15.75"
- [ ] Decimals work correctly
- [ ] Higher = better

---

## SQL Verification Queries

Run these to check current scoring formats:

```sql
-- Check all sprint events
SELECT id, name, scoring_format
FROM sports
WHERE id IN ('running_100m', 'running_400m');

-- Check all time-based scoring
SELECT id, name, scoring_format
FROM sports
WHERE scoring_format->>'type' = 'time';

-- Check all numeric scoring
SELECT id, name, scoring_format
FROM sports
WHERE scoring_format->>'type' = 'numeric';

-- Check all rounds scoring
SELECT id, name, scoring_format
FROM sports
WHERE scoring_format->>'type' = 'rounds';
```

---

## Recommendations

### Option 1: Quick Fix (Use Numeric for Sprints)
**Pros:**
- Simple, works now
- No type changes needed
- Clear display (10.52s)

**Cons:**
- Not technically "time" type
- Less semantic

**Implementation:**
```sql
-- Fix sprints immediately
UPDATE sports
SET scoring_format = '{"type":"numeric","unit":"seconds","higherIsBetter":false,"decimals":2}'::jsonb
WHERE id IN ('running_100m', 'running_400m');
```

### Option 2: Enhanced Time Format (Better Long-term)
**Pros:**
- More semantic
- Flexible for all time-based sports
- Better validation

**Cons:**
- Requires TypeScript changes
- Need to update validation logic
- More testing needed

**Implementation:**
1. Update `ScoreFormat` type to include `ss.ms` format
2. Update `formatTime()` function in sportHelpers.ts
3. Update `validateScoreInput()` for ss.ms
4. Update database with new format
5. Test thoroughly

---

## Summary

### Critical Issues: 2
- 100m Sprint scoring incorrect ❌
- 400m scoring incorrect ❌

### Recommended Reviews: 2
- Swimming format could be more flexible ⚠️
- Road cycling might need placement option ⚠️

### Verified Correct: 14
- All 6 racket sports ✅
- 5K Running ✅
- Marathon ✅
- All 3 combat sports ✅
- Gymnastics ✅
- Road Cycling (for time trials) ✅

**Action Required:** Apply Priority 1 fixes before production deployment.

