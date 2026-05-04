# Test Guide — evolusea-backend

## Quick Start

```bash
# Run unit tests
yarn test

# Run with coverage
yarn test:cov

# Run E2E tests (requires Docker)
yarn test:e2e

# Run smoke tests
yarn test:smoke-tests
```

## Coverage

Coverage is collected for unit tests via `yarn test:cov`. Thresholds are configured in `vitest.config.mts`:

- **Statements:** 5% (baseline; increase toward 50%+ over time)
- **Branches:** 30%
- **Functions:** 30%
- **Lines:** 5%

Thresholds are enforced on the `yarn test:cov` run. Avoid lowering thresholds; add tests to meet and exceed them.

## Writing Unit Tests

1. **Co-locate** — Place `*.spec.ts` next to the source file.
2. **Arrange-Act-Assert** — Use clear structure in each test.
3. **Mock at boundaries** — Mock `AiTokenUsageRepository`, `fetch`, Firebase, etc. Do not mock domain logic.

### Example

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyService } from './my.service';

describe('MyService', () => {
  let repo: { find: ReturnType<typeof vi.fn> };
  let service: MyService;

  beforeEach(() => {
    repo = { find: vi.fn().mockResolvedValue([]) };
    service = new MyService(repo);
  });

  it('returns result when found', async () => {
    repo.find.mockResolvedValueOnce({ id: '1' });
    const result = await service.get('1');
    expect(result).toEqual({ id: '1' });
  });
});
```

## E2E Tests

E2E tests use Testcontainers to spin up a real PostgreSQL database. Ensure Docker is running before `yarn test:e2e`.

See [docs/testing.md](../testing.md) for full details on E2E setup, `createTestSuite`, and test doubles.

## Troubleshooting

- **Coverage below threshold:** Add unit tests for uncovered branches or lower thresholds temporarily.
- **E2E fails with "Cannot connect to Docker":** Start the Docker daemon.
- **Smoke tests fail:** Ensure `URL_BASE` points to a running instance.
