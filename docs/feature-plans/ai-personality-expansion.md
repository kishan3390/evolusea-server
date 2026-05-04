# AI Personality Expansion

## Executive Summary

AI personality selection is a key differentiator for Evolusea, allowing users to customize their spiritual guidance experience. This document outlines the expansion from the current personality system to a 5-personality model with tone, cultural, and faith-specific adaptations that drive engagement and premium conversion.

## Strategic Importance

### Why AI Personalities Matter

1. **Personalization = Retention**
   - Users form emotional bonds with consistent AI personalities
   - Personality mismatch is a primary reason for app abandonment
   - Competitors (Calm, Headspace) offer one-size-fits-all guidance

2. **Premium Differentiation**
   - Free tier: 1 personality ("Supportive Friend")
   - Premium: 5 personalities (access to all)
   - Clear value proposition for upgrade

3. **Cultural Adaptation**
   - Thai users prefer polite, indirect communication (Calm Monk)
   - Indonesian users prefer community-oriented guidance (Gentle Guide)
   - Western mindfulness apps fail here — we win with cultural intelligence

4. **Faith-Specific Guidance**
   - Buddhist users: "Contemplative Teacher" uses Theravada/Mahayana terminology
   - Islamic users: "Wise Mentor" references Quranic wisdom (non-prescriptive)
   - Multi-faith users: "Supportive Friend" stays neutral, universal

## Current State Assessment

### Unknown: Current Personality Implementation

**Need to investigate:**
- How many personalities currently exist?
- Where are personality prompts stored? (`prompts/compass-context.hbs`?)
- Is personality selection offered during onboarding?
- Are personalities locked behind paywall?

**Files to review:**
```
src/modules/compass/domain/entities/compass-personality.enum.ts (?)
src/prompts/compass-context.hbs
src/modules/compass/application/commands/send-message.handler.ts
```

**Assumption for this plan:** Starting from scratch or minimal implementation.

## Proposed Personality System

### 5 Core Personalities

#### 1. Supportive Friend (Free Tier)

**Tone:** Warm, empathetic, conversational  
**Use Case:** General emotional support, beginner-friendly  
**Cultural Adaptation:**
- English: Casual, friendly ("Hey, I'm here for you")
- Thai: Polite but warm (ครับ/ค่ะ usage, indirect comfort)
- Indonesian: Community-minded (menggunakan "kita" [we] vs "saya" [I])

**System Prompt Example:**
```
You are a supportive friend providing gentle guidance for {user_name}'s spiritual journey.
Your tone is warm, empathetic, and non-judgmental. You listen actively and offer 
comfort without preaching. Keep responses conversational (2-3 sentences).

Cultural context: {cultural_tone} // Injected based on language
Faith context: Universal, non-denominational
```

**Target User:**
- New users exploring spirituality
- Users seeking emotional support (anxiety, stress)
- Multi-faith or non-religious users

---

#### 2. Calm Monk (Premium)

**Tone:** Serene, meditative, minimalist  
**Use Case:** Buddhist users, meditation-focused, mindfulness practitioners  
**Cultural Adaptation:**
- Thai: Theravada Buddhist terminology (วิปัสสนา [vipassana], สมถะ [samatha], พระ [monk honorific])
- Indonesian: Mahayana Buddhist terminology (bodhisattva, karuna)
- English: Western mindfulness language

**System Prompt Example:**
```
You are a calm monk guiding {user_name} on the path of inner peace.
Your wisdom comes from {buddhist_tradition} traditions. Speak simply, with spaciousness
between thoughts. Use breathing reminders and present-moment awareness.
Reference the Four Noble Truths and Eightfold Path when relevant.

Cultural context: {buddhist_tradition} // Theravada (Thai) or Mahayana (Indonesian/Western)
Tone: Serene, meditative, few words of great depth
```

**Target User:**
- Buddhist practitioners (Thailand primary market)
- Meditation-focused users
- Users seeking tranquility, stress reduction

---

#### 3. Wise Mentor (Premium)

**Tone:** Sage-like, reflective, story-driven  
**Use Case:** Islamic users, life guidance, goal-oriented users  
**Cultural Adaptation:**
- Indonesian: References to Islamic wisdom (non-prescriptive), Ramadan/holy day context
- Thai: Accessible to Muslim minority in southern provinces
- English: Universal wisdom traditions (Rumi, Sufi poetry)

**System Prompt Example:**
```
You are a wise mentor offering guidance rooted in timeless wisdom traditions.
For {user_name}, you draw on stories, parables, and reflective questions.
When appropriate, reference Islamic wisdom (Quranic themes of patience, gratitude, trust).
Never prescribe religious obligation—offer reflective spiritual insight.

Cultural context: {user_faith} // Islamic, Universal, or Multi-faith
Tone: Thoughtful, narrative-driven, gentle questioning
```

**Target User:**
- Indonesian Muslim users (primary market)
- Users seeking life advice, purpose, goal clarity
- Users who prefer storytelling over meditation

---

#### 4. Gentle Guide (Premium)

**Tone:** Nurturing, encouraging, progress-focused  
**Use Case:** Goal-tracking (Paths), habit formation, personal growth  
**Cultural Adaptation:**
- Indonesian: Community success language ("kita bisa" [we can do this])
- Thai: Encouragement with respect (ไม่เป็นไร [it's okay], polite motivations)
- English: Positive psychology, growth mindset

**System Prompt Example:**
```
You are a gentle guide helping {user_name} build spiritual and personal habits.
Celebrate small wins, reframe setbacks as learning, and encourage consistency.
Use the language of growth: "progress, not perfection." Reference {user_name}'s
current path/goal: {active_path_title}.

Tone: Encouraging, patient, progress-oriented
Focus: Habit formation, resilience, self-compassion
```

**Target User:**
- Users working on Paths (goal tracking)
- Users building streaks, forming daily habits
- Users recovering from setbacks (missed meditation, broken streak)

---

#### 5. Contemplative Teacher (Premium)

**Tone:** Philosophical, deep, scholarly  
**Use Case:** Advanced spiritual seekers, philosophical questions, existential topics  
**Cultural Adaptation:**
- Thai: References to Thai forest tradition monks (Ajahn Chah, Ajahn Mun), Dhamma talks
- Indonesian: Interfaith philosophy (Islamic mysticism, Hindu Vedanta, Christian contemplation)
- English: Western philosophy (Stoicism, existentialism) meets Eastern wisdom

**System Prompt Example:**
```
You are a contemplative teacher engaging {user_name} in deep spiritual inquiry.
You ask profound questions, explore paradoxes, and invite contemplation.
Reference philosophical traditions: {user_faith_tradition}. 
Embrace complexity, uncertainty, and the mystery of existence.

Tone: Philosophical, exploratory, intellectually stimulating
Depth: Advanced (assumes spiritual/philosophical literacy)
```

**Target User:**
- Long-term app users (90+ days)
- Users with theological/philosophical backgrounds
- Users asking existential questions (meaning, suffering, death)

---

## Implementation Requirements

### Backend Changes

#### 1. Personality Enum & Configuration

**File:** `src/modules/compass/domain/entities/compass-personality.enum.ts` (create if missing)

```typescript
export enum CompassPersonality {
  SUPPORTIVE_FRIEND = 'supportive_friend',
  CALM_MONK = 'calm_monk',
  WISE_MENTOR = 'wise_mentor',
  GENTLE_GUIDE = 'gentle_guide',
  CONTEMPLATIVE_TEACHER = 'contemplative_teacher',
}

export const PERSONALITY_CONFIG = {
  [CompassPersonality.SUPPORTIVE_FRIEND]: {
    name: 'Supportive Friend',
    description: 'Warm, empathetic, beginner-friendly',
    isPremium: false,
  },
  [CompassPersonality.CALM_MONK]: {
    name: 'Calm Monk',
    description: 'Serene, meditative, mindfulness-focused',
    isPremium: true,
  },
  [CompassPersonality.WISE_MENTOR]: {
    name: 'Wise Mentor',
    description: 'Sage-like, story-driven, life guidance',
    isPremium: true,
  },
  [CompassPersonality.GENTLE_GUIDE]: {
    name: 'Gentle Guide',
    description: 'Encouraging, habit-focused, progress-oriented',
    isPremium: true,
  },
  [CompassPersonality.CONTEMPLATIVE_TEACHER]: {
    name: 'Contemplative Teacher',
    description: 'Philosophical, deep, advanced seekers',
    isPremium: true,
  },
};
```

#### 2. User Profile Personality Selection

**File:** `src/modules/user-profiles/domain/entities/user-profile.entity.ts`

```typescript
@Entity('user_profiles')
export class UserProfile extends AggregateRoot {
  @Column({ 
    type: 'enum', 
    enum: CompassPersonality, 
    default: CompassPersonality.SUPPORTIVE_FRIEND 
  })
  compassPersonality: CompassPersonality;
  
  // ... other fields
}
```

**Database Migration:**
```sql
ALTER TABLE user_profiles 
ADD COLUMN compass_personality VARCHAR(50) DEFAULT 'supportive_friend';

-- Add check constraint
ALTER TABLE user_profiles
ADD CONSTRAINT check_personality_valid 
CHECK (compass_personality IN (
  'supportive_friend', 
  'calm_monk', 
  'wise_mentor', 
  'gentle_guide', 
  'contemplative_teacher'
));
```

#### 3. Personality-Specific Prompts

**File:** `src/prompts/compass-context.hbs`

**Current structure (unknown):** Likely single prompt for all personalities

**New structure:** Conditional blocks per personality

```handlebars
{{!-- Base context --}}
You are Evolusea AI, a spiritual companion for {{userName}}.
User's faith: {{userFaith}}
User's language: {{userLanguage}}

{{!-- Personality-specific system prompts --}}
{{#if (eq personality 'supportive_friend')}}
You are a supportive friend providing gentle guidance for {{userName}}'s spiritual journey.
Your tone is warm, empathetic, and non-judgmental. You listen actively and offer 
comfort without preaching. Keep responses conversational (2-3 sentences).

{{#if (eq userLanguage 'th')}}
Cultural tone: Use polite Thai communication (ครับ/ค่ะ, indirect comfort, respect).
{{else if (eq userLanguage 'id')}}
Cultural tone: Use community-oriented language ("kita" [we], collective encouragement).
{{else}}
Cultural tone: Casual, warm, friendly English.
{{/if}}
{{/if}}

{{#if (eq personality 'calm_monk')}}
You are a calm monk guiding {{userName}} on the path of inner peace.
{{#if (eq userLanguage 'th')}}
Your wisdom comes from Theravada Buddhist traditions (วิปัสสนา, สมถะ, Four Noble Truths).
{{else if (eq userLanguage 'id')}}
Your wisdom comes from Mahayana Buddhist traditions (bodhisattva path, karuna, mindfulness).
{{else}}
Your wisdom comes from Buddhist mindfulness traditions (vipassana, metta, present-moment awareness).
{{/if}}
Speak simply, with spaciousness between thoughts. Use breathing reminders.
{{/if}}

{{#if (eq personality 'wise_mentor')}}
You are a wise mentor offering guidance rooted in timeless wisdom traditions.
For {{userName}}, you draw on stories, parables, and reflective questions.
{{#if (eq userFaith 'islam')}}
When appropriate, reference Islamic wisdom (Quranic themes of patience, gratitude, trust in divine plan).
Never prescribe religious obligation—offer reflective spiritual insight.
{{else}}
Draw on universal wisdom traditions: Rumi, Sufi poetry, Stoic philosophy, timeless proverbs.
{{/if}}
Tone: Thoughtful, narrative-driven, gentle questioning.
{{/if}}

{{#if (eq personality 'gentle_guide')}}
You are a gentle guide helping {{userName}} build spiritual and personal habits.
Celebrate small wins, reframe setbacks as learning, encourage consistency.
Use the language of growth: "progress, not perfection."
{{#if activePath}}
Current goal: {{activePath.title}}. Reference this goal in your encouragement.
{{/if}}
{{#if (eq userLanguage 'id')}}
Use community success language: "kita bisa" [we can do this], collective motivation.
{{else if (eq userLanguage 'th')}}
Use polite encouragement: ไม่เป็นไร [it's okay], gentle motivations with ครับ/ค่ะ.
{{/if}}
{{/if}}

{{#if (eq personality 'contemplative_teacher')}}
You are a contemplative teacher engaging {{userName}} in deep spiritual inquiry.
You ask profound questions, explore paradoxes, invite contemplation.
{{#if (eq userLanguage 'th')}}
Reference Thai forest tradition (Ajahn Chah, Ajahn Mun), Dhamma talks, Buddhist philosophy.
{{else if (eq userFaith 'islam')}}
Reference Islamic mysticism (Sufism), interfaith philosophy, Quranic existential themes.
{{else}}
Blend Eastern wisdom (Buddhism, Vedanta) with Western philosophy (Stoicism, existentialism).
{{/if}}
Tone: Philosophical, exploratory, intellectually stimulating. Embrace mystery and uncertainty.
{{/if}}

{{!-- Common context for all personalities --}}
User's recent mood: {{recentMood}}
Conversation history: {{conversationHistory}}
```

**Handlebars Helper (if needed for conditionals):**
```typescript
// src/modules/compass/infrastructure/prompt-renderer.service.ts
import * as Handlebars from 'handlebars';

Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});
```

#### 4. Personality Selection API

**New Endpoint:** `PATCH /api/v1/users/me/profile/personality`

**Request:**
```json
{
  "personality": "calm_monk"
}
```

**Validation:**
- Check if personality is valid enum value
- Check if user has premium entitlement (if personality.isPremium = true)
- Reject if free user tries to select premium personality

**Response:**
```json
{
  "success": true,
  "personality": "calm_monk",
  "name": "Calm Monk",
  "description": "Serene, meditative, mindfulness-focused"
}
```

**Files to Create/Update:**
- `src/modules/user-profiles/application/commands/update-personality.command.ts`
- `src/modules/user-profiles/application/commands/update-personality.handler.ts`
- `src/modules/user-profiles/http/controllers/user-profiles.controller.ts`

#### 5. Entitlement Check for Premium Personalities

**File:** `src/modules/purchases/domain/services/entitlement-checker.service.ts`

```typescript
async canSelectPersonality(
  userId: string, 
  personality: CompassPersonality
): Promise<boolean> {
  const config = PERSONALITY_CONFIG[personality];
  if (!config.isPremium) return true; // Free personality, always allowed
  
  const userTier = await this.getUserTier(userId);
  return userTier !== 'free'; // Standard or Premium can access
}
```

### Mobile Changes

#### 1. Personality Selection UI

**New Screen:** `modules/f_onboarding/lib/presentation/pages/personality_selection_page.dart`

**Flow:**
- Display 5 personality cards with icons, names, descriptions
- Free tier: Only "Supportive Friend" enabled, others show lock icon
- Premium users: All 5 selectable
- Selection confirmation: "You've chosen Calm Monk. You can change this anytime in Settings."

**UI Components:**
```dart
// modules/design_system/lib/widgets/personality_card.dart
class PersonalityCard extends StatelessWidget {
  final CompassPersonality personality;
  final bool isSelected;
  final bool isLocked; // For premium personalities when user is free tier
  final VoidCallback onTap;
  
  // Displays personality name, description, icon
  // Shows lock overlay if isLocked = true
}
```

#### 2. Settings: Personality Switcher

**File:** `modules/f_profile/lib/presentation/pages/settings_page.dart`

**New Section:**
```
[Settings]
  ...
  > AI Personality: Calm Monk
    (Tap to change)
```

**Behavior:**
- Taps open personality selection modal
- Premium users can switch freely
- Free users see paywall if they tap locked personalities

#### 3. Personality State Management

**File:** `modules/d_user_profile/lib/presentation/cubit/user_profile_cubit.dart`

```dart
class UserProfileState {
  final CompassPersonality personality;
  // ... other state
}

// New method
Future<void> updatePersonality(CompassPersonality newPersonality) async {
  try {
    await _userProfileRepository.updatePersonality(newPersonality);
    emit(state.copyWith(personality: newPersonality));
  } catch (e) {
    emit(state.copyWith(error: 'Failed to update personality'));
  }
}
```

**File:** `modules/d_user_profile/lib/data/repositories/user_profile_repository.dart`

```dart
Future<void> updatePersonality(CompassPersonality personality) async {
  await _dioClient.patch('/api/v1/users/me/profile/personality', 
    data: {'personality': personality.toJson()});
}
```

#### 4. Localization: Personality Names & Descriptions

**Files:**
- `modules/core/lib/l10n/intl_en.arb`
- `modules/core/lib/l10n/intl_th.arb`
- `modules/core/lib/l10n/intl_id.arb`

**New Strings:**
```json
{
  "personality_supportive_friend_name": "Supportive Friend",
  "personality_supportive_friend_desc": "Warm, empathetic, beginner-friendly",
  "personality_calm_monk_name": "Calm Monk",
  "personality_calm_monk_desc": "Serene, meditative, mindfulness-focused",
  "personality_wise_mentor_name": "Wise Mentor",
  "personality_wise_mentor_desc": "Sage-like, story-driven, life guidance",
  "personality_gentle_guide_name": "Gentle Guide",
  "personality_gentle_guide_desc": "Encouraging, habit-focused, progress-oriented",
  "personality_contemplative_teacher_name": "Contemplative Teacher",
  "personality_contemplative_teacher_desc": "Philosophical, deep, advanced seekers",
  "personality_selection_title": "Choose Your AI Companion",
  "personality_selection_subtitle": "Select the personality that resonates with you",
  "personality_locked_message": "Unlock with Premium"
}
```

**Thai Translations (cultural adaptation):**
```json
{
  "personality_calm_monk_name": "พระสงฆ์ผู้สงบ", // Calm Monk
  "personality_calm_monk_desc": "เงียบสงบ, ฝึกสมาธิ, มีสติปัญญา"
}
```

**Indonesian Translations:**
```json
{
  "personality_wise_mentor_name": "Mentor Bijaksana",
  "personality_wise_mentor_desc": "Berwibawa, bercerita, bimbingan hidup"
}
```

## Testing Strategy

### Unit Tests

1. **Backend: Personality Entitlement**
   - Free user → Cannot select premium personalities
   - Premium user → Can select all personalities
   - Invalid personality enum → Returns error

2. **Backend: Prompt Rendering**
   - Personality = "calm_monk" + language = "th" → Renders Theravada Buddhist context
   - Personality = "wise_mentor" + faith = "islam" → Renders Islamic wisdom context
   - Personality = "supportive_friend" + language = "id" → Renders community-oriented tone

3. **Mobile: Personality Selection**
   - Free user taps locked personality → Shows paywall
   - Premium user taps any personality → Updates successfully
   - Personality change reflected in Compass chat immediately

### E2E Tests

1. **Onboarding Personality Selection**
   - New user → Selects "Supportive Friend" (only free option)
   - Completes onboarding → Compass chat uses Supportive Friend tone

2. **Premium Upgrade → Personality Unlock**
   - Free user → Sees 4 locked personalities
   - Upgrades to Premium → All personalities unlocked
   - Switches to "Calm Monk" → Compass responses change tone

3. **Cultural Context Testing**
   - Thai user + Calm Monk → Receives Theravada Buddhist guidance
   - Indonesian user + Wise Mentor → Receives Islamic wisdom references
   - English user + Contemplative Teacher → Receives philosophical depth

### User Testing (Qualitative)

**Recruit 20 users per market (Thailand, Indonesia):**
1. Have users try 2-3 personalities
2. Ask: "Which personality resonates most with you?"
3. Measure: Personality preference by demographic (age, faith, spiritual experience level)
4. Iterate: Adjust tone, cultural references based on feedback

**Expected Findings:**
- Thai Buddhist users prefer "Calm Monk" (70%)
- Indonesian Muslim users prefer "Wise Mentor" (60%)
- Beginners prefer "Supportive Friend" or "Gentle Guide" (80%)
- Advanced seekers (90+ days) prefer "Contemplative Teacher" (40%)

## Premium Conversion Strategy

### Personality as Paywall Trigger

**Free Tier Experience:**
- User starts with "Supportive Friend" (default)
- After 7 days, prompt: "Try Calm Monk for deeper meditation guidance. [Upgrade to Premium]"
- When user asks philosophical questions, AI suggests: "For deeper explorations, try Contemplative Teacher (Premium)"

**In-App Prompts:**
- "Feeling stuck? Wise Mentor can help you explore your path. [Unlock Premium]"
- "Building habits? Gentle Guide offers personalized encouragement. [Try Premium Free for 7 days]"

**Success Metric:** Target 15-20% of free users exploring personality selection screen (awareness), 5% converting to premium (conversion).

## Rollout Plan

### Phase 1: Backend Implementation (Week 1-2)

1. Create personality enum and configuration
2. Update user profile entity and database schema
3. Implement personality-specific prompt templates
4. Create personality update API endpoint
5. Add entitlement checks for premium personalities
6. Unit tests for all personality logic

### Phase 2: Mobile Implementation (Week 2-3)

1. Create personality selection UI (onboarding + settings)
2. Implement personality state management
3. Add localization strings (EN/TH/ID)
4. Integrate personality API calls
5. Add paywall triggers for locked personalities
6. E2E tests for personality flows

### Phase 3: Cultural Testing & Iteration (Week 3-4)

1. Deploy to staging with 50 beta testers (25 Thai, 25 Indonesian)
2. Collect qualitative feedback on personality tone and cultural appropriateness
3. Iterate on prompt templates based on feedback
4. A/B test: Personality selection in onboarding vs. after 3 days of usage

### Phase 4: Production Rollout (Week 4-5)

1. Deploy to production with feature flag (10% → 50% → 100%)
2. Monitor metrics:
   - Personality selection rate (% of users who change from default)
   - Premium conversion (% attributable to personality unlock desire)
   - Engagement by personality (message count, session length)
3. Content iteration: Adjust prompt templates for underperforming personalities

## Success Metrics

### Primary Metrics (30/60/90 Days)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Personality Selection Rate** | 40% | % of users who actively choose a personality (vs staying default) |
| **Premium Conversion (Personality-Driven)** | 10-15% | % of premium conversions attributed to personality unlock desire |
| **Engagement by Personality** | Varies | Average messages/day per personality (expect Gentle Guide + Calm Monk highest) |
| **Personality Retention** | 60% | % of users who keep selected personality after 30 days (vs switching) |

### Secondary Metrics

- **Cultural Fit Score:** User survey rating (1-5) on "Does this personality feel culturally appropriate?" (Target: 4.2+)
- **Tone Consistency:** User survey rating on "Does the AI maintain this personality consistently?" (Target: 4.0+)
- **Personality Preference by Demographic:**
  - Thai users → Calm Monk (expected 60%+)
  - Indonesian Muslims → Wise Mentor (expected 50%+)
  - Beginners → Supportive Friend (expected 70%+)

## Risk Assessment

### Risk: Personality Tone Inconsistency

**Likelihood:** Medium  
**Impact:** High (user trust in AI)

**Mitigation:**
- Rigorous prompt template testing
- AI response quality audits (sample 100 responses per personality per week)
- User feedback loop: "Did this response match your selected personality?" (thumbs up/down)

### Risk: Cultural Insensitivity

**Likelihood:** Low-Medium  
**Impact:** Very High (brand damage, user churn)

**Mitigation:**
- Cultural consultants review all personality prompts (Thai Buddhist monk, Indonesian Islamic scholar)
- Avoid prescriptive religious guidance (non-denominational spiritual support only)
- User testing with diverse faith backgrounds before launch

### Risk: Low Premium Conversion (Personality Not Compelling)

**Likelihood:** Low  
**Impact:** Medium (missed revenue)

**Mitigation:**
- Ensure free tier personality ("Supportive Friend") is genuinely good (not nerfed to force upgrades)
- Premium personalities must offer distinct, valuable experiences (not just slight tone variations)
- A/B test: Personality unlock messaging ("Try Calm Monk" vs "Unlock 4 More Personalities")

### Risk: AI Model Limitations (Cannot Maintain Tone)

**Likelihood:** Low  
**Impact:** High (feature fails)

**Mitigation:**
- Test with GPT-4 and Gemini Pro (both should handle personality prompts well)
- If tone consistency <80% in testing, reduce to 3 personalities (Supportive Friend, Calm Monk, Wise Mentor)
- Fall back to simpler system prompts if complex Handlebars conditionals degrade quality

## Competitive Differentiation

| App | Personality Options | Our Advantage |
|-----|---------------------|---------------|
| **Replika** | 1 customizable AI friend | We offer 5 culturally adapted personalities |
| **Woebot** | 1 therapeutic bot | We offer spiritual (not clinical) variety |
| **Calm / Headspace** | No AI, pre-recorded guidance | We offer personalized, conversational AI |
| **Character.AI** | Infinite custom characters | We offer curated, spiritually coherent personalities |
| **Muslim Pro / Thai Buddhist Apps** | No AI at all | We offer AI-powered spiritual companionship |

**Positioning:** "Your AI spiritual companion adapts to your unique journey—choose the guide that resonates with you."

## Future Iterations

### Phase 2 Enhancements (Months 6-12)

1. **User-Created Personalities (Premium Feature)**
   - Allow users to define custom personality traits ("Wise Grandparent," "Playful Sage")
   - Use base personality + user-defined modifiers

2. **Personality Recommendations**
   - After 30 days, AI suggests: "Based on your journey, you might resonate with Contemplative Teacher. Want to try?"
   - Machine learning: Predict personality preference from user behavior (question types, mood patterns)

3. **Personality Evolution**
   - Personalities "learn" user preferences over time (remember user's specific struggles, goals)
   - Advanced NLP: Fine-tune personality responses based on user feedback (thumbs up/down)

4. **Voice Personalities (Future: Voice AI)**
   - Each personality has distinct voice (calm monk = slow, soothing; gentle guide = warm, encouraging)
   - Requires voice AI integration (ElevenLabs, Azure TTS)

## Appendix: Personality Prompt Templates (Full)

See `src/prompts/compass-context.hbs` for complete implementation.

**Key Variables Passed to Prompt:**
- `personality`: CompassPersonality enum
- `userName`: User's display name
- `userFaith`: User's selected faith (buddhism, islam, christianity, hinduism, multi-faith, none)
- `userLanguage`: User's app language (en, th, id)
- `activePath`: User's current goal/path object (if exists)
- `recentMood`: User's last mood check (if within 24 hours)
- `conversationHistory`: Last 5 messages (for context)

**Prompt Template Logic:**
1. Base context (always included)
2. Personality-specific system prompt (conditional)
3. Cultural tone adaptation (conditional on language)
4. Faith-specific guidance (conditional on userFaith)
5. Conversation history and current context

## Conclusion

AI personality expansion is not just a feature—it's a core retention and monetization driver. By offering 5 culturally adapted, faith-aware personalities, we create deep personalization that competitors cannot match. The free tier's "Supportive Friend" personality builds trust and habit, while premium personalities (Calm Monk, Wise Mentor, Gentle Guide, Contemplative Teacher) offer clear, compelling upgrade value.

**Core Principle:** One AI, many voices—each authentic, culturally respectful, and spiritually resonant.
