# Test Directory Structure

This directory contains all end-to-end (E2E) and integration test setup and utilities for the project.

## Folders and Files

### `sut/`
- **Purpose:** Contains the "System Under Test" (SUT) helpers, factories, and test infrastructure to facilitate E2E and integration testing.

#### `sut/app-containers/`
- **Purpose:** Manages test containers, especially for the database, to provide isolated and repeatable test environments.
- **Key files:**
  - `AppContainersFactory.ts`: Factory for creating and managing database containers.
  - `DatabaseContainer.ts`: Handles lifecycle, migrations, and data cleanup for a PostgreSQL test container.

#### `sut/test-app/`
- **Purpose:** Provides utilities to bootstrap and interact with a test instance of the NestJS application.
- **Key files:**
  - `TestAppFactory.ts`: Creates a test application instance, overriding certain modules/providers for testing.
  - `TestApp.ts`: Wrapper around the NestJS app, providing helpers for HTTP requests and provider access.

##### `sut/test-app/doublers/`
- **Purpose:** Contains test doubles (fakes/mocks) for dependencies, e.g., authentication.

#### Other files in `sut/`
- `create-test-suite.ts`: Sets up a reusable test suite with proper lifecycle hooks for app and database.
- `e2e-tests-setup.mts`: Entry point to initialize the E2E test suite.

---

### `vitest.config.e2e.mts`, `vitest.d.ts`
- **Purpose:** Configuration and type definitions for running E2E tests with Vitest.

---

## How it works

- The test infrastructure uses [Testcontainers](https://www.testcontainers.org/) to spin up isolated PostgreSQL containers for each test suite, ensuring clean state and repeatability.
- The `TestAppFactory` and related helpers allow for easy bootstrapping and teardown of the NestJS application in a test context, with the ability to override providers (e.g., use fakes for external services).
- Test doubles in `doublers/` allow for simulating external dependencies, such as Firebase authentication, without requiring real external calls.

---

This structure ensures that tests are reliable, isolated, and easy to maintain.
