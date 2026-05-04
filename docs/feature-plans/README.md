# Feature Improvement Plans - Backend

> Backend infrastructure plans for Evolusea, supporting mobile app feature improvements based on market research for Thailand and Indonesia spiritual AI markets.

## Overview

These plans outline backend infrastructure required to support strategic mobile app improvements: pricing tiers, free tier quotas, AI personality expansion, retention mechanics (streaks, calendar, mood), and seasonal campaigns.

---

## Plans Index

### 1. Pricing Strategy ([pricing-strategy.md](pricing-strategy.md))

**What:** Backend RevenueCat configuration, subscription tier management, quota enforcement, and webhook handling for revised pricing (Free, Standard 49-69K IDR, Premium 79-99K IDR).

**Why:** Current pricing (199K IDR/month) is 3-4x too expensive. Revised pricing requires backend support for new tiers, regional currencies, and A/B testing.

**Key Sections:**
- RevenueCat product setup (3 tiers, weekly/monthly/annual billing)
- Backend entitlement checks (`hasAccess()` logic per tier)
- Quota enforcement (free tier limits)
- Webhook handlers (subscription events)
- A/B testing backend (price variant tracking)
- Success metrics: 3-5% free-to-paid conversion, $300K ARR Year 1

---

### 2. Free Tier Expansion ([free-tier-expansion.md](free-tier-expansion.md))

**What:** Expanded free tier quotas (3-5 AI messages/day, 3 journal entries/week, 1 active path, unlimited streaks) with backend tracking logic.

**Why:** Generous free tiers drive 2x retention (Insight Timer: 16% D30 vs 4.7% competitors). SEA markets expect spiritual tools to be free or affordable.

**Key Sections:**
- New quota structure (daily, weekly, active limits)
- Database schema (quota tracking columns, periods)
- Quota checker service (daily/weekly reset logic)
- API endpoints (`GET /quotas`, quota exceeded errors)
- Migration from daily to weekly quotas (journal entries, wisdom stories)
- Success metrics: 8-10% D30 retention, 3-5% conversion

---

### 3. AI Personality Expansion ([ai-personality-expansion.md](ai-personality-expansion.md))

**What:** 5 AI personalities (Supportive Friend [free], Calm Monk, Wise Mentor, Gentle Guide, Contemplative Teacher [premium]) with cultural adaptation (Thai Theravada, Indonesian Islam).

**Why:** Personalization drives retention. Free tier gets 1 personality, premium unlocks all 5. Cultural adaptation (Thai polite tone, Indonesian community language) = competitive moat vs Western apps.

**Key Sections:**
- Personality enum and configuration (`PERSONALITY_CONFIG`)
- User profile personality field (database migration)
- Personality-specific prompt templates (`prompts/compass-context.hbs`)
- Cultural tone injection (Thai: ครับ/ค่ะ, Indonesian: "kita" [we])
- Buddhist tradition differentiation (Theravada vs Mahayana)
- API endpoint (`PATCH /users/me/profile/personality`)
- Entitlement checks (premium personalities locked for free tier)
- Success metrics: 40% personality selection rate, 10-15% premium conversion

---

### 4. Retention Backend Infrastructure ([retention-backend.md](retention-backend.md))

**What:** Backend infrastructure for daily streaks, religious calendar reminders, and mood-to-content matching.

**Why:** Retention is existential. Industry average Day 30 retention: 4.7%. Strong mechanics (streaks, holy days, mood) target 8-10%.

**Key Sections:**

**Daily Streaks:**
- Database schema (`user_streaks`, `streak_milestones` tables)
- Streak manager service (record activity, handle freezes, milestone rewards)
- API endpoints (`GET /streak`, `POST /streak/activity`)
- Scheduled tasks (6 PM streak reminders for users at risk)

**Religious Calendar Reminders:**
- Calendar events table (holy days: Makha Bucha, Visakha Bucha, Ramadan, Idul Fitri)
- User calendar preferences (notification enabled, time)
- Scheduled tasks (6 AM holy day notifications)
- API endpoints (`GET /calendar/upcoming`)

**Mood-to-Content Matching:**
- Mood content mapping table (anxious → calming wisdom stories)
- Mood matcher service (returns AI prompts, stories, paths)
- AI Compass mood-aware context (recent mood injected into prompts)
- API endpoints (`POST /mood/check`, `GET /mood/history`)

**Success metrics:** 8-10% D30 retention, 40% streak participation, 30% mood check adoption

---

### 5. Seasonal Content & Marketing Campaigns ([seasonal-content.md](seasonal-content.md))

**What:** Backend infrastructure for seasonal campaigns (Ramadan, Buddhist holy days, Hindu festivals) with time-limited content, notifications, and promotional offers.

**Why:** Muslim Pro sees 10x traffic during Ramadan (100K daily installs vs 10K baseline). Thai temples see 3-5x attendance during Makha Bucha, Visakha Bucha.

**Key Sections:**

**Campaign Infrastructure:**
- Seasonal campaigns table (Ramadan 2026, Visakha Bucha 2026)
- Campaign content repository (30-day Ramadan path, holy day wisdom stories)
- Promotional offers table (30% off for 30 days during Ramadan)
- API endpoint (`GET /campaigns/active`)

**Key Seasonal Events:**
- **Indonesia:** Ramadan (30 days, 10x spike), Idul Fitri, Idul Adha
- **Thailand:** Makha Bucha, Visakha Bucha (most important), Khao Phansa (90-day Buddhist Lent)
- **Indonesia (Bali):** Nyepi (Day of Silence), Galungan
- **Christians:** Christmas, Easter

**Scheduled Tasks:**
- Campaign activator cron (activate/deactivate campaigns based on dates)
- Campaign launch notifications (all target users)

**Success metrics:** 3-10x user acquisition during campaigns, 12-15% D30 retention for campaign cohorts, 8-12% premium conversion

---

## Backend Architecture Overview

### Technology Stack

- **Framework:** NestJS 11.1.3, TypeScript 5.8.3
- **Database:** PostgreSQL 16, TypeORM 0.3.25
- **Authentication:** Firebase Admin SDK, Passport-Firebase-JWT
- **AI:** OpenAI API, Gemini API (abstracted base service)
- **Monitoring:** Sentry, Winston, Loggly
- **Payments:** RevenueCat (subscription management)
- **Deployment:** Docker, AWS (Elastic Beanstalk, ECR, RDS), Terraform
- **Testing:** Vitest (unit), Testcontainers (E2E)

### Key Design Patterns

- **Domain-Driven Design (DDD):** Clear separation (domain, application, infrastructure, HTTP)
- **CQRS:** Command Query Responsibility Segregation
- **Repository Pattern:** Data access abstraction
- **Dependency Injection:** NestJS DI container
- **Event-Driven:** DomainEventMediator for cross-module communication

---

## Database Schema Changes Summary

### New Tables

1. **`user_streaks`** (retention-backend.md)
   - Tracks current streak, longest streak, last activity date, streak freezes

2. **`streak_milestones`** (retention-backend.md)
   - Tracks achieved milestones (7d, 30d, 100d) and rewards

3. **`mood_content_mapping`** (retention-backend.md)
   - Maps mood types (anxious, joyful, stressed) to recommended content

4. **`seasonal_campaigns`** (seasonal-content.md)
   - Campaign metadata (name, dates, target faith/region, content IDs)

5. **`promotional_offers`** (seasonal-content.md)
   - Time-limited pricing discounts for campaigns

### Modified Tables

1. **`user_profiles`**
   - Add `compass_personality` enum (ai-personality-expansion.md)
   - Add `subscription_tier` enum (free, standard, premium) (pricing-strategy.md)
   - Add `notes_quota_period_start`, `wisdom_stories_quota_period_start` (free-tier-expansion.md)
   - Add `streak_freeze_count` (retention-backend.md)

2. **`calendar_events`**
   - Add `notification_template_key`, `recommended_content_ids`, `priority_level` (retention-backend.md)

---

## API Endpoints Summary

### Pricing & Subscriptions

- `POST /api/v1/purchases/sync` - Sync subscription with RevenueCat
- `GET /api/v1/users/me/subscription` - Get current subscription status

### Quotas

- `GET /api/v1/users/me/quotas` - Get all quota limits and usage
- (Quota checks embedded in feature endpoints: `/compass`, `/notes`, `/paths`)

### Personalities

- `PATCH /api/v1/users/me/profile/personality` - Update AI personality
- `GET /api/v1/personalities` - List all personalities (with premium locks)

### Streaks

- `GET /api/v1/users/me/streak` - Get current streak status
- `POST /api/v1/users/me/streak/activity` - Record activity (internal, auto-called)
- `GET /api/v1/users/me/streak/milestones` - Get milestone achievements

### Calendar

- `GET /api/v1/calendar/upcoming` - Get upcoming holy days (7-day window)
- `PATCH /api/v1/users/me/calendar-preferences` - Update notification preferences

### Mood

- `POST /api/v1/mood/check` - Check mood, get recommendations
- `GET /api/v1/mood/history?days=7` - Get mood history (free: 7 days, premium: unlimited)

### Campaigns

- `GET /api/v1/campaigns/active` - Get active seasonal campaign

---

## Integration Points

### Mobile → Backend

1. **Feature Interactions → Streak Recording:**
   - Every Compass message, note creation, mood check → calls `/streak/activity`
   - Backend handles idempotency (same day = no duplicate)

2. **Quota Enforcement:**
   - Mobile checks quota before action (show upgrade prompt if exceeded)
   - Backend enforces quota (returns 403 if limit reached)

3. **Personality Selection:**
   - Mobile displays 5 personalities, locks 4 for free tier
   - Backend validates entitlement before updating personality

### Backend → Mobile (Push Notifications)

1. **Streak Reminders:**
   - Backend cron (6 PM daily) → FCM push notification → Mobile displays
   - Deep link: `/compass` (encourages interaction)

2. **Holy Day Reminders:**
   - Backend cron (6 AM on holy days) → FCM push notification → Mobile displays
   - Deep link: `/wisdom-stories/{event-id}`

3. **Campaign Launch:**
   - Backend cron (campaign start date) → FCM push notification → Mobile displays
   - Deep link: `/campaigns`

---

## Testing Strategy

### Unit Tests

- Quota checker logic (daily/weekly resets, active limits)
- Streak manager (consecutive days, freezes, milestones)
- Personality entitlement checks (free vs premium)
- Mood-to-content matching (correct recommendations per mood)

### E2E Tests (Testcontainers)

- Subscription purchase flow (RevenueCat webhook → backend sync → quota update)
- Streak flow (user active Day 1, Day 2, miss Day 3 → streak reset)
- Campaign activation (cron job → campaign activated → API returns active campaign)
- Mood recommendations (check anxious mood → API returns calming content)

### Load Tests

- Quota queries (10K req/sec at peak)
- Streak activity recording (10K req/sec)
- Calendar event queries (5K req/sec)

---

## Rollout Plan Summary

### Phase 1: Pricing & Quotas (Weeks 1-2)

- RevenueCat product configuration
- Backend subscription tier logic
- Quota enforcement (free tier limits)
- Deploy to staging, test purchase flows

### Phase 2: AI Personalities (Weeks 2-3)

- Personality enum, database migration
- Prompt templates (5 personalities × 3 cultures)
- API endpoints (personality selection)
- Cultural consultant review (Thai monk, Indonesian scholar)

### Phase 3: Retention Infrastructure (Weeks 3-4)

- Streak tracking (tables, service, API)
- Calendar events (populate holy days, scheduled tasks)
- Mood-to-content matching (mapping table, service)
- Deploy to staging, test E2E

### Phase 4: Seasonal Campaigns (Weeks 4-5)

- Campaign infrastructure (tables, API)
- Populate Ramadan 2026, Visakha Bucha 2026 campaigns
- Scheduled tasks (campaign activator)
- Deploy to production with feature flag

---

## Success Metrics (Year 1 Targets)

| Metric | Baseline | Target |
|--------|----------|--------|
| **API Uptime** | 99.5% | 99.9% |
| **P95 Latency** | 200ms | <150ms |
| **D30 Retention** | 4.7% | 8-10% |
| **Free-to-Paid** | 2-3% | 5-7% |
| **ARR** | $50K | $300K-400K |
| **Error Rate** | 0.5% | <0.1% |

---

## Related Documentation

### Mobile Plans

See `evolusea-mobile/docs/feature-plans/` for:
- Mobile pricing strategy (paywall UI, RevenueCat integration)
- Onboarding optimization (4-step flow, aha moment)
- Retention mechanics (streak display, mood recommendations)
- Localization strategy (cultural adaptation, payment methods)
- Distribution channels (LINE, WhatsApp, TikTok)
- Phased roadmap (12-month strategic plan)

### Architecture Docs

See `docs/` for:
- `architecture.md` - System architecture (DDD, CQRS, layers)
- `api-reference.md` - Full API endpoint documentation
- `database-schema.md` - Database schema, ER diagrams
- `ai-integration.md` - AI service architecture (OpenAI/Gemini)
- `domain-modules.md` - All 11 domain modules breakdown

---

## Contact & Contributions

**Backend Questions:** Contact Backend Engineering Team  
**Infrastructure Questions:** Contact DevOps Team  
**API Questions:** See `api-reference.md` or Swagger docs

**Feedback:** These plans are living documents. Submit improvements via pull request or team discussion.

---

## Conclusion

These backend feature plans provide the infrastructure foundation for Evolusea's mobile app strategic improvements. By implementing revised pricing tiers, generous free tier quotas, culturally adapted AI personalities, robust retention mechanics (streaks, calendar, mood), and seasonal campaign infrastructure, the backend enables the mobile app to target 100K MAU, 8-10% D30 retention, and $300K ARR by end of Year 1.

**Core Principle:** Backend = enabler. Mobile = experience. Together = competitive moat.
