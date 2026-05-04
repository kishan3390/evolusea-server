# Free Tier Expansion

## Executive Summary

The current free tier quotas are restrictive and may hinder user habit formation before monetization. This document proposes expanding the free tier to match successful competitors (e.g., Insight Timer's generous free model achieves 16% D30 retention vs. 8% industry average) while maintaining clear premium upgrade paths.

## Strategic Rationale

### Why Expand the Free Tier?

1. **Habit Formation Before Monetization**
   - Users need 7-21 days to form daily app habits
   - Restrictive free tiers prevent habit formation
   - Converting engaged users is easier than converting curious visitors

2. **Regional Market Expectations**
   - SEA markets expect spiritual/religious tools to be free
   - Muslim Pro (180M downloads): Most features free
   - Thai Buddhist apps: Entirely free with no premium tiers
   - Trust must be earned before asking for payment

3. **Retention Data**
   - Insight Timer (generous free tier): 16% Day 30 retention
   - Competitors (limited free): 4.7-8% Day 30 retention
   - **2x retention improvement from generous free tier**

4. **Monetization Path**
   - Free users = potential ad revenue (non-intrusive, not on spiritual content screens)
   - Free users = viral growth engine (word-of-mouth)
   - Engaged free users convert at 3-5% (industry standard)

5. **Competitive Necessity**
   - Meditopia threat: Has AI + better UX, if they localize to SEA we need stronger retention
   - Premium features must be *genuinely* premium, not paywalled basics

## Current Free Tier Analysis

### Current Quotas (from `src/config/config.ts`)

```typescript
freeTierQuota: {
  compassChatsPerDay: 2,
  notesPerDay: 3,
  pathsPerDay: 3,
  visionBoardsTotal: 1,
  // Other quotas may exist but not visible
}
```

### Issues with Current Model

| Feature | Current Limit | Issue |
|---------|--------------|-------|
| Compass Chats | 2/day | Too low for meaningful AI conversation (3-5 exchanges needed per session) |
| Notes | 3/day | Daily limit doesn't match weekly journaling habits |
| Paths | 3/day | Daily creation limit is strange UX (users create paths infrequently, work on them daily) |
| Vision Boards | 1 total | Too restrictive, blocks exploration |
| Quotes | Unknown | Should be unlimited (low cost, high value) |
| Wisdom Stories | Unknown | No tracking mechanism for free tier limit |
| Streaks | Unknown | Must be free (retention driver) |
| Mood Tracking | Unknown | Should be free but limited history (7 days) |

## Proposed Free Tier Structure

### New Quota Model

| Feature | Proposed Limit | Rationale |
|---------|---------------|-----------|
| **AI Messages** | 3-5 per day | Allows one meaningful conversation (5-7 message exchanges). Higher than current "chats" which may mean conversations, not messages |
| **Daily Quote** | 1 per day | Free forever (low cost, high engagement, shareability) |
| **Mood Tracking** | 7-day history | Enough to see patterns, premium = unlimited history + analytics |
| **Journal Entries** | 3 per week | Aligns with natural journaling cadence (not daily for most users) |
| **Wisdom Stories** | 1 per week | Discovery + retention hook, premium = unlimited access to library |
| **Vision Boards** | 1 active board | Users can create one, must delete to create another. Premium = unlimited |
| **Paths (Goal Tracking)** | 1 active path | Users can track one goal at a time. Premium = unlimited concurrent paths |
| **Streaks** | Unlimited | **Must be free** — strongest retention mechanic, locking it kills engagement |
| **Calendar Events** | View only | Free users see Buddhist/Islamic holy days. Premium = custom reminders |

### Key Changes from Current

1. **Shift from "per day" to "per week" for journaling:** Better matches user behavior
2. **Introduce "active limit" for paths/vision boards:** More intuitive than daily creation limits
3. **Explicit tracking for wisdom stories:** Backend must implement weekly quota
4. **Mood tracking with history limit:** New feature differentiation (free = 7 days, premium = unlimited + insights)
5. **AI message clarity:** Change from "chats per day" to "messages per day" for user clarity

## Implementation Requirements

### Backend Configuration Changes

#### 1. Update `src/config/config.ts`

**Current Structure:**
```typescript
freeTierQuota: {
  compassChatsPerDay: 2,
  notesPerDay: 3,
  pathsPerDay: 3,
  visionBoardsTotal: 1,
}
```

**Proposed Structure:**
```typescript
freeTierQuota: {
  // AI & Content
  compassMessagesPerDay: 5, // Changed from compassChatsPerDay, increased from 2
  dailyQuotesPerDay: 1, // Explicit (currently unlimited?)
  wisdomStoriesPerWeek: 1, // NEW: Requires weekly quota tracking
  
  // Journaling & Mood
  notesPerWeek: 3, // Changed from notesPerDay (3/day → 3/week)
  moodTrackingHistoryDays: 7, // NEW: Free tier limited history
  
  // Goals & Boards
  activePathsLimit: 1, // Changed from pathsPerDay (creation limit → active limit)
  activeVisionBoardsLimit: 1, // Changed from visionBoardsTotal (clearer naming)
  
  // Retention Features
  streaksEnabled: true, // Explicit flag (must always be true for free tier)
  calendarEventsViewOnly: true, // NEW: Can view events but not create custom reminders
}
```

#### 2. New Quota Tracking Logic

**Weekly Quota Tracking:**
- Current system: Daily quotas reset at midnight (UTC or user timezone?)
- New requirement: Weekly quotas (notes, wisdom stories)
- Implementation: Track `quota_period_start` timestamp, reset when `NOW() - quota_period_start > 7 days`

**Active Limit Tracking:**
- Current system: Counts creations per day
- New requirement: Count active items (paths, vision boards)
- Implementation: Query `COUNT(*) WHERE user_id = ? AND status = 'active'` before allowing creation

**File Changes Required:**
```
src/modules/domain-module-name/application/queries/check-quota.handler.ts
src/modules/domain-module-name/application/commands/create-item.handler.ts
src/modules/domain-module-name/domain/services/quota-checker.service.ts
```

#### 3. Database Schema Updates

**New Columns in `user_profiles` table:**
```sql
ALTER TABLE user_profiles 
ADD COLUMN notes_quota_period_start TIMESTAMP DEFAULT NOW(),
ADD COLUMN wisdom_stories_quota_period_start TIMESTAMP DEFAULT NOW(),
ADD COLUMN mood_tracking_retention_days INTEGER DEFAULT 7;
```

**New Table for Quota Tracking (optional, if granular tracking needed):**
```sql
CREATE TABLE user_quotas (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  quota_type VARCHAR(50), -- 'notes_weekly', 'wisdom_stories_weekly', etc.
  quota_period_start TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  limit_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. Entitlement Checker Updates

**File:** `src/modules/purchases/domain/services/entitlement-checker.service.ts`

**New Methods:**
```typescript
async canCreateNote(userId: string): Promise<boolean> {
  const userTier = await this.getUserTier(userId);
  if (userTier !== 'free') return true; // Unlimited for paid
  
  const weeklyUsage = await this.getWeeklyNoteCount(userId);
  return weeklyUsage < config.freeTierQuota.notesPerWeek;
}

async canAccessWisdomStory(userId: string): Promise<boolean> {
  const userTier = await this.getUserTier(userId);
  if (userTier !== 'free') return true;
  
  const weeklyUsage = await this.getWeeklyWisdomStoryCount(userId);
  return weeklyUsage < config.freeTierQuota.wisdomStoriesPerWeek;
}

async canCreatePath(userId: string): Promise<boolean> {
  const userTier = await this.getUserTier(userId);
  if (userTier !== 'free') return true;
  
  const activePathsCount = await this.getActivePathsCount(userId);
  return activePathsCount < config.freeTierQuota.activePathsLimit;
}

async canSendCompassMessage(userId: string): Promise<boolean> {
  const userTier = await this.getUserTier(userId);
  if (userTier !== 'free') return true;
  
  const dailyUsage = await this.getDailyCompassMessageCount(userId);
  return dailyUsage < config.freeTierQuota.compassMessagesPerDay;
}

async getMoodTrackingHistory(userId: string): Promise<MoodEntry[]> {
  const userTier = await this.getUserTier(userId);
  const retentionDays = userTier === 'free' 
    ? config.freeTierQuota.moodTrackingHistoryDays 
    : 365; // Unlimited for paid (1 year = effectively unlimited)
  
  return this.moodRepository.find({
    where: { userId, createdAt: MoreThan(subDays(new Date(), retentionDays)) }
  });
}
```

### Mobile Changes Required

#### 1. Quota Messaging Updates

**Before (example):**
> "You've used 2 of 2 daily AI chats. Upgrade to unlimited."

**After (clearer, friendlier):**
> "You've used 5 of 5 daily AI messages. Chat unlimited tomorrow or [Upgrade Now]."

**Files Affected:**
- `modules/d_compass/lib/presentation/widgets/quota_message.dart`
- `modules/d_notes/lib/presentation/widgets/quota_message.dart`
- `modules/d_paths/lib/presentation/widgets/quota_message.dart`

#### 2. Feature Lock Indicators

**New UX:**
- Vision Boards: "You have 1 active vision board. Delete it to create a new one, or [Upgrade] for unlimited boards."
- Paths: "Track 1 goal at a time (free) or [Upgrade] to track multiple goals."
- Mood History: "View 7-day mood trends (free) or [Upgrade] for lifetime insights."

#### 3. Weekly Quota Display

**Implementation:**
- Show "3 journal entries remaining this week" (not "3 today")
- Show countdown to quota reset: "Resets in 4 days"

**Files Affected:**
- `modules/d_notes/lib/presentation/cubit/notes_cubit.dart`
- `modules/d_wisdom_stories/lib/presentation/cubit/wisdom_stories_cubit.dart`

### API Changes Required

#### 1. New Quota Check Endpoints

**GET `/api/v1/users/me/quotas`**

Response:
```json
{
  "compassMessages": {
    "used": 3,
    "limit": 5,
    "resetsAt": "2026-02-08T00:00:00Z"
  },
  "notes": {
    "used": 1,
    "limit": 3,
    "resetsAt": "2026-02-11T08:30:00Z"
  },
  "wisdomStories": {
    "used": 1,
    "limit": 1,
    "resetsAt": "2026-02-11T08:30:00Z"
  },
  "activePaths": {
    "used": 1,
    "limit": 1
  },
  "activeVisionBoards": {
    "used": 1,
    "limit": 1
  }
}
```

**Files to Create:**
- `src/modules/users/application/queries/get-user-quotas.query.ts`
- `src/modules/users/application/queries/get-user-quotas.handler.ts`
- `src/modules/users/http/controllers/users.controller.ts` (new endpoint)

#### 2. Updated Error Responses

**When quota exceeded:**

```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Weekly journal entry limit reached (3/3 used). Resets in 4 days.",
  "details": {
    "quotaType": "notes_per_week",
    "used": 3,
    "limit": 3,
    "resetsAt": "2026-02-11T08:30:00Z",
    "upgradeUrl": "/payments/paywall"
  }
}
```

## Testing Strategy

### Unit Tests

1. **Quota Checker Service:**
   - Test daily reset logic (compass messages, daily quotes)
   - Test weekly reset logic (notes, wisdom stories)
   - Test active limit logic (paths, vision boards)
   - Test tier-based bypasses (paid users get unlimited)

2. **Entitlement Service:**
   - Test free tier enforcement
   - Test standard/premium tier unlimited access
   - Test quota retrieval for API responses

### E2E Tests

1. **Free User Journey:**
   - Create account → Use 5 AI messages → Hit limit → See upgrade prompt
   - Create 3 journal entries in week → Hit limit → Cannot create 4th
   - Create 1 path → Cannot create 2nd → Must delete first
   - Access 1 wisdom story this week → Cannot access 2nd

2. **Quota Reset:**
   - Wait for daily reset (compass messages)
   - Wait for weekly reset (notes, wisdom stories)
   - Verify quota counters reset correctly

3. **Upgrade Flow:**
   - Free user hits limit → Upgrades to Standard → All limits removed

### Migration Testing

1. **Existing Free Users:**
   - Test quota counter initialization for existing users
   - Ensure no disruption to current usage patterns

2. **Grandfathered Paid Users:**
   - Verify existing paid users maintain unlimited access
   - No unexpected quota enforcement

## Rollout Plan

### Phase 1: Backend Implementation (Week 1-2)

1. Update `config.ts` with new quota structure
2. Implement weekly quota tracking logic
3. Implement active limit tracking logic
4. Update entitlement checker service
5. Create quota API endpoint
6. Write unit tests
7. Database migration (quota tracking columns)

### Phase 2: API Updates (Week 2-3)

1. Update existing endpoints to use new quota checks
2. Update error responses with new messaging
3. Deploy to staging environment
4. E2E testing with Testcontainers

### Phase 3: Mobile Updates (Week 3-4)

1. Update quota messaging strings (localization)
2. Update UI components for weekly quotas
3. Update active limit displays
4. Integrate new quota API endpoint
5. Test quota enforcement flows

### Phase 4: Monitoring & Iteration (Week 4-8)

1. Deploy to production with feature flag (rollout 10% → 50% → 100%)
2. Monitor key metrics:
   - Free tier engagement (DAU, feature usage)
   - Conversion rate (free to paid)
   - Churn rate (free users abandoning app)
3. Iterate quota limits based on data:
   - If conversion <2%: Reduce free tier limits
   - If engagement dropping: Increase free tier limits
   - If retention improving: Maintain or slightly expand

## Success Metrics

### Primary KPIs (30/60/90 Days)

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **Day 30 Retention** | Unknown (TBD) | 8-10% | % of new users returning on Day 30 |
| **Free-to-Paid Conversion** | Unknown | 3-5% | % of free users upgrading within 90 days |
| **Weekly Active Users (Free)** | Unknown | 60% of registrations | % of free users active weekly |
| **AI Message Usage (Free)** | Unknown | 3.5 avg/day | Average AI messages per free user per day |
| **Journal Entry Usage (Free)** | Unknown | 2 avg/week | Average journal entries per free user per week |

### Secondary Metrics

- **Quota Hit Rate:** % of free users hitting daily/weekly limits (target: 20-30% hitting limits = engaged users ready to convert)
- **Feature Adoption:** % of free users trying each feature (target: >40% for core features)
- **Time to First Upgrade:** Days from registration to first payment (target: 14-21 days)

### Warning Signs (Adjust if Seen)

- Free tier engagement <30% WAU → Free tier too restrictive
- Conversion rate <2% → Free tier too generous OR premium tier not compelling
- Churn spike after hitting quota → Quota messaging too aggressive OR limits too low

## Risk Assessment

### Risk: Free Tier Too Generous → Low Conversion

**Likelihood:** Medium  
**Impact:** High (revenue impact)

**Mitigation:**
- Set initial quotas conservatively (lower end of ranges)
- Monitor conversion rates closely in first 60 days
- Adjust quotas downward if conversion <2%
- Ensure premium features are genuinely premium (analytics, streak freezes, exclusive content)

### Risk: Weekly Quotas Confusing to Users

**Likelihood:** Low  
**Impact:** Medium (UX friction)

**Mitigation:**
- Clear messaging: "3 journal entries per week (resets in 4 days)"
- Visual quota indicators (progress bars)
- Localization testing with Thai/Indonesian users for clarity

### Risk: Backend Performance (Weekly Quota Queries)

**Likelihood:** Low  
**Impact:** Medium (API latency)

**Mitigation:**
- Index `user_id` and `created_at` columns for quota queries
- Cache quota counters in Redis (invalidate on creation)
- Load test weekly quota queries with 100K+ users

### Risk: Unintended Quota Bypass

**Likelihood:** Low  
**Impact:** High (free tier abuse)

**Mitigation:**
- Thorough unit testing of quota checker logic
- Security audit of entitlement checks (ensure client can't bypass)
- Rate limiting at API gateway level (backup enforcement)

## Competitive Analysis: Free Tier Comparison

| App | Free Tier | Premium Price | Our Strategy |
|-----|-----------|---------------|--------------|
| **Insight Timer** | Generous (most features free, 16% D30 retention) | $60/year | **Match generosity** — retention proven |
| **Calm** | 7-day trial only | $70-160K IDR/mo | **More generous** — we offer perpetual free tier |
| **Headspace** | 14-day trial only | $180K IDR/mo | **More generous** — trials convert poorly in SEA |
| **Muslim Pro** | Most features free | ~50K IDR/mo | **Match** — spiritual apps must have strong free tier |
| **Thai Buddhist Apps** | Entirely free | No premium | **Balance** — we add premium AI/analytics but keep core free |

**Key Insight:** Apps with generous free tiers (Insight Timer, Muslim Pro) dominate SEA markets. Paid-only models (Calm, Headspace) struggle in price-sensitive regions.

## Future Iterations

### Potential Adjustments (Months 6-12)

1. **Dynamic Quotas Based on Engagement**
   - Highly engaged free users get bonus quotas (gamification)
   - Example: "7-day streak unlocked! Bonus 3 AI messages today."

2. **Seasonal Quota Boosts**
   - Ramadan: Double free tier quotas for 30 days
   - Buddhist Lent: Triple wisdom story access
   - Drives retention during high-intent periods

3. **Referral Rewards**
   - Refer a friend → Both get +5 AI messages for a week
   - Viral growth incentive for free users

4. **Ad-Supported Free Tier**
   - Non-intrusive ads on non-spiritual screens (settings, profile)
   - Remove ads = Premium feature
   - Monetize free users while maintaining experience quality

## Appendix: Research Citations

### Supporting Data

1. **Insight Timer Retention:**
   > "Insight Timer's generous free tier contributes to 16% Day 30 retention vs 4.7% industry average." — Market Research Document

2. **Pricing Sensitivity:**
   > "At 199,000 IDR/month, you're pricing yourself at 6% of minimum wage—equivalent to asking Americans to pay $280/month." — Pricing Analysis Document

3. **Conversion Rates:**
   > "Industry average free-to-paid conversion: 2-4%. Best-in-class (with generous free tier): 5-7%." — Market Research Document

4. **SEA Market Expectations:**
   > "Muslim Pro (180M downloads) keeps most features free. Thai Buddhist apps have no premium tiers at all. SEA users expect spiritual tools to be free." — Market Research Document

## Conclusion

Expanding the free tier is not just about generosity—it's a strategic imperative for retention, viral growth, and competitive positioning in Southeast Asian markets. By aligning quotas with user behavior patterns (weekly journaling, active goal limits) and regional expectations (generous spiritual app access), we create a sustainable path to 3-5% free-to-paid conversion while building the daily habits that drive long-term retention.

**Core Principle:** Give enough for free to build trust and habit. Make premium genuinely premium, not paywalled basics.
