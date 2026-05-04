# Domain Modules

All domain modules live under `src/domain/` and follow a consistent DDD structure. Each module is a bounded context with its own entities, commands, queries, and infrastructure.

For the general module structure and how to add new modules, see the [Development Guide](development-guide.md#domain-module-structure).

---

## Account

**Location:** `src/domain/account/`

Manages user accounts linked to Firebase Authentication and subscription entitlements via RevenueCat.

### Commands

| Command | Description |
|---------|-------------|
| `SynchronizeAccount` | Syncs account data with Firebase (creates if new) |
| `DeleteAccount` | Deletes the account and all associated data (cascade) |
| `UpsertAccountEntitlement` | Creates or updates a subscription entitlement |
| `ReplaceEntitlements` | Replaces all entitlements for an account |

### Queries

| Query | Description |
|-------|-------------|
| `GetAccountById` | Retrieves an account by ID |
| `GetIsPremiumAccount` | Checks if the account has an active `premium_access` entitlement |
| `ListAccounts` | Lists all accounts (used by scheduled tasks) |

### Key Concepts

- An account is created when a user first calls `/accounts/me/sync` after Firebase authentication
- Entitlements are synced from RevenueCat and determine premium access
- Deleting an account cascades to user profile and all user data

---

## User Profile

**Location:** `src/domain/user-profile/`

Stores user preferences including belief system, language, and country.

### Commands

| Command | Description |
|---------|-------------|
| `CreateUserProfile` | Creates a new profile for an account |
| `UpdateUserProfile` | Updates profile fields |
| `DeleteUserProfile` | Deletes the profile and all associated data |

### Queries

| Query | Description |
|-------|-------------|
| `GetUserProfile` | Retrieves the current user's profile |

### Key Concepts

- One profile per account (one-to-one relationship)
- The `belief` field determines which AI archetype and calendar events the user sees
- The `language` field controls content localization (`en`, `th`, `id`)
- Profile deletion cascades to all user content (notes, paths, chats, etc.)

---

## Compass

**Location:** `src/domain/compass/`

The AI-powered conversational guide -- the core feature of the platform. See [AI Integration](ai-integration.md) for the full chat flow.

### Commands

| Command | Description |
|---------|-------------|
| `StartCompassChatForOpenQuestion` | Start a chat with an open question |
| `StartCompassChatForPersonalNote` | Start a chat about a specific note |
| `StartCompassChatForPathItem` | Start a chat about a path/goal |
| `StartCompassChatForCalendarEvent` | Start a chat about a calendar event |
| `StartCompassChatForQuote` | Start a chat about the daily quote |
| `SendCompassChatMessage` | Send a user message and trigger AI response |
| `CloseCompassChat` | Manually close a chat |
| `GenerateAiCompassChatContextMessage` | Generate the system context prompt |
| `GenerateAiCompassChatWelcomeMessage` | Generate the welcome instruction |
| `GenerateAiCompassChatMessage` | Generate the AI response |
| `CreateCompassConfig` | Create compass configuration for a user |
| `UpdateCompassConfig` | Update compass configuration |

### Queries

| Query | Description |
|-------|-------------|
| `GetCompassChat` | Get a chat with its public messages |
| `GetCompassChatStartOptions` | Check which chat topics are available |
| `GetCompassChatsQuota` | Get daily chat creation quota |
| `GetCompassConfig` | Get the user's compass configuration |
| `ListCompassChats` | List all user's chats |
| `ListCompassChatMessages` | List messages for a specific chat |
| `ListCompassChatsSummaries` | List all chat summaries (for context) |

### Domain Events

| Event | Handler | Description |
|-------|---------|-------------|
| `CompassChatClosedEvent` | `CompassChatClosedEventHandler` | Generates AI summary when chat is closed |

### Key Concepts

- Turn-based conversation with soft/hard limits
- Messages have `public`/`internal` visibility
- Context includes recent chat summaries, notes, and paths
- AI can call `close_compass_chat` tool to end the conversation
- Requires `CompassConfig` (goal and personality) before starting

---

## Note

**Location:** `src/domain/note/`

Personal journaling with mood tracking and AI-generated summaries.

### Commands

| Command | Description |
|---------|-------------|
| `CreateNote` | Create a new note |
| `UpdateNote` | Update a note's content |
| `DeleteNote` | Delete a note |
| `SummarizeNote` | Generate an AI summary for a note |

### Queries

| Query | Description |
|-------|-------------|
| `GetNote` | Get a specific note |
| `GetNotesQuota` | Get daily note creation quota |
| `GetLatestUserNote` | Get the most recent note (for compass context) |
| `GetNoteSummary` | Get a note's AI summary |
| `GetNotesByIds` | Get multiple notes by IDs (for vision boards) |
| `ListNotes` | List all user's notes |
| `ListNotesSummaries` | List all note summaries (for compass context) |

### Domain Events

| Event | Handler | Description |
|-------|---------|-------------|
| `NoteCreatedEvent` | `NoteCreatedEventHandler` | Triggers AI summarization after creation |
| `NoteUpdatedEvent` | `NoteUpdatedEventHandler` | Triggers AI re-summarization after update |

### Key Concepts

- Notes are automatically summarized by AI when created or updated
- Summaries are stored separately and used as context for Compass chats
- Daily quota: 3 notes per day for free users (Bangkok timezone)
- Anonymous sharing can be enabled per note

---

## Path

**Location:** `src/domain/path/`

Goal-setting and tracking with target dates and status management.

### Commands

| Command | Description |
|---------|-------------|
| `CreatePath` | Create a new path with a target date |
| `UpdatePath` | Update path details |
| `DeletePath` | Delete a path |
| `CompletePath` | Mark a path as completed |
| `RestorePath` | Restore a completed/overdue path to awaiting |
| `SendPathNotification` | Send a push notification for a path |

### Queries

| Query | Description |
|-------|-------------|
| `GetPath` | Get a specific path |
| `GetPathsQuota` | Get daily path creation quota |
| `GetPathsByIds` | Get multiple paths by IDs (for vision boards) |
| `ListPaths` | List all user's paths |

### Scheduled Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| `TriggerPathNotificationsTask` | `0 2 * * *` (2:00 AM UTC = 9:00 AM Bangkok) | Sends push notifications for paths scheduled yesterday that are not yet completed |
| `MarkPastPathsAsOverdueTask` | `0 17 * * *` (5:00 PM UTC = midnight Bangkok) | Marks awaiting paths with past dates as overdue |

### Key Concepts

- Paths have three statuses: `awaiting` -> `overdue` or `completed`
- Overdue marking happens automatically at midnight Bangkok time
- Notifications are sent the morning after the target date
- Daily quota: 3 paths per day for free users (Bangkok timezone)

---

## Quote

**Location:** `src/domain/quote/`

Pre-curated inspirational quotes drawn from a seeded pool (`quote_pool` table). Daily quotes are selected based on the user's belief system, language, and current mood (inferred from their latest note).

### Commands

No commands -- quotes are pre-curated, not AI-generated.

### Queries

| Query | Description |
|-------|-------------|
| `GetDailyQuotes` | Get today's daily quotes (1 for free users, 3 for premium). Selects from the pool by mood, belief system, and language; caches results in `user_daily_quotes`. |
| `ListQuotePool` | Browse the full quote pool (premium only). Supports filtering by mood and belief system with pagination. |
| `GetQuoteById` | Get a specific quote by ID |
| `GetQuotesQuota` | Get quote quota information (daily limit and browse access) |

### Key Concepts

- Quotes are **pre-seeded** in the `quote_pool` table -- no AI generation at runtime
- Daily quotes are selected using the mood from the user's latest note (falls back to a random mood)
- Once selected, daily quotes are cached in `user_daily_quotes` keyed by `(user_profile_id, date, order_index)`
- Free users receive 1 daily quote; premium users receive 3 and can browse the full pool
- Race condition protection: concurrent daily quote requests are handled via duplicate-key error recovery
- Quote pool entries have `content`, `attribution`, `source`, `mood`, `beliefSystem`, and `language` fields

---

## Vision Board

**Location:** `src/domain/vision-board/`

Curated collections that bring together paths, notes, and wisdom stories.

### Commands

| Command | Description |
|---------|-------------|
| `CreateVisionBoard` | Create a new vision board |
| `UpdateVisionBoard` | Update vision board content and references |
| `DeleteVisionBoard` | Delete a vision board |

### Queries

| Query | Description |
|-------|-------------|
| `GetVisionBoard` | Get a vision board by ID |
| `GetVisionBoardWithNestedData` | Get a vision board with resolved paths, notes, and stories |
| `GetVisionBoardsQuota` | Get vision board quota (total, not daily) |
| `ListVisionBoards` | List all user's vision boards |

### Key Concepts

- References to paths, notes, and wisdom stories are stored as JSONB arrays of IDs (not foreign keys)
- The `GetVisionBoardWithNestedData` query resolves these references into full objects
- Quota: 1 vision board total for free users (not daily -- total cap)

---

## Wisdom Story

**Location:** `src/domain/wisdom-story/`

Inspirational stories sourced from the Strapi CMS with multi-language support.

### Queries

| Query | Description |
|-------|-------------|
| `GetWisdomStory` | Get a specific wisdom story |
| `GetWisdomStoriesByIds` | Get multiple stories by IDs (for vision boards) |
| `ListUserWisdomStories` | List stories filtered by user's language and belief |

### Scheduled Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| `SyncWisdomStoriesWithCmsTask` | Configurable (default: `*/15 * * * *`, every 15 min) | Syncs wisdom stories from Strapi CMS -- creates, updates, and deletes as needed |

### Key Concepts

- Content is managed in Strapi CMS and synced periodically
- Stories have translations in multiple languages (`en`, `th`, `id`)
- Filtered by belief system (`general`, specific beliefs)
- Some stories are free, others require premium access
- Each story has a mood tag and reading time estimate

---

## Calendar

**Location:** `src/domain/calendar/`

Religious and cultural calendar events with multi-language translations and push notifications.

### Commands

| Command | Description |
|---------|-------------|
| `SendCalendarEventNotification` | Send push notifications for today's events |

### Queries

| Query | Description |
|-------|-------------|
| `GetCalendarEvent` | Get the calendar event for a specific date and belief |

### Scheduled Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| `SendCalendarEventNotificationsTask` | `30 2 * * *` (2:30 AM UTC = 9:30 AM Bangkok) | Sends push notifications for today's events to matching users |
| `SyncCalendarEvents` | `0 0 15 12 *` (midnight Dec 15 UTC) | Syncs calendar events for the next year using AI |

### Key Concepts

- Events are specific to a belief system and date combination
- Translations are provided in multiple languages
- Annual sync generates events for the upcoming year using AI
- Notifications are sent each morning to users whose belief matches the day's event

---

## Notification

**Location:** `src/domain/notification/`

Push notification management via Firebase Cloud Messaging (FCM).

### Commands

| Command | Description |
|---------|-------------|
| `RegisterPushToken` | Register a device's FCM token |
| `UnregisterPushToken` | Remove a device's FCM token |
| `SendNotificationToUser` | Send a push notification to all of a user's devices |

### Key Concepts

- Users can have multiple push tokens (one per device)
- Notifications are sent in batches of 1000 tokens with max 5 concurrent batches
- Invalid tokens are automatically detected and cleaned up
- Notification types: path reminders and calendar event alerts
- The notification provider is abstracted (Firebase implementation + fake for testing)

---

## Purchase

**Location:** `src/domain/purchase/`

Subscription management via RevenueCat integration.

### Commands

| Command | Description |
|---------|-------------|
| `RefreshAccountEntitlementsFromRevenueCat` | Sync entitlements from RevenueCat for a specific account |

### Scheduled Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| `RefreshCustomersEntitlementsTask` | Every hour | Refreshes all customer entitlements from RevenueCat API in batches |

### Domain Events

| Event | Handler | Description |
|-------|---------|-------------|
| `RevenueCatWebhookTriggeredEvent` | `RevenueCatWebhookTriggeredEventHandler` | Handles webhook events and refreshes entitlements for the affected account |

### Key Concepts

- RevenueCat manages all subscription/purchase logic
- The backend syncs entitlements (currently only `premium_access`)
- Webhook endpoint receives real-time subscription events (purchase, renewal, cancellation)
- Hourly batch refresh ensures consistency even if webhooks are missed
- Rate limiting with retry logic for RevenueCat API calls

---

## Prompt

**Location:** `src/domain/prompt/`

Internal module that provides AI prompt templates to other domain modules.

### Queries

Multiple query handlers for loading and compiling Handlebars templates:
- Compass context, welcome, conversation, close, encourage-close, summarize prompts
- Compass suggest-add-path and suggest-save-note function description prompts
- Note summarize prompt
- Calendar sync prompts

### Key Concepts

- Templates are stored as `.hbs` files in the `prompts/` directory
- The `FileSystemPromptRepository` loads templates from disk
- Templates are compiled with context data using the `HandlebarsTemplateService`
- This module is consumed by Compass, Note, and Calendar modules

---

## Scheduled Tasks Summary

All scheduled tasks use the `@Cron()` decorator from `@nestjs/schedule` and run on the server timezone unless otherwise specified.

| Task | Module | Schedule (UTC) | Local Time | Description |
|------|--------|----------------|------------|-------------|
| Mark paths overdue | Path | `0 17 * * *` | Midnight Bangkok | Marks awaiting paths as overdue |
| Path notifications | Path | `0 2 * * *` | 9:00 AM Bangkok | Sends reminders for overdue paths |
| Calendar notifications | Calendar | `30 2 * * *` | 9:30 AM Bangkok | Sends calendar event notifications |
| Calendar sync | Calendar | `0 0 15 12 *` | Dec 15 midnight | Annual calendar event generation via AI |
| Wisdom story sync | Wisdom Story | `*/15 * * * *` (configurable) | -- | Syncs content from Strapi CMS |
| Entitlements refresh | Purchase | Every hour | -- | Batch syncs entitlements from RevenueCat |

All tasks that modify data use **distributed locking** to prevent concurrent execution across multiple instances.

---

## Domain Events Summary

| Event | Source Module | Handler Module | Description |
|-------|-------------|----------------|-------------|
| `CompassChatClosedEvent` | Compass | Compass | Generates AI summary on chat close |
| `NoteCreatedEvent` | Note | Note | Triggers AI summarization |
| `NoteUpdatedEvent` | Note | Note | Triggers AI re-summarization |
| `RevenueCatWebhookTriggeredEvent` | Purchase | Purchase | Refreshes entitlements from RevenueCat |
