# API Reference

Base URL: `http://localhost:3000` (local) or `https://<environment>-api.evolusea.com` (deployed)

Interactive Swagger UI is available at `/api`.

## Authentication

Most endpoints require Firebase Authentication via a Bearer token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

### Guard Chain

Authenticated endpoints pass through a chain of guards controlled by the `@RequiredAuth()` decorator:

| Guard | Default | Description |
|-------|---------|-------------|
| `FirebaseAuthGuard` | Always applied | Validates Firebase JWT token via Passport |
| `HasAccountGuard` | `true` | Verifies the user has a synced account |
| `HasUserProfileGuard` | `true` | Verifies the user has created a profile |
| `VerifiedEmailGuard` | `true` | Verifies the user's email is confirmed |

Guards can be selectively disabled per endpoint:

```typescript
@RequiredAuth({ hasAccount: false, hasUserProfile: false })
```

### Error Responses

All errors follow a consistent format. Domain errors are mapped to HTTP status codes:

| Domain Error | HTTP Status |
|-------------|-------------|
| `DomainRuleViolation` | `422 Unprocessable Entity` |
| `AccessDenied` | `401 Unauthorized` |
| `PermissionDenied` | `403 Forbidden` |
| `NotFound` | `404 Not Found` |
| `NonUnique` | `422 Unprocessable Entity` |
| `InternalError` | `400 Bad Request` |
| `ValidationError` | `400 Bad Request` |

HTTP exceptions use RFC 7807 format:

```json
{
  "status": 404,
  "type": "NotFound",
  "instance": "/users/me/notes/abc",
  "title": "Not Found",
  "detail": "Note not found"
}
```

---

## Endpoints

### Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Returns service health status |

---

### Account

Base path: `/accounts`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/accounts/me/sync` | Firebase (no account/profile required) | Synchronize account with Firebase. Creates the account if it does not exist. |
| `POST` | `/accounts/me/entitlements/sync` | Firebase | Refresh subscription entitlements from RevenueCat |
| `DELETE` | `/accounts/me` | Firebase (no profile required) | Delete the current account and all associated data |

---

### User Profile

Base path: `/users/me/profile`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users/me/profile` | Firebase (no profile required) | Get the current user's profile |
| `POST` | `/users/me/profile` | Firebase (no profile required) | Create a new user profile |
| `PUT` | `/users/me/profile` | Firebase (no profile required) | Update the current user's profile |
| `DELETE` | `/users/me/profile` | Firebase (no profile required) | Delete the current user's profile |

**Create/Update Profile Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Display name |
| `countryCode` | enum | Yes | Country code (e.g., `TH`, `ID`, `US`) |
| `belief` | enum | Yes | Belief system (`chinese-buddhism`, `thai-buddhism`, `christianity`, `hinduism`, `islam`, `other`) |
| `language` | enum | No | Language (`en`, `th`, `id`). Defaults to `en` |
| `biography` | string | No | User biography |

---

### Notes

Base path: `/users/me/notes`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/users/me/notes` | Firebase | Create a new note |
| `GET` | `/users/me/notes` | Firebase | List all notes for the current user |
| `GET` | `/users/me/notes/quota` | Firebase | Get daily note creation quota |
| `GET` | `/users/me/notes/:id` | Firebase | Get a specific note by ID |
| `PUT` | `/users/me/notes/:id` | Firebase | Update a note |
| `DELETE` | `/users/me/notes/:id` | Firebase | Delete a note |

**Create/Update Note Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Note title |
| `description` | string | No | Note content |
| `mood` | enum | Yes | Mood (`overwhelmed`, `uncertain`, `calm`, `motivated`, `grateful`, `restless`) |
| `anonymousSharingEnabled` | boolean | No | Allow anonymous sharing. Defaults to `false` |

**Quota Response:**

```json
{
  "isAllowed": true,
  "limit": 3,
  "remaining": 2
}
```

Premium users receive `limit: null, remaining: null` (unlimited).

---

### Paths

Base path: `/users/me/paths`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/users/me/paths` | Firebase | Create a new path (goal) |
| `GET` | `/users/me/paths` | Firebase | List all paths for the current user |
| `GET` | `/users/me/paths/quota` | Firebase | Get daily path creation quota |
| `GET` | `/users/me/paths/:id` | Firebase | Get a specific path by ID |
| `PUT` | `/users/me/paths/:id` | Firebase | Update a path |
| `DELETE` | `/users/me/paths/:id` | Firebase | Delete a path |
| `POST` | `/users/me/paths/:id/complete` | Firebase | Mark a path as completed |
| `POST` | `/users/me/paths/:id/restore` | Firebase | Restore a completed/overdue path to awaiting |

**Create/Update Path Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Path title |
| `description` | string | No | Path description |
| `date` | date | Yes | Target date for the path |

**Path Statuses:** `awaiting`, `overdue`, `completed`

---

### Compass (AI Chat)

#### Chat Management

Base path: `/users/me/compass/chats`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/users/me/compass/chats/start` | Firebase | Start a new compass chat session |
| `POST` | `/users/me/compass/chats/close` | Firebase | Close an active compass chat |
| `GET` | `/users/me/compass/chats` | Firebase | List all compass chats |
| `GET` | `/users/me/compass/chats/quota` | Firebase | Get daily compass chat quota |
| `GET` | `/users/me/compass/chats/:id` | Firebase | Get a specific compass chat with messages |
| `GET` | `/users/me/compass/chats/start/options` | Firebase | Get available chat start options |

**Start Chat Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `intention` | enum | Yes | Chat intention |
| `topic` | enum | Yes | Chat topic (`open-question`, `personal-note`, `path-item`, `calendar-event`, `quote`) |

**Start Options Response:**

```json
{
  "isDailyQuoteAvailable": true,
  "isPersonalNoteAvailable": true,
  "isPathItemAvailable": true,
  "isCalendarEventAvailable": false
}
```

#### Chat Messages

Base path: `/users/me/compass/chats/:compassChatId/messages`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/users/me/compass/chats/:compassChatId/messages/send` | Firebase | Send a message in a compass chat |
| `GET` | `/users/me/compass/chats/:compassChatId/messages` | Firebase | List messages in a compass chat |

**Send Message Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Message text |

#### Compass Configuration

Base path: `/users/me/compass/config`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/users/me/compass/config` | Firebase | Create compass configuration |
| `GET` | `/users/me/compass/config` | Firebase | Get current compass configuration |
| `PUT` | `/users/me/compass/config` | Firebase | Update compass configuration |

**Compass Config Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `goal` | enum | Yes | User's goal |
| `personality` | enum | Yes | Preferred AI personality |

---

### Quotes

Base path: `/users/me/quotes`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users/me/quotes/daily` | Firebase | Get today's daily quotes (1 for free, 3 for premium) |
| `GET` | `/users/me/quotes` | Firebase | Browse the full quote pool (premium only, filterable) |
| `GET` | `/users/me/quotes/quota` | Firebase | Get quote quota information |
| `GET` | `/users/me/quotes/:quoteId` | Firebase | Get a specific quote by ID |

Quotes are drawn from a **pre-curated pool** (`quote_pool` table) seeded with multi-language inspirational content. Daily quotes are selected based on the user's belief system, language, and current mood (inferred from their latest note).

**Daily Quotes Response:**

```json
{
  "quotes": [
    {
      "id": "uuid",
      "content": "The lotus blooms in muddy water...",
      "attribution": "Thich Nhat Hanh",
      "source": "Peace Is Every Step",
      "mood": "calm",
      "beliefSystem": "other"
    }
  ]
}
```

**Browse Quote Pool Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `mood` | enum | No | Filter by mood (`calm`, `motivated`, `uncertain`, `overwhelmed`, `grateful`, `restless`) |
| `beliefSystem` | enum | No | Filter by belief system |
| `page` | number | No | Page number |
| `perPage` | number | No | Items per page |

**Quota Response:**

```json
{
  "dailyLimit": 1,
  "browseAllowed": false
}
```

Premium users receive `dailyLimit: 3, browseAllowed: true`.

---

### Vision Boards

Base path: `/users/me/vision-boards`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/users/me/vision-boards` | Firebase | Create a new vision board |
| `GET` | `/users/me/vision-boards` | Firebase | List all vision boards |
| `GET` | `/users/me/vision-boards/quota` | Firebase | Get vision board quota |
| `GET` | `/users/me/vision-boards/:visionBoardId` | Firebase | Get a specific vision board with nested data |
| `PUT` | `/users/me/vision-boards/:visionBoardId` | Firebase | Update a vision board |
| `DELETE` | `/users/me/vision-boards/:visionBoardId` | Firebase | Delete a vision board |

**Create/Update Vision Board Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Vision board title |
| `description` | string | No | Vision board description |
| `pathsIds` | string[] | No | Array of path IDs to include |
| `notesIds` | string[] | No | Array of note IDs to include |
| `wisdomStoriesIds` | string[] | No | Array of wisdom story IDs to include |

---

### Wisdom Stories

Base path: `/wisdom-stories`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/wisdom-stories` | Firebase | List wisdom stories (filtered by user's language and belief) |
| `GET` | `/wisdom-stories/:id` | Firebase | Get a specific wisdom story by ID |

Wisdom stories are synced from the Strapi CMS. Content is filtered by the user's language and belief system.

---

### Calendar Events

Base path: `/users/me/calendar/events`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users/me/calendar/events/:date` | Firebase | Get calendar event for a specific date |

Calendar events are synced annually and filtered by the user's belief system. Translations are returned in the user's language.

---

### Notifications

Base path: `/users/me/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/users/me/notifications/register-push-token` | Firebase (no profile required) | Register a device push notification token |
| `POST` | `/users/me/notifications/unregister-push-token` | Firebase (no profile required) | Unregister a device push notification token |

**Register/Unregister Token Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | Yes | Firebase Cloud Messaging device token |

---

### Purchases (Webhooks)

Base path: `/purchases`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/purchases/webhooks/revenue-cat` | API Key (`Authorization` header) | Handle RevenueCat subscription webhook events |

This endpoint is called by RevenueCat when subscription events occur (purchase, renewal, cancellation, etc.). It is authenticated via an API key, not Firebase.

---

### Lookups

Base path: `/lookups`

These endpoints are public and require no authentication.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/lookups/countries` | None | Get list of supported countries |
| `GET` | `/lookups/beliefs` | None | Get list of belief systems |
| `GET` | `/lookups/goals` | None | Get list of goals |
| `GET` | `/lookups/compass-personalities` | None | Get list of compass AI personalities |
| `GET` | `/lookups/moods` | None | Get list of moods |
| `GET` | `/lookups/intentions` | None | Get list of compass intentions |
| `GET` | `/lookups/compass-topics` | None | Get list of compass topics |

---

### Playground (Development Only)

These endpoints are for development and testing purposes.

#### Compass Playground

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/playground/users/me/compass/chats/start` | Firebase | Start compass chat with prompt injection sanitizer disabled |
| `POST` | `/playground/users/me/compass/chats/:compassChatId/messages/send` | Firebase | Send compass chat message with prompt injection sanitizer disabled |

#### Notification Playground

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/playground/notifications/send` | None | Send a test push notification |

---

## Global Middleware

| Middleware | Description |
|-----------|-------------|
| `ValidationPipe` | Validates and transforms request bodies using `class-validator`. Whitelists properties and stops at first error. |
| `BodyPromptMarkupSanitizerInterceptor` | Sanitizes prompt injection attempts in request body strings. Can be disabled per endpoint with `@DisableBodyPromptInjectionSanitizer()`. |
