# Evolusea Backend

NestJS + TypeORM service that powers the Evolusea platform. The project ships with a Docker-based workspace, migration tooling, and helper apps under `team-tools/` for authentication, messaging, and billing experiments.

## Requirement
- Node.js 20+
- Yarn 1.22+
- Docker & Docker Compose (optional but recommended for local parity)

## Initial Setup
1. Copy environment defaults and review placeholders before running the app:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
3. (Optional) Pre-build shared metadata required for production builds:
   ```bash
   yarn run generate:metadata
   ```

## Running the API Locally
### Using Docker (full workspace)
```bash
docker compose up --build workspace db
```
- Mounts the repo into the `workspace` container and hot-reloads using `yarn start:dev`.
- Exposes API at http://localhost:3000 and PostgreSQL at `localhost:5432` (container) / `localhost:5433` (workspace service).
- Add `pgadmin` via `docker compose --profile development up pgadmin` when you need a UI at http://localhost:8001.
- Swagger UI is always available at http://localhost:3000/api; refresh after entity changes or rebuild with `yarn run generate:metadata` so docs include the latest schemas.

### Using the host machine (Node only)
```bash
yarn run start:dev
```
- Requires PostgreSQL running locally and configured via `.env`.
- Use `yarn run start` for a single-run dev server or `yarn run start:prod` after building.
- Swagger UI lives at http://localhost:3000/api on the host too.

## Database & Migrations
TypeORM migrations are configured through `ormconfig.ts` and exposed via yarn scripts:
- `yarn run migration:create src/migrations/<Name>` – create an empty migration.
- `yarn run migration:autogenerate src/migrations/<Name>` – generate from entity changes.
- `yarn run migration:up` – run pending migrations.
- `yarn run migration:down` – revert the latest batch.

Migrations operate against the database described in `.env`. When running inside Docker, connect with `docker compose exec workspace yarn run migration:up` so the command has network access to the `db` container.

## Testing & Quality
- `yarn run test` – Vitest unit suite (see also `test:watch`, `test:cov`).
- `yarn run test:e2e` – integration tests using Testcontainers (requires Docker).
- `yarn run test:smoke-tests` – exercise deployed environments; pass `URL_BASE` via env when needed.
- `yarn run lint` / `yarn run format` – ESLint + Prettier.
- `yarn run build` – transpile to `dist/` (calls `generate:metadata` automatically).

## Error Monitoring
Sentry captures runtime issues across environments. Supply the following variables when you want reporting:
- `SENTRY_DSN`
- `SENTRY_ENVIRONMENT` (use `local-sentry-tests` for local runs)
- Optional CLI variables (`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`) unlock deployment and release commands.

For infrastructure-managed environments, set the `sentry_dsn` Terraform variable (details in `terraform/README.md`).

## Infrastructure & CI/CD
Infrastructure lives under `terraform/` and relies on Terraform Cloud; authenticate inside the workspace container with `TERRAFORM_CLOUD_TOKEN` in `.env`. The GitHub Actions pipeline (`.github/workflows/main.yaml`) builds workspace images, runs tests (unit/E2E/smoke), builds the release image, and deploys to development, staging, and production. Provide the required AWS credentials/secrets in the repository settings: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and update `ECR_REGISTRY`, `AWS_DEFAULT_REGION`, and `REPOSITORY_NAME` as needed.

## Team Tools
Helper apps that support backend development live in `team-tools/`:
- `team-tools/firebase-auth-app` – React app for verifying Firebase Auth flows. Copy `src/firebase-config.ts.template`, fill in your project creds, then `yarn install && yarn run dev`.
- `team-tools/firebase-messaging` – Firebase Cloud Messaging quickstart. Configure `config.ts`, install deps (`npm install`), and run either `firebase emulators:start` + `npm run dev` or `firebase deploy` as described in its README.
- `team-tools/revenue-cat-web-app` – RevenueCat web billing demo. Install/build the root `purchases-js` dependency, set `VITE_RC_API_KEY`, then `npm run dev` (extra tips for Apple/Google Pay inside its README).

Each tool has a dedicated README with environment variables and testing commands—refer to them when troubleshooting auth tokens, push notifications, or billing flows.

## Smoke Tests
With the API running (locally or via Docker), execute:
```bash
docker compose exec -e URL_BASE=http://workspace:3000 workspace yarn run test:smoke-tests
```
Adjust `URL_BASE` to hit remote deployments for production readiness checks.

## Full Documentation

For comprehensive documentation covering architecture, API reference, database schema, configuration, deployment, AI integration, and more, see the [docs/](docs/README.md) directory.
