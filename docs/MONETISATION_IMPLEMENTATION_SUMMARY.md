# Monetisation Implementation Summary

**Created:** December 2024  
**Status:** Phase 1 Complete - Foundation Ready

---

## What Has Been Created

### 1. Documentation
- ✅ **MONETISATION_PLAN.md** - Complete monetisation strategy with pricing tiers, implementation phases, and revenue projections

### 2. Database Schema
- ✅ **Migration File:** `supabase/migrations/20250109000000_subscription_system.sql`
  - `subscriptions` table for managing user subscriptions
  - `usage_limits` table for tracking free tier limits
  - Database functions for subscription management
  - Row Level Security (RLS) policies
  - Auto-creation of free subscription on user signup

### 3. Frontend Components
- ✅ **Subscription Hook:** `src/hooks/useSubscription.ts`
  - React hook for accessing subscription data
  - Feature access checking
  - Usage limit management
  - Compatible with existing auth pattern

- ✅ **Pricing Page:** `src/pages/Pricing.tsx`
  - Beautiful pricing comparison page
  - Shows all three tiers (Free, Pro, Coach)
  - Handles upgrade/downgrade CTAs
  - FAQ section included

- ✅ **Route Added:** `/pricing` route added to `App.tsx`

---

## Next Steps to Complete Implementation

### Phase 2: Feature Gating (Week 2-3)

1. **Add feature checks to components:**
   - Match creation (`AddMatch.tsx`) - check `matches_per_month` limit
   - Notes creation (`TrainingNotes.tsx`, `ImprovementNotes.tsx`) - check `notes_per_month` limit
   - Video analysis features - check `canAccessFeature('video_analysis')`
   - Multi-sport selection - check `canAccessFeature('multi_sport')`
   - Export functionality - check `canAccessFeature('export')`
   - Opponent creation - check `opponents_total` limit

2. **Create upgrade prompts:**
   - Component for showing upgrade CTAs when limits reached
   - Non-intrusive prompts in relevant locations
   - Usage indicators for free tier users

3. **Usage tracking:**
   - Call `incrementUsage()` when users create matches/notes
   - Display usage progress bars
   - Show limit warnings before reaching limit

### Phase 3: Payment Integration (Week 3-4)

1. **Set up Stripe:**
   - Create Stripe account
   - Configure products and prices:
     - Pro: £9.99/month, £99/year
     - Coach: £29.99/month, £299/year
   - Get API keys

2. **Create checkout flow:**
   - Create Supabase Edge Function for Stripe checkout session
   - Update Pricing page to call checkout
   - Handle success/cancel callbacks

3. **Webhook handler:**
   - Create Supabase Edge Function for Stripe webhooks
   - Handle subscription events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`

4. **Subscription management page:**
   - Create `/profile/subscription` page
   - Show current plan
   - Allow upgrades/downgrades
   - Show billing history
   - Cancel subscription option

### Phase 4: UI/UX Polish (Week 4-5)

1. **Upgrade prompts:**
   - Design consistent upgrade CTAs
   - Add to dashboard, match detail pages
   - Create usage limit warnings

2. **Usage indicators:**
   - Progress bars showing usage vs limits
   - "X of Y matches used this month"
   - Clear messaging about what happens at limit

3. **Onboarding:**
   - Highlight premium features during onboarding
   - Show value proposition for Pro tier

---

## Testing Checklist

### Database
- [ ] Run migration: `supabase migration up`
- [ ] Verify tables created correctly
- [ ] Test RLS policies
- [ ] Test database functions
- [ ] Verify auto-subscription creation on signup

### Frontend
- [ ] Test `useSubscription` hook
- [ ] Verify pricing page displays correctly
- [ ] Test feature access checks
- [ ] Test usage limit tracking
- [ ] Verify upgrade prompts appear correctly

### Integration
- [ ] Test Stripe checkout flow
- [ ] Test webhook handlers
- [ ] Verify subscription updates in database
- [ ] Test upgrade/downgrade flows
- [ ] Test cancellation flow

---

## Key Files Reference

### Database
- Migration: `supabase/migrations/20250109000000_subscription_system.sql`

### Frontend
- Hook: `src/hooks/useSubscription.ts`
- Pricing Page: `src/pages/Pricing.tsx`
- App Routes: `src/App.tsx`

### Documentation
- Plan: `docs/MONETISATION_PLAN.md`
- This Summary: `docs/MONETISATION_IMPLEMENTATION_SUMMARY.md`

---

## Usage Examples

### Check if user can access feature:
```typescript
import { useSubscription } from '@/hooks/useSubscription';

const MyComponent = () => {
  const { canAccessFeature, isPro } = useSubscription();

  if (!canAccessFeature('video_analysis')) {
    return <UpgradePrompt feature="video_analysis" />;
  }

  return <VideoAnalysisComponent />;
};
```

### Check usage limit before action:
```typescript
const { checkUsageLimit, incrementUsage } = useSubscription();

const handleCreateMatch = async () => {
  const canCreate = await checkUsageLimit('matches_per_month');
  
  if (!canCreate) {
    showUpgradePrompt();
    return;
  }

  // Create match...
  await incrementUsage('matches_per_month');
};
```

### Display current usage:
```typescript
const { getCurrentUsage, getUsageLimit, tier } = useSubscription();

const [usage, setUsage] = useState({ current: 0, limit: 0 });

useEffect(() => {
  const loadUsage = async () => {
    const current = await getCurrentUsage('matches_per_month');
    const limit = await getUsageLimit('matches_per_month');
    setUsage({ current, limit });
  };
  loadUsage();
}, []);

return (
  <div>
    {tier === 'free' && (
      <p>Matches this month: {usage.current} / {usage.limit}</p>
    )}
  </div>
);
```

---

## Notes

- All users automatically get a free subscription on signup (handled by database trigger)
- Free tier limits reset monthly (based on `reset_date`)
- Pro and Coach tiers have unlimited access (limit = 999999)
- Subscription status must be 'active' to access premium features
- UK English spelling used throughout (as per project standards)

---

**Next Action:** Run the database migration and begin Phase 2 implementation.
