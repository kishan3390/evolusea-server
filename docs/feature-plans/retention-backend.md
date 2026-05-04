# Retention Backend Infrastructure

## Executive Summary

Retention is existential for Evolusea's success. Industry average Day 30 retention is 4.7%; apps with strong retention mechanics (Insight Timer, Duolingo) achieve 12-16%. This document outlines the backend infrastructure required to support three critical retention mechanics: Daily Streaks, Religious Calendar Reminders, and Mood-to-Content Matching.

## Strategic Importance

### Why Retention Infrastructure Matters

1. **Unit Economics Dependency**
   - Customer Acquisition Cost (CAC): ~$5-10 in SEA markets
   - Lifetime Value (LTV) at 4.7% D30 retention: ~$15-20
   - **LTV at 12% D30 retention: ~$45-60** (3x improvement)
   - Retention directly determines profitability

2. **Competitive Moats**
   - AI chat = easily copied by competitors
   - Daily habits + personalized content = hard to replicate
   - Users with 7-day streaks have 80% lower churn (industry data)

3. **Viral Growth Enabler**
   - Retained users = referral engine (NPS increases with usage time)
   - Inactive users don't refer, don't convert to paid

4. **SEA Market Specifics**
   - Religious calendar integration = strongest retention driver in SEA (Muslim Pro's success proof)
   - Habit stacking on existing religious practices (prayer times, holy days) = 2x retention boost

## Retention Mechanics Overview

### 1. Daily Streak System

**Goal:** 8-10% Day 30 retention (vs 4.7% industry average)

**Mechanics:**
- Track consecutive days of app interaction (any feature usage counts)
- Visual streak counter in app (gamification)
- Milestone rewards (7d, 30d, 100d)
- Streak freezes (premium feature: miss a day but don't lose streak)
- Push notifications: "Don't break your 5-day streak!"

**Why It Works:**
- Duolingo: 13% D30 retention attributed to streaks
- Snapchat: Streaks drove teen engagement 40% higher
- Loss aversion psychology: Users fear losing progress

---

### 2. Religious Calendar Reminders

**Goal:** 15% engagement lift during holy periods (Ramadan, Buddhist holy days)

**Mechanics:**
- Backend calendar of Buddhist, Islamic, Christian, Hindu holy days
- Personalized push notifications: "Today is Makha Bucha (มาฆบูชา). Reflect on the Buddha's teachings."
- Faith-specific content delivery: Special wisdom stories, AI Compass prompts for holy days
- Regional customization: Thai Buddhist holidays, Indonesian Islamic holidays

**Why It Works:**
- Muslim Pro: 100K daily installs during Ramadan (10x baseline)
- Religious practice = existing habit, we piggyback on it
- Emotional resonance: Spiritual app supporting existing faith practices

---

### 3. Mood-to-Content Matching

**Goal:** 25% increase in session depth (messages per session)

**Mechanics:**
- After mood check, recommend relevant content: "Feeling anxious? Here's a calming practice."
- AI Compass mood-aware responses: "I noticed you've been stressed this week. Let's explore what's weighing on you."
- Wisdom stories matched to mood: Stressed → Patience stories, Joyful → Gratitude stories
- Path suggestions: Anxious → "Start a '7 Days of Calm' path"

**Why It Works:**
- Personalization increases engagement 2-3x (Netflix, Spotify data)
- Mood tracking = psychological tool, content matching = value delivery
- Users return when app "understands" them

---

## Backend Implementation Requirements

### 1. Daily Streak System

#### Database Schema Changes

**New Table: `user_streaks`**

```sql
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE NOT NULL,
  streak_freeze_count INTEGER DEFAULT 0, -- Premium feature: number of freezes available
  total_checkins INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_user_streak UNIQUE(user_id)
);

CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX idx_user_streaks_current_streak ON user_streaks(current_streak); -- For leaderboards
```

**New Table: `streak_milestones`**

```sql
CREATE TABLE streak_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  milestone_days INTEGER NOT NULL, -- 7, 30, 100, etc.
  achieved_at TIMESTAMP DEFAULT NOW(),
  reward_type VARCHAR(50), -- 'badge', 'bonus_ai_messages', 'premium_trial', etc.
  reward_claimed BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT unique_user_milestone UNIQUE(user_id, milestone_days)
);

CREATE INDEX idx_streak_milestones_user_id ON streak_milestones(user_id);
```

#### Streak Service Implementation

**File:** `src/modules/streaks/domain/services/streak-manager.service.ts` (new module)

```typescript
@Injectable()
export class StreakManagerService {
  constructor(
    private readonly streakRepository: StreakRepository,
    private readonly milestoneRepository: MilestoneRepository,
    private readonly entitlementChecker: EntitlementCheckerService,
  ) {}

  async recordActivity(userId: string): Promise<StreakStatus> {
    const streak = await this.streakRepository.findByUserId(userId);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!streak) {
      // First-time user
      return this.createStreak(userId, today);
    }
    
    if (streak.lastActivityDate === today) {
      // Already checked in today, no change
      return this.toStreakStatus(streak);
    }
    
    const yesterday = this.getYesterday(today);
    
    if (streak.lastActivityDate === yesterday) {
      // Consecutive day, increment streak
      streak.currentStreak += 1;
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      streak.totalCheckins += 1;
      streak.lastActivityDate = today;
      
      await this.streakRepository.save(streak);
      await this.checkMilestones(userId, streak.currentStreak);
      
      return this.toStreakStatus(streak);
    }
    
    // Missed a day, check for streak freeze
    const hasPremium = await this.entitlementChecker.hasPremiumTier(userId);
    if (hasPremium && streak.streakFreezeCount > 0) {
      // Use streak freeze
      streak.streakFreezeCount -= 1;
      streak.lastActivityDate = today;
      streak.totalCheckins += 1;
      
      await this.streakRepository.save(streak);
      
      return { ...this.toStreakStatus(streak), streakFreezeUsed: true };
    }
    
    // Streak broken, reset to 1
    streak.currentStreak = 1;
    streak.lastActivityDate = today;
    streak.totalCheckins += 1;
    
    await this.streakRepository.save(streak);
    
    return { ...this.toStreakStatus(streak), streakBroken: true };
  }
  
  async grantStreakFreeze(userId: string, count: number = 1): Promise<void> {
    const streak = await this.streakRepository.findByUserId(userId);
    if (!streak) return;
    
    streak.streakFreezeCount += count;
    await this.streakRepository.save(streak);
  }
  
  private async checkMilestones(userId: string, currentStreak: number): Promise<void> {
    const milestones = [7, 30, 50, 100, 200, 365];
    const achieved = milestones.find(m => m === currentStreak);
    
    if (achieved) {
      await this.milestoneRepository.create({
        userId,
        milestoneDays: achieved,
        rewardType: this.getRewardType(achieved),
      });
      
      // Emit event for notification
      await this.eventPublisher.publish(
        new StreakMilestoneAchievedEvent(userId, achieved)
      );
    }
  }
  
  private getRewardType(days: number): string {
    if (days === 7) return 'bonus_ai_messages'; // +5 AI messages for 1 day
    if (days === 30) return 'premium_trial'; // 3-day premium trial
    if (days === 100) return 'badge_100'; // Special badge
    return 'badge';
  }
}
```

#### API Endpoints

**GET `/api/v1/users/me/streak`**

Response:
```json
{
  "currentStreak": 12,
  "longestStreak": 45,
  "lastActivityDate": "2026-02-07",
  "streakFreezesAvailable": 2,
  "nextMilestone": 30,
  "daysUntilMilestone": 18,
  "totalCheckins": 67
}
```

**POST `/api/v1/users/me/streak/activity`** (internal, called by any feature interaction)

- Automatically called when user sends Compass message, creates note, checks mood, etc.
- Idempotent (multiple calls on same day don't increment streak)

**GET `/api/v1/users/me/streak/milestones`**

Response:
```json
{
  "milestones": [
    {
      "days": 7,
      "achievedAt": "2026-01-25T10:30:00Z",
      "rewardType": "bonus_ai_messages",
      "rewardClaimed": true
    },
    {
      "days": 30,
      "achievedAt": null, // Not yet achieved
      "rewardType": "premium_trial",
      "rewardClaimed": false
    }
  ]
}
```

#### Scheduled Task: Streak Reminder Notifications

**File:** `src/modules/streaks/application/cron/streak-reminder.cron.ts`

```typescript
@Injectable()
export class StreakReminderCron {
  @Cron('0 18 * * *') // 6 PM daily (adjust per timezone)
  async sendStreakReminders(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // Find users with active streaks who haven't checked in today
    const usersAtRisk = await this.streakRepository.findUsersWithoutActivityToday(today);
    
    for (const user of usersAtRisk) {
      if (user.currentStreak >= 3) { // Only remind if streak >= 3 days
        await this.notificationService.send({
          userId: user.id,
          title: `Don't break your ${user.currentStreak}-day streak!`,
          body: 'Take a moment to check in with yourself today.',
          deepLink: '/compass',
        });
      }
    }
  }
}
```

---

### 2. Religious Calendar Reminders

#### Database Schema Changes

**Expand Existing `calendar_events` Table:**

**Current Schema (assumed):**
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  event_date DATE,
  faith_tradition VARCHAR(50), -- 'buddhism', 'islam', 'christianity', 'hinduism'
  region VARCHAR(10), -- 'TH', 'ID', 'global'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**New Columns:**
```sql
ALTER TABLE calendar_events
ADD COLUMN notification_template_key VARCHAR(100), -- Key for localized notification
ADD COLUMN recommended_content_ids UUID[], -- Array of wisdom story IDs or path IDs
ADD COLUMN priority_level INTEGER DEFAULT 1; -- 1 = major holy day, 2 = minor, 3 = observance

CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX idx_calendar_events_faith ON calendar_events(faith_tradition);
CREATE INDEX idx_calendar_events_region ON calendar_events(region);
```

**New Table: `user_calendar_preferences`**

```sql
CREATE TABLE user_calendar_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  faith_tradition VARCHAR(50),
  region VARCHAR(10),
  notification_enabled BOOLEAN DEFAULT TRUE,
  notification_time TIME DEFAULT '07:00:00', -- User's preferred notification time
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_user_calendar_pref UNIQUE(user_id)
);

CREATE INDEX idx_calendar_prefs_user_id ON user_calendar_preferences(user_id);
```

#### Calendar Data: Key Holy Days

**Thailand (Buddhist):**
- Makha Bucha (มาฆบูชา): February/March (full moon, 3rd lunar month)
- Visakha Bucha (วิสาขบูชา): May (full moon, 6th lunar month, Buddha's birth/enlightenment/death)
- Asalha Bucha (อาสาฬหบูชา): July (full moon, 8th lunar month, Buddha's first sermon)
- Khao Phansa (เข้าพรรษา): July (Buddhist Lent begins, 3-month rainy season retreat)
- Wan Phra (วันพระ): Every lunar quarter (4 times/month, temple visit days)

**Indonesia (Islamic):**
- Ramadan: 9th month of Islamic calendar (30 days of fasting)
- Idul Fitri (Eid al-Fitr): End of Ramadan
- Idul Adha (Eid al-Adha): Festival of Sacrifice
- Maulid Nabi Muhammad: Prophet's birthday
- Lailat al-Qadr: Night of Power (last 10 days of Ramadan)
- Friday prayers (Jumu'ah): Weekly

**Indonesia (Hindu - Bali):**
- Nyepi: Balinese Day of Silence (March/April)
- Galungan: Victory of dharma over adharma (every 210 days)
- Kuningan: 10 days after Galungan

**Indonesia/Thailand (Christian minorities):**
- Christmas, Easter, Ash Wednesday, Good Friday

#### Calendar Service Implementation

**File:** `src/modules/calendar/domain/services/calendar-event.service.ts`

```typescript
@Injectable()
export class CalendarEventService {
  async getUpcomingEvents(userId: string, days: number = 7): Promise<CalendarEvent[]> {
    const userPref = await this.calendarPrefRepository.findByUserId(userId);
    if (!userPref) return [];
    
    const startDate = new Date();
    const endDate = addDays(startDate, days);
    
    return this.calendarEventRepository.find({
      where: {
        eventDate: Between(startDate, endDate),
        faithTradition: userPref.faithTradition,
        region: In([userPref.region, 'global']),
      },
      order: { eventDate: 'ASC', priorityLevel: 'ASC' },
    });
  }
  
  async getRecommendedContentForEvent(eventId: string): Promise<Content[]> {
    const event = await this.calendarEventRepository.findById(eventId);
    if (!event || !event.recommendedContentIds) return [];
    
    return this.wisdomStoryRepository.findByIds(event.recommendedContentIds);
  }
}
```

#### Scheduled Task: Holy Day Notifications

**File:** `src/modules/calendar/application/cron/holy-day-notifications.cron.ts`

```typescript
@Injectable()
export class HolyDayNotificationsCron {
  @Cron('0 6 * * *') // 6 AM daily, then adjust per user timezone
  async sendHolyDayNotifications(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const eventsToday = await this.calendarEventRepository.findByDate(today);
    
    for (const event of eventsToday) {
      // Find users who match this event's faith + region
      const users = await this.userRepository.findByFaithAndRegion(
        event.faithTradition,
        event.region
      );
      
      for (const user of users) {
        const pref = await this.calendarPrefRepository.findByUserId(user.id);
        if (!pref?.notificationEnabled) continue;
        
        const notificationTime = pref.notificationTime || '07:00:00';
        
        await this.notificationService.schedule({
          userId: user.id,
          scheduledFor: `${today}T${notificationTime}`,
          title: event.title, // Localized
          body: event.description, // Localized
          deepLink: `/wisdom-stories/${event.recommendedContentIds[0]}`,
          priority: event.priorityLevel === 1 ? 'high' : 'normal',
        });
      }
    }
  }
}
```

#### API Endpoints

**GET `/api/v1/calendar/upcoming`**

Response:
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Makha Bucha (มาฆบูชา)",
      "description": "Commemorates the Buddha's first sermon to 1,250 enlightened monks",
      "eventDate": "2026-02-25",
      "faithTradition": "buddhism",
      "region": "TH",
      "recommendedContentIds": ["story-uuid-1", "story-uuid-2"],
      "priorityLevel": 1
    }
  ]
}
```

**PATCH `/api/v1/users/me/calendar-preferences`**

Request:
```json
{
  "notificationEnabled": true,
  "notificationTime": "08:00:00"
}
```

---

### 3. Mood-to-Content Matching

#### Database Schema Changes

**Expand Existing Mood Tracking (assumed to exist):**

**Assumed Current Schema:**
```sql
CREATE TABLE mood_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  mood_type VARCHAR(50), -- 'happy', 'sad', 'anxious', 'stressed', 'calm', 'grateful', etc.
  intensity INTEGER, -- 1-5 scale
  created_at TIMESTAMP DEFAULT NOW()
);
```

**New Table: `mood_content_mapping`**

```sql
CREATE TABLE mood_content_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood_type VARCHAR(50),
  recommended_action VARCHAR(50), -- 'wisdom_story', 'ai_prompt', 'path', 'quote'
  content_id UUID, -- References wisdom_stories, paths, etc.
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mood_mapping_mood_type ON mood_content_mapping(mood_type);
```

**Example Mappings:**

| mood_type | recommended_action | content_id | priority |
|-----------|-------------------|------------|----------|
| anxious   | wisdom_story      | (story about patience) | 1 |
| anxious   | ai_prompt         | "I noticed you're feeling anxious. Want to explore what's worrying you?" | 1 |
| anxious   | path              | (path: "7 Days of Calm") | 2 |
| stressed  | wisdom_story      | (story about letting go) | 1 |
| joyful    | wisdom_story      | (story about gratitude) | 1 |
| sad       | ai_prompt         | "I'm here with you. What's weighing on your heart?" | 1 |

#### Mood Matcher Service

**File:** `src/modules/mood/domain/services/mood-content-matcher.service.ts`

```typescript
@Injectable()
export class MoodContentMatcherService {
  async getRecommendationsForMood(
    userId: string, 
    moodType: string
  ): Promise<MoodRecommendation[]> {
    const mappings = await this.moodMappingRepository.find({
      where: { moodType },
      order: { priority: 'ASC' },
      take: 3, // Top 3 recommendations
    });
    
    const recommendations = [];
    
    for (const mapping of mappings) {
      if (mapping.recommendedAction === 'wisdom_story') {
        const story = await this.wisdomStoryRepository.findById(mapping.contentId);
        recommendations.push({
          type: 'wisdom_story',
          content: story,
          reason: this.getReasonText(moodType, 'wisdom_story'),
        });
      } else if (mapping.recommendedAction === 'ai_prompt') {
        recommendations.push({
          type: 'ai_prompt',
          content: { prompt: mapping.contentId }, // contentId is the prompt text
          reason: this.getReasonText(moodType, 'ai_prompt'),
        });
      } else if (mapping.recommendedAction === 'path') {
        const path = await this.pathRepository.findById(mapping.contentId);
        recommendations.push({
          type: 'path',
          content: path,
          reason: this.getReasonText(moodType, 'path'),
        });
      }
    }
    
    return recommendations;
  }
  
  private getReasonText(moodType: string, action: string): string {
    const reasons = {
      anxious: {
        wisdom_story: 'This story offers perspective on finding calm',
        ai_prompt: 'Let's explore what's causing your anxiety',
        path: 'Start a journey toward inner peace',
      },
      stressed: {
        wisdom_story: 'Learn about releasing tension and finding balance',
        ai_prompt: 'I'm here to help you process what's overwhelming you',
        path: 'Build daily practices for stress relief',
      },
      joyful: {
        wisdom_story: 'Deepen your gratitude with this reflection',
        ai_prompt: 'Let's celebrate what's bringing you joy!',
      },
      // ... more mappings
    };
    
    return reasons[moodType]?.[action] || 'Recommended for you';
  }
}
```

#### AI Compass: Mood-Aware Context

**File:** `src/prompts/compass-context.hbs` (addition)

```handlebars
{{!-- Existing context --}}

{{!-- Mood-aware context (if user checked mood in last 24h) --}}
{{#if recentMood}}
User's current mood: {{recentMood.type}} (intensity: {{recentMood.intensity}}/5)
Logged {{recentMood.hoursAgo}} hours ago.

{{#if (eq recentMood.type 'anxious')}}
Guidance: User is feeling anxious. Offer calming support, avoid adding to worries.
Suggest breathing exercises, present-moment awareness, or exploring root causes gently.
{{else if (eq recentMood.type 'stressed')}}
Guidance: User is overwhelmed. Validate their feelings, help them prioritize, offer stress-relief practices.
{{else if (eq recentMood.type 'joyful')}}
Guidance: User is in a positive state. Encourage gratitude, deepen their joy, explore what's going well.
{{else if (eq recentMood.type 'sad')}}
Guidance: User is experiencing sadness. Be present, empathetic, non-judgmental. Don't rush to fix.
{{/if}}
{{/if}}
```

#### API Endpoints

**POST `/api/v1/mood/check`**

Request:
```json
{
  "moodType": "anxious",
  "intensity": 4
}
```

Response:
```json
{
  "success": true,
  "moodEntry": {
    "id": "uuid",
    "moodType": "anxious",
    "intensity": 4,
    "createdAt": "2026-02-07T10:30:00Z"
  },
  "recommendations": [
    {
      "type": "ai_prompt",
      "content": {
        "prompt": "I noticed you're feeling anxious. Want to explore what's worrying you?"
      },
      "reason": "Let's explore what's causing your anxiety"
    },
    {
      "type": "wisdom_story",
      "content": {
        "id": "story-uuid",
        "title": "The Monk and the Stormy Sea",
        "summary": "A story about finding calm amidst chaos"
      },
      "reason": "This story offers perspective on finding calm"
    },
    {
      "type": "path",
      "content": {
        "id": "path-uuid",
        "title": "7 Days of Calm",
        "description": "Daily practices for inner peace"
      },
      "reason": "Start a journey toward inner peace"
    }
  ]
}
```

**GET `/api/v1/mood/history?days=7`**

Response:
```json
{
  "moodEntries": [
    { "date": "2026-02-07", "moodType": "anxious", "intensity": 4 },
    { "date": "2026-02-06", "moodType": "calm", "intensity": 3 },
    { "date": "2026-02-05", "moodType": "stressed", "intensity": 5 }
  ],
  "insights": {
    "dominantMood": "anxious",
    "moodTrend": "declining", // or "improving", "stable"
    "suggestion": "You've been feeling anxious lately. Consider starting a meditation practice."
  }
}
```

---

## Integration Points

### 1. Streak Activity Tracking

**Every feature interaction must call streak service:**

**Files to Update:**
- `src/modules/compass/application/commands/send-message.handler.ts`
- `src/modules/notes/application/commands/create-note.handler.ts`
- `src/modules/paths/application/commands/create-path.handler.ts`
- `src/modules/vision-boards/application/commands/create-board.handler.ts`
- `src/modules/quotes/application/queries/get-daily-quote.handler.ts`
- `src/modules/mood/application/commands/check-mood.handler.ts`

**Pattern:**
```typescript
// At the end of successful command execution
await this.streakManagerService.recordActivity(command.userId);
```

### 2. Notifications Module Integration

**Backend must support:**
- Push notifications (FCM for Android/iOS)
- Scheduled notifications (for holy days, streak reminders)
- Deep linking (open app to specific screen)

**File:** `src/modules/notifications/domain/services/notification.service.ts`

**Methods Required:**
- `send(notification: Notification): Promise<void>`
- `schedule(notification: ScheduledNotification): Promise<void>`
- `cancel(notificationId: string): Promise<void>`

---

## Testing Strategy

### Unit Tests

1. **Streak Manager:**
   - Record activity on consecutive days → Streak increments
   - Miss a day without freeze → Streak resets
   - Miss a day with freeze → Streak preserved, freeze consumed
   - Milestone achievement → Event emitted

2. **Calendar Service:**
   - Get upcoming events → Returns events for user's faith + region
   - Recommended content retrieval → Returns wisdom stories for holy day

3. **Mood Matcher:**
   - User checks "anxious" → Returns calming recommendations
   - User checks "joyful" → Returns gratitude-related content
   - No mood check in 24h → Returns empty recommendations

### E2E Tests (Testcontainers)

1. **Streak Flow:**
   - User registers → Streak created at 0
   - User sends Compass message Day 1 → Streak = 1
   - User creates note Day 2 → Streak = 2
   - User inactive Day 3 → Streak = 2 (no change)
   - User active Day 4 → Streak resets to 1 (Day 3 missed)

2. **Holy Day Notifications:**
   - Insert calendar event for today (Makha Bucha, faith=buddhism, region=TH)
   - Run cron job
   - Assert: Thai Buddhist users receive notification

3. **Mood-to-Content:**
   - User checks mood "anxious"
   - User gets recommendations
   - User navigates to recommended wisdom story
   - Assert: Content is relevant to anxiety

### Load Testing

- Streak activity recording: 10K requests/second (peak usage)
- Calendar event queries: 5K requests/second
- Mood recommendations: 2K requests/second

**Tools:** Artillery, k6

---

## Rollout Plan

### Phase 1: Streak System (Week 1-2)

1. Database schema (tables, indexes)
2. Streak manager service implementation
3. API endpoints (`/streak`, `/streak/milestones`)
4. Integration with all feature interactions
5. Unit tests + E2E tests
6. Deploy to staging

### Phase 2: Calendar Reminders (Week 2-3)

1. Populate calendar_events table with holy days
2. Calendar service implementation
3. User preferences API
4. Cron job for daily notifications
5. Integration with notification service
6. Deploy to staging

### Phase 3: Mood-to-Content (Week 3-4)

1. Mood mapping table population
2. Mood matcher service
3. AI Compass mood-aware context
4. API endpoints (`/mood/check`, `/mood/history`)
5. Recommendation UI integration (mobile)
6. Deploy to staging

### Phase 4: Production Rollout (Week 4-6)

1. Deploy to production with feature flags (10% → 50% → 100%)
2. Monitor metrics:
   - Day 7 retention, Day 30 retention
   - Streak participation rate
   - Notification open rates
   - Mood check frequency
3. Iterate based on data

---

## Success Metrics

### Primary KPIs (30/60/90 Days)

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **Day 30 Retention** | Unknown | 8-10% | % of users returning on Day 30 |
| **Streak Participation** | 0% | 40% | % of users with active streak (3+ days) |
| **Holy Day Engagement** | Unknown | +15% | Engagement lift on holy days vs baseline |
| **Mood Check Adoption** | 0% | 30% | % of users checking mood weekly |
| **Recommendation CTR** | 0% | 20% | % of mood-based recommendations clicked |

### Secondary Metrics

- **Longest Streak Average:** Target 12 days (indicates habit formation)
- **Notification Open Rate:** Target 25% (holy day), 18% (streak reminders)
- **Mood-to-Content Conversion:** Target 15% (users who see recommendation → engage with content)

### Warning Signs (Adjust if Seen)

- Streak participation <20% → Streaks not visible/compelling enough in mobile UI
- Notification open rate <10% → Notification fatigue, reduce frequency
- Mood check adoption <15% → Feature not discoverable, improve onboarding

---

## Risk Assessment

### Risk: Notification Fatigue

**Likelihood:** Medium  
**Impact:** High (users disable notifications, retention drops)

**Mitigation:**
- Limit to 1 notification per day max
- Allow users to customize notification preferences
- A/B test notification frequency (daily vs 3x/week vs weekly)

### Risk: Streak Anxiety (Negative Psychology)

**Likelihood:** Low-Medium  
**Impact:** Medium (users feel pressured, stressed by streaks)

**Mitigation:**
- Friendly tone: "Your 5-day streak is amazing! Take a moment today."
- Offer streak freezes (premium feature) to reduce pressure
- Don't shame users for broken streaks (avoid "You broke your streak!" language)

### Risk: Calendar Data Maintenance Burden

**Likelihood:** Medium  
**Impact:** Medium (outdated holy day data = bad UX)

**Mitigation:**
- Automate calendar updates via API (Islamic calendar APIs exist)
- Annual audit of holy days (before each calendar year)
- Community-submitted calendar events (with moderation)

### Risk: Mood Recommendations Not Relevant

**Likelihood:** Medium  
**Impact:** High (users lose trust in AI)

**Mitigation:**
- A/B test mood mapping (different stories for same mood)
- Collect feedback: "Was this helpful?" (thumbs up/down)
- Iterate mappings monthly based on user feedback

---

## Future Iterations

### Phase 2 Enhancements (Months 6-12)

1. **Social Streaks:**
   - Show friends' streaks (if they opt-in)
   - Friendly competition: "You're 2 days ahead of your friend!"

2. **Dynamic Mood Insights:**
   - Weekly mood reports: "You were calm 5 days this week, stressed 2 days"
   - Mood pattern detection: "You tend to feel anxious on Mondays. Let's prepare ahead."

3. **Seasonal Content Campaigns:**
   - Ramadan: Daily Ramadan-specific content for 30 days
   - Buddhist Lent (Khao Phansa): 3-month content series

4. **Predictive Retention:**
   - ML model: Predict churn risk based on streak, mood, engagement
   - Proactive intervention: "We notice you haven't checked in this week. Everything okay?"

---

## Conclusion

Retention infrastructure is the backbone of Evolusea's success. By implementing Daily Streaks (gamification), Religious Calendar Reminders (cultural relevance), and Mood-to-Content Matching (personalization), we target 8-10% Day 30 retention—doubling the industry average and unlocking sustainable unit economics.

**Core Principle:** Retention = Habit + Value. Streaks drive habit, calendar/mood drive value.
