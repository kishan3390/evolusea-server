# Development Guide

## Prerequisites

- **Node.js** 20+ (22 recommended)
- **Yarn** 1.22+
- **Docker** and **Docker Compose** (recommended for local development)

## Initial Setup

1. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd evolusea-backend
yarn install
```

2. Copy the environment template and fill in required values:

```bash
cp .env.example .env
```

At minimum, set the database credentials and Firebase credentials. See [Configuration](configuration.md) for the full variable reference.

3. (Optional) Pre-build Swagger metadata:

```bash
yarn run generate:metadata
```

## Running Locally

### Option A: Docker Compose (Recommended)

Start the workspace container and PostgreSQL:

```bash
docker compose up --build workspace db
```

This will:
- Build the workspace Docker image
- Mount the repository as a volume for hot reloading
- Start PostgreSQL 16 on port 5432
- Start the NestJS dev server on port 3000

To also start pgAdmin (database UI):

```bash
docker compose --profile development up pgadmin
```

pgAdmin is available at `http://localhost:8001` (login: `admin@admin.com` / `root`).

### Option B: Host Machine

Ensure PostgreSQL is running locally (or update `POSTGRES_HOST=localhost` in `.env`), then:

```bash
yarn run start:dev
```

### Accessing the API

- **API**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`

---

## Project Structure

```
evolusea-backend/
├── .github/workflows/         # CI/CD pipeline definitions
├── bin/                       # Build scripts (metadata generation)
├── docs/                      # Project documentation (you are here)
├── migrations/                # TypeORM database migrations
│   └── migrations.ts          # Migration registry
├── prompts/                   # Handlebars templates for AI prompts
│   ├── compass-*.hbs          # Compass chat prompts
│   ├── note-*.hbs             # Note summarization prompts
│   ├── quote/                 # Quote generation prompts
│   └── calendar/              # Calendar sync prompts
├── scripts/                   # Deployment and utility scripts
├── smoke-tests/               # Post-deployment smoke tests
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root NestJS module
│   ├── ai/                    # AI provider integration
│   │   ├── base/              # Abstract AI service and mappers
│   │   ├── open-ai/           # OpenAI implementation
│   │   └── gemini/            # Google Gemini implementation
│   ├── building-blocks/       # Shared DDD abstractions
│   │   ├── application/       # CommandHandler, QueryHandler interfaces
│   │   ├── domain/            # Entity, ValueObject, DomainEvent, BusinessRule
│   │   └── infrastructure/    # Mediator, transaction management
│   ├── cms/                   # CMS integrations (Strapi)
│   ├── config/                # Centralized configuration
│   │   ├── config.ts          # ConfigProvider
│   │   └── interfaces/        # Config type definitions
│   ├── distributed-lock/      # Database-backed distributed locking
│   ├── domain/                # Domain modules (DDD bounded contexts)
│   │   ├── account/
│   │   ├── calendar/
│   │   ├── compass/
│   │   ├── note/
│   │   ├── notification/
│   │   ├── path/
│   │   ├── prompt/
│   │   ├── purchase/
│   │   ├── quote/
│   │   ├── user-profile/
│   │   ├── vision-board/
│   │   └── wisdom-story/
│   ├── firebase/              # Firebase Admin SDK integration
│   ├── http-app/              # HTTP layer (controllers, guards, filters)
│   │   ├── controllers/       # REST controllers per resource
│   │   ├── dto/               # Request/response DTOs
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Auth and access guards
│   │   └── interceptors/      # Request interceptors
│   ├── lib/                   # Shared libraries
│   │   ├── database/          # TypeORM transaction utilities
│   │   ├── date/              # Date/timezone helpers (Bangkok TZ)
│   │   ├── purchase/          # RevenueCat client
│   │   └── template/          # Handlebars template service
│   ├── logger/                # Winston logger setup
│   ├── postgres/              # TypeORM database module
│   ├── sentry/                # Sentry error monitoring
│   └── swagger/               # Swagger/OpenAPI setup
├── team-tools/                # Helper development apps
│   ├── firebase-auth-app/     # React app for Firebase auth testing
│   ├── firebase-messaging/    # FCM testing tool
│   └── revenue-cat-web-app/   # RevenueCat billing demo
├── terraform/                 # Infrastructure as Code
│   ├── shared/                # Shared AWS resources
│   └── environments/          # Per-environment resources
├── test/                      # E2E test infrastructure
│   ├── sut/                   # System Under Test helpers
│   └── vitest.config.e2e.mts  # E2E test configuration
├── compose.yml                # Docker Compose (development)
├── compose-prod.yml           # Docker Compose (production image testing)
├── Dockerfile                 # Multi-stage Docker build
├── nest-cli.json              # NestJS CLI config (SWC builder)
├── ormconfig.ts               # TypeORM connection configuration
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

---

## Domain Module Structure

Each domain module under `src/domain/` follows a consistent three-layer structure:

```
src/domain/<module>/
├── application/
│   ├── commands/              # Write operations
│   │   └── <command-name>/
│   │       ├── <command-name>.command.ts
│   │       └── <command-name>.command-handler.ts
│   ├── queries/               # Read operations
│   │   └── <query-name>/
│   │       ├── <query-name>.query.ts
│   │       └── <query-name>.query-handler.ts
│   └── events/                # Domain event handlers (optional)
│       └── <event-name>/
│           └── <event-name>.event-handler.ts
├── domain/
│   ├── <entity-name>.ts       # Domain entity with business logic
│   ├── <repository>.ts        # Abstract repository interface
│   └── <enums>.ts             # Domain enums
├── infrastructure/
│   ├── entities/              # TypeORM entity definitions
│   │   └── <entity>.entity.ts
│   ├── mappers/               # Domain <-> persistence mappers
│   ├── repositories/          # Repository implementations
│   └── tasks/                 # Scheduled cron tasks (optional)
├── <module>.facade.ts         # Abstract facade interface
├── <module>.real.facade.ts    # Facade implementation
└── <module>.module.ts         # NestJS module definition
```

### Adding a New Domain Module

1. Create the folder structure under `src/domain/<new-module>/`
2. Define the domain entity extending `Entity` from building blocks
3. Create the TypeORM entity in `infrastructure/entities/`
4. Create the mapper between domain and persistence entities
5. Define the abstract repository interface in `domain/`
6. Implement the repository in `infrastructure/repositories/`
7. Create command and query handlers in `application/`
8. Define the abstract facade and its implementation
9. Create the NestJS module and register providers
10. Create a corresponding controller in `src/http-app/`
11. Generate a migration: `yarn run migration:autogenerate src/migrations/Add<Entity>`
12. Run the migration: `yarn run migration:up`

---

## Useful Yarn Scripts

### Development

| Command | Description |
|---------|-------------|
| `yarn start:dev` | Start dev server with hot reload |
| `yarn start:debug` | Start in debug mode with watch |
| `yarn start` | Start without watch |
| `yarn start:prod` | Start production build |
| `yarn build` | Build for production (generates metadata + compiles) |
| `yarn generate:metadata` | Generate Swagger plugin metadata |

### Database

| Command | Description |
|---------|-------------|
| `yarn migration:up` | Run pending migrations |
| `yarn migration:down` | Revert last migration |
| `yarn migration:create src/migrations/<Name>` | Create empty migration |
| `yarn migration:autogenerate src/migrations/<Name>` | Auto-generate migration from entity changes |

### Testing

| Command | Description |
|---------|-------------|
| `yarn test` | Run unit tests |
| `yarn test:watch` | Run unit tests in watch mode |
| `yarn test:cov` | Run tests with coverage report |
| `yarn test:e2e` | Run E2E tests (requires Docker for Testcontainers) |
| `yarn test:e2e:verbose` | Run E2E tests with verbose output |
| `yarn test:smoke-tests` | Run smoke tests against a running API |

### Code Quality

| Command | Description |
|---------|-------------|
| `yarn lint` | Run ESLint |
| `yarn format` | Run Prettier on all source files |

---

## Coding Conventions

### TypeScript

- Strict TypeScript with path aliases defined in `tsconfig.json`
- SWC compiler for faster builds (configured in `nest-cli.json`)
- ESLint + Prettier for code formatting (auto-runs on pre-commit)

### Naming

- **Files**: `kebab-case` (e.g., `create-note.command-handler.ts`)
- **Classes**: `PascalCase` (e.g., `CreateNoteCommandHandler`)
- **Database tables**: `snake_case` (automatic via `SnakeNamingStrategy`)
- **Enums**: `PascalCase` keys with `kebab-case` values

### Patterns

- **Facade Pattern**: Controllers call facades, never command/query handlers directly
- **Repository Pattern**: Domain defines abstract repositories, infrastructure implements them
- **Mapper Pattern**: Explicit mapping between domain entities and TypeORM entities
- **Command/Query Separation**: Write operations are commands, read operations are queries
- **Domain Events**: Side effects are triggered via events, not coupled to commands

### Validation

- Request validation uses `class-validator` decorators on DTOs
- Global `ValidationPipe` with `transform: true` and `whitelist: true`
- Domain rules use the `BusinessRule` pattern with `checkRule()` / `checkAsyncRule()`

---

## Docker Services

### Development Stack (`compose.yml`)

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| `workspace` | Built from Dockerfile (workspace stage) | 3000, 5433 | NestJS dev server with hot reload |
| `db` | `postgres:16-alpine` | 5432 | PostgreSQL database |
| `pgadmin` | `dpage/pgadmin4` | 8001 | Database admin UI (dev profile only) |

### Production Testing (`compose-prod.yml`)

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| `final` | `${IMAGE_NAME}` | 3001 | Production image with health check |

### Useful Docker Commands

```bash
# Start development environment
docker compose up --build workspace db

# Start with pgAdmin
docker compose --profile development up pgadmin

# Run migrations inside container
docker compose exec workspace yarn run migration:up

# Run smoke tests against workspace
docker compose exec -e URL_BASE=http://workspace:3000 workspace yarn run test:smoke-tests

# Test production image
IMAGE_NAME=<tag> docker compose -f compose.yml -f compose-prod.yml up final db
```
