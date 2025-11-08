# Sport Format Research & Recommendations

## Racket Sports

### Tennis
**Standard Formats:**
- **Best of 3 sets** (most common - club, recreational, women's singles)
- **Best of 5 sets** (men's Grand Slam, Davis Cup)
- **Pro Set** (first to 8 games, used in practice/warm-up)
- **Match Tiebreak** (first to 10 points, used instead of 3rd set)

**Recommendation:**
- Default: Best of 3 sets
- Options: Best of 3, Best of 5, Pro Set, Match Tiebreak

### Table Tennis
**Standard Formats:**
- **Best of 5** (most common - club level, recreational)
- **Best of 7** (professional tournaments, serious competition)
- **Best of 3** (casual play, quick matches)

**Each game:** First to 11 points, win by 2

**Recommendation:**
- Default: Best of 5
- Options: Best of 3, Best of 5, Best of 7

### Badminton
**Standard Formats:**
- **Best of 3 games** (standard for all levels)
- **Single game** (casual/practice)

**Each game:** First to 21 points, win by 2 (max 30)

**Recommendation:**
- Default: Best of 3
- Options: Best of 3, Single game to 21

### Squash
**Standard Formats:**
- **Best of 5 games** (standard competitive)
- **Best of 3 games** (club level, practice)

**Each game:** First to 11 points, win by 2

**Recommendation:**
- Default: Best of 5
- Options: Best of 3, Best of 5

### Pickleball
**Standard Formats:**
- **Best of 3 games** (tournament standard)
- **Single game to 11** (recreational, round-robin)
- **Single game to 15** (some tournaments)
- **Single game to 21** (rally scoring variation)

**Recommendation:**
- Default: Best of 3 (games to 11)
- Options: Best of 3 to 11, Single to 11, Single to 15, Single to 21

### Padel
**Standard Formats:**
- **Best of 3 sets** (standard)
- **Best of 5 sets** (rare, long tournaments)

**Same scoring as tennis**

**Recommendation:**
- Default: Best of 3
- Options: Best of 3, Best of 5

---

## Combat Sports

### Boxing
**Standard Formats:**
- **4 rounds × 2 min** (amateur, novice)
- **6 rounds × 3 min** (professional, early career)
- **8 rounds × 3 min** (professional, mid-level)
- **10 rounds × 3 min** (professional, eliminator)
- **12 rounds × 3 min** (championship, title fights)

**Recommendation:**
- Default: 12 rounds (championship)
- Options: 4, 6, 8, 10, 12 rounds

### MMA
**Standard Formats:**
- **3 rounds × 5 min** (standard non-title)
- **5 rounds × 5 min** (title fights, main events)

**Recommendation:**
- Default: 3 rounds
- Options: 3 rounds, 5 rounds

### Judo
**Standard Formats:**
- **4 minutes** (senior men)
- **4 minutes** (senior women)
- **3 minutes** (junior)

**Scoring:** Ippon (instant win), Waza-ari (half point), 2× Waza-ari = Ippon

**Recommendation:**
- Default: 4 minutes
- Options: 3 min (junior), 4 min (senior)
- Store as time limit + scoring system

---

## Running

### Sprints (100m, 200m, 400m)
**Format:** Single race, time-based
**No variations needed** - just record time

### Middle Distance (800m, 1500m)
**Format:** Single race, time-based
**No variations needed** - just record time

### Long Distance (5K, 10K, Marathon)
**Format:** Single race, time-based
**No variations needed** - just record time

---

## Swimming

### Pool Events
**Standard Distances:**
- **50m** (sprint)
- **100m** (standard)
- **200m** (standard)
- **400m** (distance)
- **800m** (women's distance)
- **1500m** (men's distance)

**Recommendation:**
- Store distance + time
- Default: 100m for freestyle
- Allow user to select distance

---

## Cycling

### Road Cycling
**Formats:**
- **Time Trial** (individual, time-based)
- **Road Race** (pack finish, placement-based)
- **Stage Race** (multi-day, cumulative time)

**Recommendation:**
- Default: Time Trial
- Options: Time Trial (record time), Road Race (record placement), Stage (record cumulative)

---

## Summary Table

| Sport | Default Format | Alternative Formats |
|-------|---------------|---------------------|
| **Tennis** | Best of 3 sets | Best of 5, Pro Set, Match Tiebreak |
| **Table Tennis** | Best of 5 | Best of 3, Best of 7 |
| **Badminton** | Best of 3 | Single game to 21 |
| **Squash** | Best of 5 | Best of 3 |
| **Pickleball** | Best of 3 to 11 | Single to 11, Single to 15, Single to 21 |
| **Padel** | Best of 3 | Best of 5 |
| **Boxing** | 12 rounds | 4, 6, 8, 10 rounds |
| **MMA** | 3 rounds | 5 rounds |
| **Judo** | 4 min | 3 min (junior) |
| **Running** | Single race | N/A (distance varies) |
| **Swimming** | 100m | 50m, 200m, 400m, 800m, 1500m |
| **Cycling** | Time Trial | Road Race, Stage Race |

---

## Implementation Requirements

### 1. Extend ScoreFormat Type
```typescript
export type ScoreFormat =
  | {
      type: "sets";
      maxSets: 3 | 5;  // best of 3 or 5
      pointsPerGame: number;
      tiebreaks: boolean;
      matchTiebreak?: boolean; // 10-point tiebreak for 3rd set
    }
  | {
      type: "rally";
      pointsToWin: number;
      winBy: number;
      bestOf?: 3 | 5 | 7;  // number of games in match
    }
  | {
      type: "rounds";
      totalRounds: 3 | 4 | 5 | 6 | 8 | 10 | 12;
      roundDuration: number; // in minutes
      scoringMethod: "points" | "knockout";
    }
  // ... other types
```

### 2. Update Sport Definitions
Each sport should have `supportedScoreFormats` array with all valid options

### 3. UI Component Needed
Create a format selector component that shows available formats for the selected sport

### 4. Match Entry Flow
1. User selects sport
2. System shows default format + dropdown for alternatives
3. User can keep default or choose alternative
4. Format saved with match data

---

## Updated Sport Configurations

### Tennis
```typescript
tennis: {
  defaultScoreFormat: {
    type: "sets",
    maxSets: 3,
    pointsPerGame: 4,
    tiebreaks: true
  },
  supportedScoreFormats: [
    { type: "sets", maxSets: 3, pointsPerGame: 4, tiebreaks: true },
    { type: "sets", maxSets: 5, pointsPerGame: 4, tiebreaks: true },
    { type: "sets", maxSets: 3, pointsPerGame: 4, tiebreaks: true, matchTiebreak: true },
    { type: "games", gamesPerMatch: 8 } // Pro set
  ]
}
```

### Table Tennis
```typescript
table_tennis: {
  defaultScoreFormat: {
    type: "rally",
    pointsToWin: 11,
    winBy: 2,
    bestOf: 5
  },
  supportedScoreFormats: [
    { type: "rally", pointsToWin: 11, winBy: 2, bestOf: 3 },
    { type: "rally", pointsToWin: 11, winBy: 2, bestOf: 5 },
    { type: "rally", pointsToWin: 11, winBy: 2, bestOf: 7 }
  ]
}
```

### Boxing
```typescript
boxing: {
  defaultScoreFormat: {
    type: "rounds",
    totalRounds: 12,
    roundDuration: 3,
    scoringMethod: "knockout"
  },
  supportedScoreFormats: [
    { type: "rounds", totalRounds: 4, roundDuration: 2, scoringMethod: "points" },
    { type: "rounds", totalRounds: 6, roundDuration: 3, scoringMethod: "points" },
    { type: "rounds", totalRounds: 8, roundDuration: 3, scoringMethod: "points" },
    { type: "rounds", totalRounds: 10, roundDuration: 3, scoringMethod: "points" },
    { type: "rounds", totalRounds: 12, roundDuration: 3, scoringMethod: "knockout" }
  ]
}
```

---

## Research Sources

- **Tennis:** ITF Rules, ATP/WTA formats
- **Table Tennis:** ITTF Rules, club standards
- **Badminton:** BWF regulations
- **Squash:** World Squash Federation
- **Pickleball:** USA Pickleball Official Rules
- **Boxing:** WBC, WBA, IBF, WBO rules
- **MMA:** UFC, Bellator standards
- **Judo:** IJF Competition rules
