# QA Checklist: All-Sport Support

This checklist ensures comprehensive testing across all sport categories and features.

## Pre-Deployment Checks

### Database Migration
- [ ] Migration file `20250108000000_all_sport_support.sql` exists
- [ ] Migration runs without errors
- [ ] All sports table columns created successfully
- [ ] Indexes created on `category`, `is_published`, and `popularity`
- [ ] Views `sports_catalogue` created
- [ ] RPC functions `get_sports_by_category` and `get_popular_sports` working
- [ ] Permissions granted correctly
- [ ] All 18 sports seeded in database

### TypeScript Compilation
- [ ] No TypeScript errors in `src/types/sport.ts`
- [ ] No TypeScript errors in `src/constants/sports.ts`
- [ ] No TypeScript errors in `src/utils/sportHelpers.ts`
- [ ] No TypeScript errors in components
- [ ] Build completes successfully

## Onboarding Flow Testing

### Sport Selection UI
- [ ] Search input appears and is functional
- [ ] "Popular" tab shows top 8 sports by popularity
- [ ] Category tabs display correct categories (racket, athletics, combat, etc.)
- [ ] Clicking category tab filters sports correctly
- [ ] Sport icons display correctly
- [ ] Sport names display correctly
- [ ] Subcategories display when present
- [ ] Selected sport has visual highlight (ring)
- [ ] Scrolling works when > 6 sports in category

### Search Functionality
- [ ] Search by sport name works (e.g., "Tennis")
- [ ] Search by category works (e.g., "racket")
- [ ] Search by subcategory works (e.g., "sprint")
- [ ] Search is case-insensitive
- [ ] Empty results show helpful message
- [ ] Clearing search returns to category view

### Goal Selection
- [ ] All 3 goal options display
- [ ] Goal descriptions are clear
- [ ] Selected goal has visual highlight
- [ ] Selection persists when changing sports

## Sport-Specific Testing

### Racket Sports
Test each: Tennis, Table Tennis, Badminton, Padel, Pickleball, Squash

- [ ] Sport appears in "racket" category
- [ ] Icon displays correctly (🎾, 🏓, 🏸, etc.)
- [ ] Set/rally scoring format selected
- [ ] Match entry form shows correct terminology
- [ ] Training notes use correct labels
- [ ] AI analysis uses sport-specific prompt

### Athletics (Sprint)
Test: 100m, 400m

- [ ] Sports appear in "athletics" category with "sprint" subcategory
- [ ] Icon displays correctly (🏃)
- [ ] Time format is mm:ss
- [ ] Time input accepts format like "10:52" or "45.32"
- [ ] "Lower is better" validation works
- [ ] Terminology shows "Race" not "Match"

### Athletics (Distance)
Test: 5K

- [ ] Sport appears in "athletics" category with "distance" subcategory
- [ ] Time format is hh:mm:ss
- [ ] Time input accepts format like "0:18:32" or "23:15.50"
- [ ] Terminology shows "Distance Run" for training

### Endurance
Test: Marathon

- [ ] Sport appears in "endurance" category
- [ ] Time format is hh:mm:ss
- [ ] Time input accepts format like "3:15:42"
- [ ] Terminology shows "Long Run" for training

### Aquatic
Test: Freestyle Swimming

- [ ] Sport appears in "aquatic" category
- [ ] Icon displays correctly (🏊)
- [ ] Time format supports both mm:ss and hh:mm:ss
- [ ] Lap split terminology used

### Combat Sports
Test: Boxing, MMA, Judo

- [ ] Sports appear in "combat" category
- [ ] Boxing uses rounds format (KO/TKO)
- [ ] MMA uses rounds format (points)
- [ ] Judo uses numeric scoring with decimals
- [ ] Terminology shows "Bout"/"Fight"/"Match"
- [ ] Training shows "Sparring"/"Training Session"/"Randori"

### Cycling
Test: Road Cycling

- [ ] Sport appears in "cycling" category
- [ ] Icon displays correctly (🚴)
- [ ] Time format is hh:mm:ss
- [ ] Distance format also supported (km)
- [ ] Terminology shows "Race" and "Training Ride"

### Gymnastics
Test: Artistic Gymnastics

- [ ] Sport appears in "gymnastics" category
- [ ] Icon displays correctly (🤸)
- [ ] Numeric scoring with 2 decimals
- [ ] Higher score is better
- [ ] Terminology shows "Competition" not "Match"

## Match Entry & Recording

### Universal Score Input
- [ ] Time-based sports show time format hint
- [ ] Distance-based sports show distance unit
- [ ] Numeric sports show decimal places
- [ ] Rounds sports show max rounds
- [ ] Invalid input shows error message
- [ ] Valid input clears error message
- [ ] Placeholder text matches format

### Match Form
- [ ] Sport-specific terminology used throughout
- [ ] Opponent label matches sport (Opponent/Competitor/Runner)
- [ ] Match/Race/Bout label used correctly
- [ ] Court/track/venue field labeled appropriately
- [ ] Score input component matches sport format

### Match Display
- [ ] Sport badge shows on match cards
- [ ] Score formatted correctly per sport type
- [ ] Time displayed as mm:ss or hh:mm:ss
- [ ] Distance displayed with unit
- [ ] Numeric scores show decimals
- [ ] Win/loss determined correctly based on scoring type

## Training Notes

### Training Entry
- [ ] Training label matches sport (Practice/Training Run/Sparring)
- [ ] Sport-specific focus areas suggested
- [ ] Terminology consistent throughout

### Training Display
- [ ] Sport badge visible on training cards
- [ ] Training type labeled correctly
- [ ] AI suggestions use sport context

## AI Analysis

### Match Analysis
- [ ] AI uses sport-specific style prompt
- [ ] Focus areas relevant to sport
- [ ] Terminology matches sport in AI response
- [ ] Suggestions appropriate for sport type

### Training Suggestions
- [ ] AI recognizes sport from context
- [ ] Drills/exercises match sport
- [ ] Progressive difficulty appropriate

## Sport Context & Caching

### Context Provider
- [ ] `useSport()` hook provides current sport
- [ ] `sportsByCategory` groups correctly
- [ ] `popularSports` shows top 8
- [ ] `getSport(id)` retrieves sport data
- [ ] Context updates when sport changed

### Local Storage Cache
- [ ] Sports cached after first load
- [ ] Cache expires after 1 hour
- [ ] Cache invalidates correctly
- [ ] Fallback to constants if cache fails
- [ ] Cache updates when sports change

## Edge Cases & Error Handling

### Missing Data
- [ ] Unpublished sports don't appear in UI
- [ ] Invalid sport ID falls back to default
- [ ] Missing icon shows placeholder
- [ ] Missing color uses default

### Input Validation
- [ ] Empty score input allowed (optional)
- [ ] Invalid time format rejected (e.g., "99:99")
- [ ] Negative numbers rejected for distance
- [ ] Rounds beyond max rejected
- [ ] Non-numeric input rejected for numeric fields

### Migration & Compatibility
- [ ] Existing tennis matches still load
- [ ] Old score formats converted correctly
- [ ] User preferences preserved
- [ ] No data loss during migration

## Performance Testing

### Load Times
- [ ] Onboarding loads < 1 second
- [ ] Sport catalogue renders < 500ms
- [ ] Search results instant (<100ms)
- [ ] Category switching instant (<100ms)

### Large Datasets
- [ ] UI responsive with 100+ sports
- [ ] Scrolling smooth in sport list
- [ ] Search performant with many results
- [ ] No memory leaks with rapid switching

## Accessibility

### Keyboard Navigation
- [ ] Tab through sport selections
- [ ] Enter/Space to select sport
- [ ] Arrow keys navigate categories
- [ ] Search input focusable

### Screen Readers
- [ ] Sport names announced
- [ ] Categories announced
- [ ] Selection state announced
- [ ] Error messages announced

### Visual
- [ ] Color contrast meets WCAG AA
- [ ] Icons visible at all sizes
- [ ] Text readable on all backgrounds
- [ ] Selected state clearly visible

## Cross-Browser Testing

- [ ] Chrome/Edge: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Mobile Safari: All features work
- [ ] Mobile Chrome: All features work

## Mobile Responsive

### Small Screens (320px - 480px)
- [ ] Sport grid adapts to single column
- [ ] Tabs scrollable if needed
- [ ] Search input full width
- [ ] Score input keyboard appropriate

### Medium Screens (481px - 768px)
- [ ] Sport grid shows 2 columns
- [ ] Tabs visible without scroll
- [ ] Forms properly sized

### Large Screens (769px+)
- [ ] Sport grid shows 2-3 columns
- [ ] All tabs visible
- [ ] Two-column layout for onboarding

## Documentation

- [ ] SPORT_MANAGEMENT.md complete and accurate
- [ ] Example SQL snippets tested
- [ ] Code comments clear
- [ ] Type definitions documented
- [ ] Helper functions have JSDoc

## Sign-Off

- [ ] All critical tests passed
- [ ] No P0/P1 bugs remaining
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Ready for production

---

**Tested by:** _________________
**Date:** _________________
**Version:** _________________
**Notes:**

