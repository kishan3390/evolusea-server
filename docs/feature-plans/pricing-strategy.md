# Pricing Strategy

## Executive Summary

The current pricing model (199,000 IDR/month ≈ $12.50 USD) is 3-4x too expensive for the Southeast Asian market, representing approximately 6% of Indonesia's minimum wage. This document proposes a revised multi-tier pricing strategy aligned with regional purchasing power and competitive positioning.

## Problem Statement

**Current Situation:**
- Monthly subscription: 199,000 IDR (Indonesia) / equivalent pricing
- Price point blocks mass-market adoption in price-sensitive SEA markets
- No weekly or flexible payment options
- Single premium tier limits revenue optimization

**Market Context:**
- Indonesia minimum wage: ~3.2M IDR/month
- Thailand minimum wage: ~11,000 THB/month
- Competitors (Muslim Pro, Thai Buddhist apps) are mostly free with lower-priced premium tiers
- Mental health/spiritual apps in SEA typically priced at 40-70K IDR/month

**Evidence from Research:**
> "Your pricing needs a 70% cut... At 199,000 IDR/month, you're pricing yourself at 6% of minimum wage—equivalent to asking Americans to pay $280/month." — Pricing Analysis Research Document

## Proposed Pricing Tiers

### Tier Structure

| Tier     | Indonesia (IDR) | Thailand (THB) | Features                                                                                          |
|----------|-----------------|----------------|---------------------------------------------------------------------------------------------------|
| **Free** | 0               | 0              | 3-5 AI messages/day, 1 daily quote, basic mood tracking, 3 journal entries/week, unlimited streaks, 1 wisdom story/week |
| **Standard** | 49,000-69,000/mo | 129-199/mo | Unlimited AI chat, all wisdom stories, unlimited journal entries, vision boards, advanced analytics |
| **Premium** | 79,000-99,000/mo | 179-249/mo | All Standard features + unlimited paths, exclusive seasonal content, streak freezes, priority support |

### Billing Options

1. **Weekly Subscription** (Mobile-first markets prefer weekly)
   - Standard: 15K IDR/week (Indonesia), 39 THB/week (Thailand)
   - Lowers psychological barrier to entry
   - Reduces churn perception
   
2. **Monthly Subscription** (Primary offering)
   - As outlined in tier structure above
   
3. **Annual Subscription** (20% discount)
   - Standard: 470K-550K IDR/year, 1,030-1,590 THB/year
   - Premium: 630K-790K IDR/year, 1,430-1,990 THB/year

### Free Tier Philosophy

**Generous by Design:**
- Industry data shows that generous free tiers drive 2x retention (Insight Timer: 16% D30 retention vs 8% competitors)
- Free users build daily habits before monetization decision
- SEA markets expect spiritual/religious tools to be free or affordable
- Free tier creates viral growth through word-of-mouth

**Conversion Strategy:**
- Target 3-5% free-to-paid conversion (industry average: 2-4%)
- Paywall triggers: After 7-day streak, when hitting daily AI limit, vision board creation
- Value demonstration before ask

## A/B Testing Strategy

### Price Point Testing (First 90 Days)

Test three Standard tier price points in Indonesia:
- Variant A: 49,000 IDR/month
- Variant B: 59,000 IDR/month  
- Variant C: 69,000 IDR/month

**Metrics:**
- Conversion rate (free to paid)
- Lifetime value (LTV)
- Revenue per user (RPU)
- Churn rate by cohort

**Hypothesis:** 59K IDR offers optimal balance between affordability and revenue maximization.

### Weekly vs Monthly Testing

- Cohort A: Offered weekly option first
- Cohort B: Offered monthly option first
- Measure: Subscription duration, total revenue per user

## Regional Customization

### Indonesia-Specific Considerations

- **Payment Methods:** GoPay, OVO, DANA integration (mobile wallet dominance)
- **Ramadan Pricing:** Special 30-day Ramadan bundle at 99K IDR (time-limited)
- **Minimum Wage Variance:** Consider regional pricing (Jakarta vs. outer islands)

### Thailand-Specific Considerations

- **Payment Methods:** PromptPay, TrueMoney, LINE Pay
- **Buddhist Calendar:** Pricing campaigns aligned with Makha Bucha, Visakha Bucha, Khao Phansa
- **Cultural Pricing:** Thais prefer round numbers (99 THB, 149 THB, 199 THB)

## Revenue Projections

### Conservative Model (12 Months)

**Assumptions:**
- 50,000 MAU by Month 12
- 4% free-to-paid conversion
- Average subscription price: 59K IDR (Indonesia), 149 THB (Thailand)
- 70/30 split Indonesia/Thailand users

**Projected ARR (Year 1):**
- Indonesia: 2,000 paid users × 59K IDR × 12 = 1.416B IDR (~$90K USD/year)
- Thailand: 860 paid users × 149 THB × 12 = 1.54M THB (~$44K USD/year)
- **Total: ~$134K USD ARR at end of Year 1**

### Optimistic Model (With Growth)

**Assumptions:**
- 100,000 MAU by Month 12
- 5% conversion (via improved onboarding + retention mechanics)
- Average price maintained

**Projected ARR:**
- ~$335K USD by end of Year 1
- TAM potential: $30-50M/year at maturity (research estimate)

## Implementation Plan

### Backend Changes Required

1. **RevenueCat Configuration:**
   - Create new product IDs for Standard and Premium tiers
   - Configure weekly, monthly, annual billing cycles
   - Set regional pricing for ID (IDR) and TH (THB)
   - Update webhook handlers for new subscription tiers

2. **Configuration Updates:**
   - File: `src/config/config.ts`
   - Update `freeTierQuota` object with new limits:
     - `compassChatsPerDay`: 3-5 (from 2)
     - `notesPerWeek`: 3 (new field, derived from notesPerDay)
     - `activePathsLimit`: 1 (new field)
     - `wisdomStoriesPerWeek`: 1 (new field)
   - Add `subscriptionTier` enum: `free`, `standard`, `premium`

3. **Entitlement Checks:**
   - File: `src/modules/purchases/domain/services/entitlement-checker.service.ts`
   - Add tier-based feature access logic
   - Update `hasAccess()` method to check tier requirements

4. **Database Schema:**
   - Migration: Add `subscription_tier` column to `user_profiles` table (enum: free, standard, premium)
   - Migration: Add `streak_freeze_count` column for premium feature

### Mobile Changes Required

1. **Paywall UI:**
   - File: `modules/d_payments/lib/presentation/paywall/`
   - Create tier comparison screen
   - Add weekly payment option
   - Implement A/B testing framework for price display

2. **Quota Messaging:**
   - Update quota limit messages across all features
   - Show upgrade prompts when hitting free tier limits
   - Display tier benefits contextually

3. **Payment Integration:**
   - Integrate GoPay, OVO, DANA for Indonesia
   - Integrate PromptPay, TrueMoney for Thailand
   - RevenueCat handles payment method routing

### Testing Requirements

- Unit tests: Entitlement checker logic for all tiers
- E2E tests: Subscription flow for each tier and billing cycle
- Localization tests: Pricing display in IDR/THB
- A/B test analytics: Event tracking for price variant exposure and conversion

## Success Metrics

### Primary Metrics (30/60/90 Days)

- **Conversion Rate:** Target 3-5% (free to paid)
- **Average Revenue Per Paying User (ARPPU):** Target 59K IDR/month
- **Monthly Recurring Revenue (MRR):** Track growth month-over-month
- **Churn Rate:** Target <10% monthly churn

### Secondary Metrics

- **Free Tier Engagement:** Daily active users, feature usage depth
- **Payment Method Mix:** Track adoption of local payment methods
- **Price Point Winner:** Identify optimal price via A/B test
- **Geographic Revenue Split:** Monitor Indonesia vs Thailand performance

## Risk Mitigation

### Risk: Cannibalization of Existing Subscribers

- **Mitigation:** Grandfather existing subscribers at current pricing, offer migration incentive (extra month free)

### Risk: Free Tier Too Generous, Low Conversion

- **Mitigation:** Monitor engagement-to-conversion funnel, adjust limits after 90 days if <2% conversion

### Risk: Regional Pricing Too Low, Unsustainable

- **Mitigation:** Model unit economics at 49K IDR price floor, ensure positive contribution margin with cloud/AI costs

### Risk: Payment Method Integration Delays

- **Mitigation:** Phase 1 launch with existing RevenueCat payment methods, Phase 2 add local wallets

## Competitive Positioning

| App           | Price Range (IDR) | Free Tier               | Our Advantage                                    |
|---------------|-------------------|-------------------------|--------------------------------------------------|
| Muslim Pro    | Free + 50K/mo     | Most features free      | Multi-faith, AI chat, journaling integration     |
| Calm          | 160K/mo           | Limited (7-day trial)   | 60% cheaper, culturally adapted, SEA-focused     |
| Headspace     | 180K/mo           | Limited (14-day trial)  | 67% cheaper, spiritual (not just wellness)       |
| Meditopia     | ~100K/mo          | Limited free tier       | Better localization, faith-specific content      |
| Thai Buddhist Apps | Free        | All features free       | AI intelligence, cross-platform, premium content |

**Positioning:** "Premium spiritual AI guidance at local prices—smarter than free apps, more affordable than Western wellness apps."

## Future Pricing Iterations

### Phase 2 Considerations (Months 7-12)

1. **B2B Corporate Wellness Tier**
   - Enterprise pricing for companies (mental health benefit)
   - White-label option for temples/mosques
   - Bulk licensing for schools, universities

2. **Family Plans**
   - 2-5 users at 1.5x Standard price
   - Shared content, separate profiles

3. **Lifetime Access**
   - One-time payment: 1.5M IDR, 4,500 THB
   - Target early adopters, brand advocates

4. **Dynamic Pricing**
   - Location-based pricing within countries (urban vs rural purchasing power)
   - Event-driven discounts (Ramadan, Buddhist Lent)

## References

- Market Research Document: "Multi-Faith Spiritual AI App: Market Research for Thailand and Indonesia"
- Pricing Analysis Document: "Your Spiritual AI App Has a Wide-Open Market — But Pricing Needs a 70% Cut"
- Current backend config: `src/config/config.ts`
- RevenueCat documentation: https://www.revenuecat.com/docs/

## Appendix: Pricing Calculation Methodology

**Indonesia Pricing Target:**
- Benchmark: 1.5-2% of minimum wage (vs current 6%)
- Minimum wage: 3.2M IDR → Target: 48-64K IDR
- Rounded to: 49K-69K IDR (A/B test range)

**Thailand Pricing Target:**
- Benchmark: 1.5-2% of minimum wage
- Minimum wage: 11,000 THB → Target: 165-220 THB
- Rounded to: 129-199 THB (cultural preference for round numbers)

**Weekly Pricing:**
- Monthly price ÷ 4 × 1.05 (slight premium for flexibility)
- Example: 59K IDR/month → 15.5K/week (rounded to 15K)
