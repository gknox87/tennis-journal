# Smart Score Entry System

## Overview

The smart score entry system provides multiple intelligent features to make match score entry fast, accurate, and effortless. The system includes auto-complete scoring, smart match completion detection, and automatic set hiding.

## Features

### 1. Auto-Complete Scoring
Automatically fills in the opponent's score when you enter your score, following official rules for each sport.

### 2. Smart Match Completion Detection
Automatically detects when a match is complete (e.g., Best of 3: first to 2 sets wins) and displays a completion banner.

### 3. Intelligent Set Filtering
Hides unnecessary empty sets once the match is complete, showing only the sets that were actually played.

## How It Works

When you enter your score in any game/set field:
1. The system detects which sport you're playing
2. It applies the official scoring rules for that sport
3. It automatically fills in the most common opponent score
4. You can always override the auto-filled value if needed

## Sport-Specific Rules

### Tennis & Padel (Set-Based Scoring)

**Standard Set Wins:**
- Enter `0` → Gets `6` (Lost 0-6)
- Enter `1` → Gets `6` (Lost 1-6)
- Enter `2` → Gets `6` (Lost 2-6)
- Enter `3` → Gets `6` (Lost 3-6)
- Enter `4` → Gets `6` (Lost 4-6)
- Enter `5` → Gets `7` (Lost 5-7)
- Enter `6` → Gets `4` (Won 6-4, most common)
- Enter `7` → Gets `5` (Won 7-5, most common)

**Tiebreak Scenarios:**
- At 6-6, tiebreak inputs appear automatically
- Standard tiebreak (first to 7, win by 2):
  - Enter `0-5` → Gets `7` (Lost tiebreak)
  - Enter `6` → Gets `8` (Lost deuce tiebreak 6-8)
  - Enter `7` → Gets `5` (Won tiebreak 7-5)
  - Enter `8` → Gets `6` (Won deuce tiebreak 8-6)
  - Enter `10` → Gets `8` (Won extended deuce 10-8)

**Match Tiebreak (to 10):**
- Enter `0-8` → Gets `10` (Lost)
- Enter `9` → Gets `11` (Lost deuce 9-11)
- Enter `10` → Gets `8` (Won 10-8)
- Enter `11` → Gets `9` (Won deuce 11-9)

### Table Tennis (Rally Scoring to 11)

**Standard Game:**
- Enter `0-9` → Gets `11` (Lost 0-11 through 9-11)
- Enter `10` → Gets `12` (Lost deuce game 10-12)
- Enter `11` → Gets `9` (Won 11-9, most common)
- Enter `12` → Gets `10` (Won deuce game 12-10)
- Enter `13` → Gets `11` (Won extended deuce 13-11)
- Enter `14` → Gets `12` (Won extended deuce 14-12)

**Deuce Rules:**
- Must win by 2 points
- No maximum score - can continue indefinitely
- Auto-complete assumes you won by 2

### Badminton (Rally Scoring to 21)

**Standard Game:**
- Enter `0-19` → Gets `21` (Lost 0-21 through 19-21)
- Enter `20` → Gets `22` (Lost deuce game 20-22)
- Enter `21` → Gets `19` (Won 21-19, most common)
- Enter `22` → Gets `20` (Won deuce game 22-20)
- Enter `23-29` → Gets score-2 (Won extended deuce)
- Enter `30` → Gets `29` (Maximum score 30-29)

**Deuce Rules:**
- Must win by 2 points at 20-20
- Capped at 30 points maximum
- At 29-29, next point wins (golden point)

### Squash (Rally Scoring to 11)

**Same as Table Tennis:**
- Enter `0-9` → Gets `11` (Lost)
- Enter `10` → Gets `12` (Lost deuce)
- Enter `11` → Gets `9` (Won, most common)
- Enter `12` → Gets `10` (Won deuce)
- Extended deuce follows same pattern as table tennis

### Pickleball (Rally Scoring)

#### Games to 11 (Most Common)
- Enter `0-9` → Gets `11` (Lost)
- Enter `10` → Gets `12` (Lost deuce)
- Enter `11` → Gets `9` (Won, most common)
- Enter `12` → Gets `10` (Won deuce)

#### Games to 15
- Enter `0-13` → Gets `15` (Lost)
- Enter `14` → Gets `16` (Lost deuce)
- Enter `15` → Gets `13` (Won, most common)
- Enter `16` → Gets `14` (Won deuce)

#### Games to 21
- Enter `0-19` → Gets `21` (Lost)
- Enter `20` → Gets `22` (Lost deuce)
- Enter `21` → Gets `19` (Won, most common)
- Enter `22` → Gets `20` (Won deuce)

## Examples

### Example 1: Tennis Match (Won 6-4, 7-5)
1. Set 1: Enter `6` → Auto-fills `4`
2. Set 2: Enter `7` → Auto-fills `5`
3. Winner automatically detected!

### Example 2: Table Tennis Match (Won 11-9, 10-12, 11-8)
1. Game 1: Enter `11` → Auto-fills `9`
2. Game 2: Enter `10` → Auto-fills `12` (You lost this game)
3. Game 3: Enter `11` → Auto-fills `9` (but you can change to 8)
4. Winner automatically detected!

### Example 3: Badminton Match (Won 21-18, 23-21)
1. Game 1: Enter `21` → Auto-fills `19` (but you can change to 18)
2. Game 2: Enter `23` → Auto-fills `21` (Deuce game)
3. Winner automatically detected!

### Example 4: Tennis with Tiebreak (Won 6-4, 6-7(5), 7-6(8))
1. Set 1: Enter `6` → Auto-fills `4`
2. Set 2: Enter `6` → Tiebreak appears
   - Your tiebreak: Enter `5` → Auto-fills `7`
3. Set 3: Enter `7` → Auto-fills `6` (but might already be 6)
   - Your tiebreak: Enter `8` → Auto-fills `6`
4. Winner automatically detected!

## Edge Cases Handled

✅ **Deuce Situations** - Correctly handles all deuce scenarios
✅ **Extended Deuces** - Supports unlimited deuce in table tennis/squash
✅ **Badminton Cap** - Respects 30-point maximum
✅ **Tiebreaks** - Auto-completes both standard and match tiebreaks
✅ **Manual Override** - You can always change the auto-filled value
✅ **Empty Fields** - Only auto-fills when opponent field is empty
✅ **Sport Detection** - Automatically uses correct rules based on selected sport

## Benefits

1. **Faster Entry** - Enter scores in half the time
2. **Accuracy** - Follows official rules for each sport
3. **Smart Defaults** - Uses most common winning scores
4. **Learning Tool** - Helps users learn proper scoring
5. **Flexibility** - Can always override auto-filled values

## Technical Implementation

- **File**: `src/utils/scoreAutoComplete.ts`
- **Component**: `src/components/ScoreInput.tsx`
- **Type Safety**: Full TypeScript support
- **Sport-Agnostic**: Works with all racket sports
- **Extensible**: Easy to add new sports

## Future Enhancements

- [ ] Add tooltips showing scoring rules
- [ ] Visual feedback when auto-complete activates
- [ ] Settings to disable auto-complete
- [ ] Sport-specific validation messages
- [ ] Analytics on most common scores
