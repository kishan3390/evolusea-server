---
name: testing-patterns
description: Write unit tests, E2E tests, and smoke tests following Evolusea backend conventions. Use when creating test files, writing specs, setting up test infrastructure, mocking dependencies, or when the user asks about testing patterns.
---

# Testing Patterns

## Unit Tests

**Location**: Co-located with source as `*.spec.ts`
**Runner**: Vitest with `globals: true`
**Config**: `vitest.config.mts`
**Command**: `yarn test` (run), `yarn test:watch` (watch), `yarn test:cov` (coverage)

### Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('MyCommandHandler', () => {
  let handler: MyCommandHandler;
  let mockRepo: { save: ReturnType<typeof vi.fn>; findById: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(null),
    };
    handler = new MyCommandHandler(mockRepo);
  });

  it('should do something', async () => {
    // Arrange
    mockRepo.findById.mockResolvedValue(someDomainEntity);

    // Act
    const result = await handler.execute(new MyCommand({ ... }));

    // Assert
    expect(result).toBeDefined();
    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ ... }));
  });
});
```

### What to unit test

- **Domain entities**: Business logic methods, factory methods, validation rules
- **Command/query handlers**: Mock repositories and facades, verify orchestration
- **Mappers**: Domain-to-persistence and persistence-to-domain conversion
- **Services**: Pure logic like `CompassConversationWindowingService`
- **Interceptors/guards**: Use `Test.createTestingModule()` with inline test controllers

### Mock creation

Mock dependencies inline using `vi.fn()`. No separate mock utility classes needed:

```typescript
const mockRepo = {
  save: vi.fn().mockResolvedValue(undefined),
  findById: vi.fn().mockResolvedValue(null),
  getDailyTotalTokens: vi.fn().mockResolvedValue(0),
};
```

### Test data factories

Create helper functions for test entities:

```typescript
const createMessage = (overrides: Partial<{ id: string; content: string }> = {}) =>
  CompassChatMessage.createFromProps({
    id: overrides.id ?? 'msg-1',
    content: overrides.content ?? 'Hello',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
```

### Interceptor/guard unit tests

For HTTP-layer components, bootstrap a mini NestJS app:

```typescript
describe('MyInterceptor', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestController],
      providers: [Reflector, MyInterceptor],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(new MyInterceptor(app.get(Reflector)));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  it('should intercept requests', async () => {
    await request(app.getHttpServer()).post('/test').send({ ... }).expect(201);
  });
});
```

---

## E2E Tests

**Location**: `test/specs/**/*.e2e-spec.ts`
**Config**: `test/vitest.config.e2e.mts`
**Command**: `yarn test:e2e` or `yarn test:e2e:verbose`
**Infrastructure**: Testcontainers (real PostgreSQL), fake providers

### How it works

1. `e2e-tests-setup.mts` calls `createTestSuite()` which runs for every test file
2. `beforeAll`: Creates a `DatabaseContainer` (PostgreSQL via Testcontainers)
3. `beforeEach`: Creates a fresh `TestApp` via `TestAppFactory.create()`, injects it into `context.app`
4. `afterEach`: Waits for events, resets AI facade, truncates all tables, closes app
5. `afterAll`: Releases database container

### Pattern

```typescript
import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { expect } from 'vitest';

describe('Feature E2E', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  it('given precondition, when action, then expected result', async () => {
    // Create authenticated user (with profile + premium by default)
    const user = await app.signedInVerifiedAccount();

    // Call API via typed helpers
    const res = await user.noteAPI.createNote({
      title: 'test',
      description: 'test description',
      mood: Moods.Motivated,
      anonymousSharingEnabled: false,
    });

    expect(res.status).toEqual(HttpStatus.CREATED);
    expect(res.body).toEqual(expect.objectContaining({ title: 'test' }));
  });
});
```

### Key utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| `TestApp` | `test/test-app/test-app.ts` | Wraps NestJS app, provides helpers |
| `TestAppFactory` | `test/test-app/test-app-factory.ts` | Bootstraps app with fakes |
| `SignedInAccount` | `test/test-app/account/signed-in-account.ts` | Authenticated user with API helpers |
| `createTestSuite` | `test/sut/create-test-suite.ts` | Lifecycle hooks for all E2E tests |
| `DatabaseContainer` | `test/sut/app-containers/database-container.ts` | Testcontainers PostgreSQL |

### `signedInVerifiedAccount` options

```typescript
// Default: syncAuth=true, createProfile=true, premiumEntitlement=true
const premiumUser = await app.signedInVerifiedAccount();

// Free tier user
const freeUser = await app.signedInVerifiedAccount({ premiumEntitlement: false });

// No profile
const noProfileUser = await app.signedInVerifiedAccount({ createProfile: false });
```

### Override config in tests

```typescript
app.overrideConfig({
  freeTierQuota: {
    dailyNotesLimit: Number.MAX_SAFE_INTEGER,
  },
});
```

### Mock AI responses in E2E

```typescript
const aiFacade = app.getProvider(AiFacade);
vi.spyOn(aiFacade, 'generate').mockResolvedValue({
  message: { role: AiRoleEnum.Assistant, content: 'Mocked AI response' },
  actions: [],
});
```

### Wait for async domain events

```typescript
await app.eventEmitter.waitForAll();
```

### Parameterized tests

```typescript
it.for([['premium'], ['free']])(
  'given %s user, should return correct response',
  async ([planType]) => {
    const user = await app.signedInVerifiedAccount({
      premiumEntitlement: planType === 'premium',
    });
    // ...
  },
);
```

### Adding a new API helper

1. Create `test/helpers/apis/<feature>-api.ts`:

```typescript
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';

export function featureApi(user: SignedInAccount) {
  return {
    async create(dto: CreateDto): Promise<ApiResponse<ResponseDto>> {
      return await user.authenticatedRequest.post('/users/me/features').send(dto);
    },
    async getById(id: string): Promise<ApiResponse<ResponseDto>> {
      return await user.authenticatedRequest.get(`/users/me/features/${id}`);
    },
  };
}

export type FeatureAPI = ReturnType<typeof featureApi>;
```

2. Register in `test/test-app/account/signed-in-account.ts`:

```typescript
import { featureApi, FeatureAPI } from '../../helpers/apis/feature-api';

// In constructor:
this.featureAPI = featureApi(this);

// As property:
featureAPI: FeatureAPI;
```

### Fakes swapped in E2E

| Real | Fake | Purpose |
|------|------|---------|
| `AuthProvider` | `FakeAuthProvider` | Firebase auth (token = UID) |
| `AiFacade` | `AiFakeFacade` | AI calls (returns "Test response") |
| `EventEmitter` | `FakeEventEmitter` | Domain events (sync, trackable) |
| `NotificationProvider` | `FakeNotificationProvider` | Push notifications |
| `RevenueCatService` | `FakeRevenueCatService` | Payment/entitlements |

### Vitest context typing

E2E tests use custom context. Types are in `test/vite.d.ts`:

```typescript
declare module 'vitest' {
  export interface TestContext {
    app: TestApp;
  }
}
```

---

## Smoke Tests

**Location**: `smoke-tests/*.smoke-tests-spec.ts`
**Config**: `smoke-tests/vitest.config.smoke-tests.mts`
**Command**: `yarn test:smoke-tests`
**Env var**: `URL_BASE` (defaults to `http://localhost`)

### Pattern

```typescript
import { TestApp } from './TestApp';

describe('Feature smoke test', () => {
  const app = TestApp.fromEnv();

  it('endpoint returns expected response', async () => {
    const res = await app.get('health').send();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ status: 'up' });
  });
});
```

Smoke tests verify deployed API health and basic connectivity. No database setup, no mocks.

---

## Quick Reference

| Test Type | File Suffix | Location | Command |
|-----------|-------------|----------|---------|
| Unit | `.spec.ts` | Co-located in `src/` | `yarn test` |
| E2E | `.e2e-spec.ts` | `test/specs/` | `yarn test:e2e` |
| Smoke | `.smoke-tests-spec.ts` | `smoke-tests/` | `yarn test:smoke-tests` |
