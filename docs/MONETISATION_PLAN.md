# Sports Journal - Monetisation Plan

**Created:** December 2024  
**Status:** Draft - Ready for Implementation  
**Version:** 1.0

---

## Executive Summary

This document outlines a simple, implementable monetisation strategy for Sports Journal. The plan uses a freemium model with tiered subscriptions, designed to provide value at every level while encouraging upgrades through feature differentiation.

---

## Monetisation Strategy

### Model: Freemium with Tiered Subscriptions

**Core Principle:** Provide genuine value in the free tier to build user base, then monetise through premium features that enhance the experience for serious athletes and coaches.

---

## Pricing Tiers

### 🆓 Free Tier
**Price:** £0/month  
**Target:** Casual athletes, beginners, students

**Features:**
- Track up to 10 matches per month
- Basic match statistics
- Training notes (up to 5 per month)
- Improvement notes (up to 5 per month)
- Calendar view
- Basic opponent tracking (up to 5 opponents)
- Single sport support
- Basic match history (last 3 months)

**Limitations:**
- No video analysis
- No advanced analytics
- No export functionality
- Limited storage
- No priority support

---

### ⭐ Pro Tier
**Price:** £9.99/month or £99/year (17% savings)  
**Target:** Serious athletes, regular players, competitive amateurs

**Features:**
- ✅ Unlimited matches
- ✅ Unlimited training notes
- ✅ Unlimited improvement notes
- ✅ Unlimited opponent tracking
- ✅ Multi-sport support (all 18+ sports)
- ✅ Full match history (unlimited)
- ✅ Advanced statistics & analytics
- ✅ Video analysis (pose/racket/ball detection)
- ✅ Match export (CSV, PDF)
- ✅ Custom match notes
- ✅ Priority support
- ✅ Ad-free experience

**Key Differentiators:**
- Video analysis capabilities
- Advanced analytics dashboard
- Export functionality
- Multi-sport support

---

### 🏆 Coach Tier
**Price:** £29.99/month or £299/year (17% savings)  
**Target:** Coaches, clubs, academies

**Features:**
- ✅ Everything in Pro Tier
- ✅ Manage multiple athletes (up to 10)
- ✅ Athlete performance comparison
- ✅ Team/group statistics
- ✅ Coach notes & feedback system
- ✅ Athlete progress reports
- ✅ Bulk match import
- ✅ API access (coming soon)
- ✅ White-label options (coming soon)
- ✅ Dedicated account manager

**Key Differentiators:**
- Multi-athlete management
- Team analytics
- Coach-specific tools

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)
**Goal:** Set up subscription infrastructure

**Tasks:**
1. ✅ Create subscription tiers in database schema
2. ✅ Integrate payment provider (Stripe recommended)
3. ✅ Create subscription management UI
4. ✅ Implement feature gating logic
5. ✅ Add subscription status checks to protected routes

**Database Schema:**
```sql
-- Add to existing migrations
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL DEFAULT 'free', -- 'free', 'pro', 'coach'
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usage_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  limit_type VARCHAR(50) NOT NULL, -- 'matches_per_month', 'notes_per_month', etc.
  current_count INTEGER DEFAULT 0,
  reset_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, limit_type, reset_date)
);
```

---

### Phase 2: Feature Gating (Week 2-3)
**Goal:** Implement tier-based feature restrictions

**Tasks:**
1. ✅ Create subscription context/hook (`useSubscription.ts`)
2. ✅ Add feature checks to components:
   - Match creation (limit for free tier)
   - Video analysis (Pro+ only)
   - Advanced analytics (Pro+ only)
   - Multi-sport selection (Pro+ only)
   - Export functionality (Pro+ only)
   - Notes creation (limit for free tier)
3. ✅ Create upgrade prompts/CTAs
4. ✅ Add usage tracking for limits

**Example Implementation:**
```typescript
// hooks/useSubscription.ts
export const useSubscription = () => {
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    }
  });

  const tier = subscription?.tier || 'free';
  
  return {
    tier,
    isPro: tier === 'pro' || tier === 'coach',
    isCoach: tier === 'coach',
    canAccessFeature: (feature: string) => {
      // Feature gating logic
    }
  };
};
```

---

### Phase 3: Payment Integration (Week 3-4)
**Goal:** Enable subscription purchases

**Tasks:**
1. ✅ Set up Stripe account and API keys
2. ✅ Create pricing page (`/pricing`)
3. ✅ Implement checkout flow
4. ✅ Set up webhook handlers for subscription events
5. ✅ Create subscription management page (`/profile/subscription`)
6. ✅ Add cancellation flow

**Stripe Integration:**
- Use Stripe Checkout for initial simplicity
- Store subscription status in Supabase
- Handle webhooks for payment success/failure/cancellation

---

### Phase 4: UI/UX Polish (Week 4-5)
**Goal:** Create compelling upgrade experience

**Tasks:**
1. ✅ Design upgrade prompts (non-intrusive)
2. ✅ Create feature comparison table
3. ✅ Add usage indicators for free tier
4. ✅ Implement "Upgrade" CTAs in relevant places
5. ✅ Create onboarding flow that highlights premium features

**Upgrade Prompt Locations:**
- When free tier limit reached (matches, notes)
- When accessing Pro-only features (video analysis, exports)
- Dashboard usage indicators
- Settings page

---

### Phase 5: Analytics & Monitoring (Week 5)
**Goal:** Track monetisation metrics

**Tasks:**
1. ✅ Set up conversion tracking
2. ✅ Monitor subscription metrics:
   - Free → Pro conversion rate
   - Monthly recurring revenue (MRR)
   - Churn rate
   - Average revenue per user (ARPU)
3. ✅ Create admin dashboard for metrics

---

## Revenue Projections

### Conservative Estimates (Year 1)

**Assumptions:**
- 1,000 active free users
- 5% conversion rate to Pro (£9.99/month)
- 1% conversion rate to Coach (£29.99/month)
- Average churn: 5% monthly

**Monthly Revenue:**
- Pro: 50 users × £9.99 = £499.50
- Coach: 10 users × £29.99 = £299.90
- **Total MRR: £799.40**

**Annual Revenue:** ~£9,600

### Growth Scenario (Year 2)

**Assumptions:**
- 5,000 active free users
- 7% conversion rate to Pro
- 2% conversion rate to Coach
- Improved retention (3% churn)

**Monthly Revenue:**
- Pro: 350 users × £9.99 = £3,496.50
- Coach: 100 users × £29.99 = £2,999.00
- **Total MRR: £6,495.50**

**Annual Revenue:** ~£78,000

---

## Key Metrics to Track

### Conversion Metrics
- Free → Pro conversion rate (target: 5-10%)
- Free → Coach conversion rate (target: 1-2%)
- Trial → Paid conversion (if trials added)

### Revenue Metrics
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Average Revenue Per User (ARPU)
- Customer Lifetime Value (LTV)

### Engagement Metrics
- Feature usage by tier
- Upgrade trigger points (which features drive conversions)
- Time to upgrade (days from signup)

### Retention Metrics
- Monthly churn rate (target: <5%)
- Annual retention rate
- Upgrade/downgrade patterns

---

## Implementation Checklist

### Database & Backend
- [ ] Create `subscriptions` table
- [ ] Create `usage_limits` table
- [ ] Add RLS policies for subscriptions
- [ ] Create subscription helper functions
- [ ] Set up Stripe webhook endpoint

### Frontend Components
- [ ] Create `SubscriptionContext` / `useSubscription` hook
- [ ] Build pricing page (`/pricing`)
- [ ] Create subscription management page
- [ ] Add feature gating to components
- [ ] Create upgrade prompts/CTAs
- [ ] Add usage limit indicators
- [ ] Build checkout flow

### Feature Gating
- [ ] Match creation limits (free tier)
- [ ] Notes creation limits (free tier)
- [ ] Video analysis (Pro+ only)
- [ ] Advanced analytics (Pro+ only)
- [ ] Multi-sport support (Pro+ only)
- [ ] Export functionality (Pro+ only)
- [ ] Opponent limits (free tier)

### Payment Integration
- [ ] Set up Stripe account
- [ ] Configure Stripe products/prices
- [ ] Implement checkout session creation
- [ ] Handle payment success callback
- [ ] Set up webhook handlers
- [ ] Test payment flows

### Analytics
- [ ] Track subscription events
- [ ] Monitor conversion rates
- [ ] Set up revenue dashboards
- [ ] Track feature usage by tier

---

## Next Steps

1. **Review & Approve Plan** - Stakeholder review of pricing and features
2. **Set Up Stripe Account** - Create account and configure products
3. **Begin Phase 1** - Database schema and subscription infrastructure
4. **User Testing** - Test upgrade flows with beta users
5. **Launch** - Soft launch to existing users, then public launch

---

## Future Considerations

### Potential Additions
- **Annual Plans** - Offer annual subscriptions with discount
- **Team Plans** - For clubs/academies (5-50 athletes)
- **Enterprise** - Custom pricing for large organisations
- **One-time Purchases** - Video analysis credits, report exports
- **Referral Programme** - Free month for referrals
- **Trial Period** - 7-14 day free trial of Pro features

### Pricing Adjustments
- Monitor conversion rates and adjust pricing if needed
- Consider regional pricing for international markets
- A/B test different price points
- Consider student discounts

---

## Notes

- **UK English** spelling used throughout (as per project standards)
- Pricing in GBP (£) - adjust for target markets
- Stripe recommended for payment processing (excellent Supabase integration)
- Consider VAT/tax implications for UK/EU users
- Ensure GDPR compliance for payment data

---

**Document Owner:** Product Team  
**Last Updated:** December 2024  
**Next Review:** After Phase 1 completion
