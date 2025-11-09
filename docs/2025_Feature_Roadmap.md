# 2025 Feature Roadmap

## Product Vision
A unified sports performance journal that adapts to any discipline, surfaces actionable insights automatically, and keeps athletes and coaches aligned before, during, and after competition.

## Strategic Pillars
- **Multi-sport fidelity:** Maintain accurate scoring, terminology, and workflows for every supported sport.
- **Insightful coaching:** Turn raw match and training data into clear, high-impact recommendations.
- **Collaboration & sharing:** Make it effortless for athletes to collaborate with coaches, training partners, and supporters.
- **Operational excellence:** Ensure the platform feels reliable, secure, and polished at every touchpoint.

## Roadmap Summary
| Timeline | Strategic Theme | Outcomes |
| --- | --- | --- |
| Nov–Dec 2025 (Now) | Complete multi-sport foundation & polish UX | Score format flexibility live, match entry friction reduced, baseline observability in place |
| Jan–Mar 2026 (Next) | Deep insights & collaborative workflows | AI-powered insights embedded in UI, shared match packs, richer training planning |
| Apr–Jun 2026 (Later) | Expansion & monetisation experiments | Premium AI tiers, third-party integrations, sport-specific add-ons |

---

## Phase 1 – Complete Multi-Sport Foundation (Nov–Dec 2025)

### Feature 1: Score Format Flexibility Launch
- **Goal:** Allow players to log and review matches in the exact format they played.
- **Why now:** Documentation and types are ready; UI and persistence gaps block multi-sport credibility.
- **Key tasks:**
  - Engineering: finish `supportedScoreFormats` data for combat sports in `src/constants/sports.ts`.
  - Engineering: build `MatchFormatSelector` component and wire it into `AddMatch` and `EditMatch`.
  - Engineering: persist `match_format` JSON via Supabase migration `20250108000002_add_format_flexibility.sql`.
  - QA: regression test existing match creation across racket and combat sports.
  - Product: prepare in-app tooltip copy explaining format choices.
- **Dependencies:** Supabase migration, updated sport constants.
- **Acceptance criteria:** Users can select formats per sport; saved matches display correct labels; legacy matches default to previous format without errors.

### Feature 2: Match Entry Flow Optimisation
- **Goal:** Reduce time-to-save for new matches by surfacing only relevant fields and adding inline validation.
- **Key tasks:**
  - Product & Design: map sport-specific required vs optional fields.
  - Engineering: implement conditional form sections (e.g. round duration only for combat sports) using existing sport metadata.
  - Engineering: add optimistic UI for match save with toast feedback via `useMatchesData`.
  - QA: record benchmark (current vs new) for average match creation time.
- **Acceptance criteria:** Match forms adapt per sport, validation errors are sport-aware, save latency perceived under 1s on broadband.

### Feature 3: Observability & Error Transparency
- **Goal:** Catch Supabase and client-side failures early and inform users gracefully.
- **Key tasks:**
  - Engineering: add centralised error boundary with sport-aware messaging.
  - Engineering: instrument `useMatchesData` and `useNotesData` with structured logging (Sentry or Supabase logs).
  - DevOps: configure daily error digest to core team.
- **Acceptance criteria:** 100% of failed Supabase calls emit structured logs; users receive contextual retry prompts instead of silent failures.

### Feature 4: Trusted Authentication & Security Baseline
- **Goal:** Build user confidence ahead of collaboration features.
- **Key tasks:**
  - Engineering: enable Supabase multi-factor authentication for accounts storing coaching data.
  - Product: update onboarding copy to highlight security practices (UK English).
  - QA: verify fallback flows for password reset and MFA device loss.
- **Acceptance criteria:** MFA optional rollout live; analytics show at least 30% of active coaches enabling MFA within two weeks.

---

## Phase 2 – Insights & Collaboration (Jan–Mar 2026)

### Feature 5: Inline AI Match Insights
- **Goal:** Surface AI-generated improvement suggestions directly inside `MatchDetail`.
- **Key tasks:**
  - Engineering: call existing `analyze-match-notes` edge function when notes are saved.
  - Engineering: display suggestions in a collapsible panel within `MatchDetail` with sport-context styling.
  - Product: define copy and escalation path when AI is unavailable.
  - QA: run sport-specific spot checks to ensure terminology accuracy.
- **Dependencies:** Stable note-taking UX (Phase 1), Deepseek API quotas.
- **Acceptance criteria:** 95% of matches with notes show 1–3 suggestions in under 5 seconds; fallback messaging shown when API fails.

### Feature 6: Shared Match Packs
- **Goal:** Enable athletes to share curated match summaries with coaches or supporters.
- **Key tasks:**
  - Engineering: extend `supabase/functions/share-match-notes` to bundle stats, notes, and video links.
  - Engineering: generate shareable, expiring URLs with access control.
  - Design: lightweight responsive template for public view.
  - Legal/Product: draft acceptable use guidelines and consent flows.
- **Acceptance criteria:** Users can send expiring links; recipients view summary without needing accounts; analytics capture open rates.

### Feature 7: Training Planner 1.0
- **Goal:** Bridge matches and training by turning insights into actionable plans.
- **Key tasks:**
  - Product: define default training templates per sport category.
  - Engineering: extend `TrainingNotes` page with weekly planner grid, including drag-and-drop drills.
  - Data: allow linking planner items back to matches for progress tracking.
  - QA: ensure mobile view supports quick edits.
- **Acceptance criteria:** Users can add, reorder, and mark drills complete; at least one template per sport category; planner syncs with existing notes APIs.

---

## Phase 3 – Expansion & Monetisation Experiments (Apr–Jun 2026)

### Feature 8: Premium AI Coaching Tier
- **Goal:** Monetise advanced AI analysis with deeper tactical breakdowns and video cues.
- **Key tasks:**
  - Product: define pricing, value propositions, and paywall touchpoints.
  - Engineering: integrate billing (Stripe Customer Portal) and manage entitlements client-side.
  - Engineering: upgrade AI prompts to include opponent tendencies and trend detection.
  - Marketing: craft launch campaign emphasising ROI for competitive athletes.
- **Acceptance criteria:** Paywall enforced, billing receipts stored, premium dashboards deliver additional insights compared to free tier.

### Feature 9: External Calendar & Video Integrations
- **Goal:** Broaden ecosystem reach to retain competitive users.
- **Key tasks:**
  - Engineering: ship two-way sync with Google Calendar for match scheduling via Supabase cron.
  - Engineering: allow linking highlight reels from YouTube or Hudl within `MatchDetail`.
  - QA: ensure OAuth scopes reviewed and consent copy updated.
- **Acceptance criteria:** Calendar sync completes within 60 seconds of change; video embeds responsive across devices; integration usage tracked.

### Feature 10: Sport-Specific Add-ons Marketplace (Discovery Experiment)
- **Goal:** Test demand for modular sport packs (e.g. boxing judge scorecards).
- **Key tasks:**
  - Product Research: interview five users per sport to refine pack concepts.
  - Engineering: enable dynamic loading of sport pack metadata from Supabase.
  - Design: create in-app catalogue with preview cards and ratings.
  - Analytics: instrument conversion funnel and churn signals.
- **Acceptance criteria:** MVP marketplace live to 10% cohort; ability to activate/deactivate packs without redeploys.

---

## Cross-cutting Initiatives
- **Data hygiene:** nightly Supabase job to reconcile orphaned notes and matches.
- **Design system uplift:** audit existing `ui` components, retire duplicates, and document usage.
- **Mobile responsiveness:** targeted QA for breakpoints under 640px after each feature release.
- **Documentation:** maintain updated sport guides in `/docs`, ensuring UK English spelling and clear filenames.

## Success Metrics
- Active weekly athletes per sport + retention by 4-week cohort.
- Match creation completion rate and average completion time.
- AI suggestion engagement: % of matches where suggestions are viewed or acted upon.
- Collaboration uptake: number of shared match packs opened within 48 hours.
- Premium conversion rate (Phase 3) and churn within first billing cycle.

## Next Steps
- Schedule roadmap review with Product, Engineering, and Coaching stakeholders by 18 Nov 2025.
- Spin up delivery squads for each phase and assign owners.
- Align analytics event tracking plan before Phase 1 launches.
- Revisit roadmap quarterly to adjust based on usage data and customer feedback.
