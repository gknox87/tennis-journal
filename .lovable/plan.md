# Landing Page Visual Refresh

The copy on `src/pages/Landing.tsx` is strong, but it's a wall of cards and icons. Let's inject **bold, athletic, editorial imagery** that makes Sports Journal feel like a premium product worth paying for — think Nike x Linear x Strava year-in-review.

## Art direction

- **Mood:** dynamic, sweaty, focused — real athletes in motion across all 6 racket sports
- **Treatment:** high-contrast photography with a purple→orange→red duotone/gradient overlay (matches brand)
- **Composition:** asymmetric, lots of negative space, motion blur on action shots
- **Avoid:** stock-photo cheese, generic "diverse team high-fiving", emoji-laden collages

## Images to generate (8 total)

| # | Slot | Concept | Format |
|---|------|---------|--------|
| 1 | **Hero background/side** | Padel player mid-smash, low angle, court lines glowing, purple→orange duotone, motion streaks | 1600×1200 |
| 2 | **Hero device mockup overlay** | Phone screenshot composite floating over image #1, slight tilt, glow shadow | overlay PNG |
| 3 | **Sports collage strip** (new section under hero) | 6 tight square crops — one per sport (tennis serve, TT topspin, padel volley, pickleball dink, badminton smash, squash lunge), unified duotone | 6× 512×512 |
| 4 | **"Track every match" feature** | Notebook + phone on clay court, journaling aesthetic, warm sunset light | 1200×800 |
| 5 | **"AI insights" feature** | Abstract data viz — heatmap of a tennis court with shot patterns, glowing nodes, dark bg | 1200×800 |
| 6 | **"Coach mode" feature** | Coach pointing at tablet with player, over-the-shoulder shot, golden hour | 1200×800 |
| 7 | **Testimonial section bg** | Wide stadium-empty-seats shot, heavily blurred, purple tint — used at 20% opacity behind quotes | 1920×600 |
| 8 | **Pricing/CTA section** | Single hero athlete celebrating point won, fist pump silhouette against gradient sky | 1600×900 |

All generated via `imagegen--generate_image` (standard tier; premium for #1 and #8), saved to `src/assets/landing/`, imported as ES6 modules.

## Layout changes in `src/pages/Landing.tsx`

1. **Hero** → split-screen: copy left, image #1 with floating phone mockup #2 right. Add subtle parallax on scroll.
2. **New section after hero**: full-bleed 6-sport collage strip (#3) with sport names overlaid in display font — "ONE JOURNAL. SIX SPORTS."
3. **Features section** → alternate zigzag rows, each feature card paired with image #4/#5/#6 (instead of just an icon).
4. **Testimonials** → layer image #7 as background at low opacity with gradient mask.
5. **Final CTA** → full-bleed image #8 with gradient overlay, white copy on top, large orange→red CTA button.

## Technical notes

- Lazy-load all images below the fold (`loading="lazy"`)
- Add `<img>` `alt` text describing the sport/action for SEO
- Keep total added weight under ~600KB (use `.jpg` not `.png`, target 80% quality)
- No changes to app routes, auth, or any code outside `src/pages/Landing.tsx` and `src/assets/landing/`

## Out of scope

- Hub app UI, dashboard, or any logged-in views
- Copy rewrites (you said content is good)
- Video / Lottie animations (can be a follow-up)

---

Approve and I'll generate all 8 images and wire them into the landing page in one pass.
