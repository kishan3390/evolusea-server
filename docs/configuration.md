# Configuration

All application configuration is centralized in `src/config/config.ts` through the `ConfigProvider` class. Values are read from environment variables with sensible defaults for local development.

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### Application

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `evolusea-backend` | Application name |
| `ENV` | `local` | Environment identifier (`local`, `development`, `staging`, `production`) |

### Database (PostgreSQL)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_HOST` | `db` | Database host (use `db` for Docker, `localhost` for host machine) |
| `POSTGRES_PORT` | `5432` | Database port |
| `POSTGRES_USER` | `postgres` | Database username |
| `POSTGRES_PASSWORD` | `secret` | Database password |
| `POSTGRES_DB` | `evolusea-backend` | Database name |

### AWS

| Variable | Default | Description |
|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | -- | AWS access key for infrastructure operations |
| `AWS_SECRET_ACCESS_KEY` | -- | AWS secret key |
| `AWS_DEFAULT_REGION` | `ap-southeast-7` | AWS region (Thailand) |
| `AWS_PAGER` | `""` | Disable AWS CLI pager |
| `AWS_DEFAULT_OUTPUT` | `text` | AWS CLI output format |
| `USE_SSM` | `false` | Load config from AWS SSM Parameter Store instead of env vars |

### Terraform

| Variable | Default | Description |
|----------|---------|-------------|
| `TERRAFORM_CLOUD_TOKEN` | -- | Terraform Cloud authentication token |

### Firebase

| Variable | Default | Description |
|----------|---------|-------------|
| `FIREBASE_CREDENTIALS_ENCODED` | -- | Base64-encoded Firebase service account JSON |

### AI Providers

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | -- | OpenAI API key |
| `GEMINI_API_KEY` | -- | Google Gemini API key |
| `ANTHROPIC_API_KEY` | -- | Anthropic (Claude) API key |

### Sentry (Error Monitoring)

| Variable | Default | Description |
|----------|---------|-------------|
| `SENTRY_DSN` | -- | Sentry data source name (leave empty to disable) |
| `SENTRY_ENVIRONMENT` | -- | Sentry environment label |
| `SENTRY_AUTH_TOKEN` | -- | Sentry CLI auth token (for releases) |
| `SENTRY_ORG` | -- | Sentry organization slug |
| `SENTRY_PROJECT` | -- | Sentry project slug |
| `SENTRY_RELEASE` | -- | Release version string |

### Domain Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `COMPASS_TURNS_COUNT_SOFT_LIMIT` | `10` | Compass chat turn limit before encouraging close |
| `COMPASS_TURNS_COUNT_HARD_LIMIT` | `25` | Maximum compass chat turns before forced close |
| `WISDOM_STORY_STRAPI_SYNC_CRON` | `*/15 * * * *` | Cron expression for Strapi wisdom story sync |
| `WISDOM_STORY_STRAPI_SYNC_TIMEZONE` | `UTC` | Timezone for the sync cron schedule |

### Strapi CMS

| Variable | Default | Description |
|----------|---------|-------------|
| `STRAPI_URL` | -- | Strapi API base URL |
| `STRAPI_API_TOKEN` | -- | Strapi API authentication token |

### RevenueCat (Payments)

| Variable | Default | Description |
|----------|---------|-------------|
| `REVENUE_CAT_API_KEY_V1` | -- | RevenueCat v1 API key |
| `REVENUE_CAT_API_KEY_V2` | -- | RevenueCat v2 API key |
| `REVENUE_CAT_PROJECT_ID` | -- | RevenueCat project identifier |
| `REVENUE_CAT_WEBHOOK_KEY` | -- | Shared secret for webhook authentication |

---

## Config Provider Structure

The `ConfigProvider` (`src/config/config.ts`) exposes a typed configuration object implementing the `IConfig` interface:

```
ConfigProvider
├── appName: string
├── swagger
│   ├── path: "/api"
│   ├── version: "1.0.1"
│   └── title: "User Api Documentation"
├── sentry
│   ├── dsn: string | undefined
│   ├── init.tracesSampleRate: 0.05
│   └── ignorePath: [swagger.path, healthcheck.path]
├── healthcheck
│   └── path: "/health"
├── logger
│   ├── level: "debug"
│   └── loggly: { token, subdomain, tags }
├── database
│   ├── type: "postgres"
│   ├── host, port, username, password, database
│   └── (from POSTGRES_* env vars)
├── firebase
│   └── googleCredentialsEncoded: string
├── strapi
│   ├── url: string
│   └── apiToken: string
├── ai
│   ├── openAiKey: string
│   ├── geminiKey: string
│   └── anthropicKey: string
├── domain
│   ├── compass
│   │   ├── turnsCountSoftLimit: number
│   │   └── turnsCountHardLimit: number
│   └── wisdomStory
│       ├── strapiSyncCron: string
│       ├── strapiSyncTimezone: string
│       ├── aiGenerateCron: string
│       └── aiGenerateTimezone: string
├── revenueCat
│   ├── apiKeyV1: string
│   ├── apiKeyV2: string
│   ├── webhookKey: string
│   └── projectId: string
└── freeTierQuota
    ├── dailyCompassChatsLimit: 2
    ├── dailyNotesLimit: 3
    ├── dailyPathsLimit: 3
    └── visionBoardsLimit: 1
```

---

## AWS SSM Parameter Store

When `USE_SSM=true`, the application loads configuration from AWS Systems Manager Parameter Store instead of environment variables. This is used in deployed environments where secrets are managed through AWS.

The SSM integration is bootstrapped at startup via the `start_ssm.sh` script, which sets up port forwarding through a bastion host to reach the RDS database.

---

## Free Tier Quotas

Free (non-premium) users are subject to usage limits. Premium users (with an active `premium_access` entitlement) have unlimited access.

| Resource | Free Tier Limit | Reset |
|----------|----------------|-------|
| Compass Chats | 2 per day | Daily (Bangkok timezone) |
| Notes | 3 per day | Daily (Bangkok timezone) |
| Paths | 3 per day | Daily (Bangkok timezone) |
| Vision Boards | 1 total | Never (total cap) |
| Daily Quotes | 1 per day | Daily (Bangkok timezone) |
| Browse Quote Pool | Not available | Premium only |

Daily quotas reset at midnight Bangkok time (UTC+7). The quota check counts resources created within the current day's bounds.

Each quota endpoint returns:

```json
{
  "isAllowed": true,
  "limit": 3,
  "remaining": 1
}
```

For premium users:

```json
{
  "isAllowed": true,
  "limit": null,
  "remaining": null
}
```

---

## Swagger / OpenAPI

Interactive API documentation is served at the path configured in `swagger.path` (default: `/api`).

- Built using `@nestjs/swagger` with `DocumentBuilder`
- Bearer authentication is configured for testing authenticated endpoints
- Plugin metadata is auto-generated via `yarn run generate:metadata` (also runs during `prebuild`)
- Always available at `http://localhost:3000/api` during development
