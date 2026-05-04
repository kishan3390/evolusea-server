# Test Audit — evolusea-backend

**Audit date:** 2026-02-07

## 1. Test Infrastructure

| Component | Tool | Config Location |
|-----------|------|-----------------|
| Test runner | Vitest | `vitest.config.mts` |
| Unit tests | Vitest | `src/**/*.spec.ts` |
| E2E tests | Vitest + Testcontainers | `test/**/*.e2e-spec.ts`, `test/vitest.config.e2e.mts` |
| Smoke tests | Vitest | `smoke-tests/vitest.config.smoke-tests.mts` |
| Coverage | v8 | `vitest.config.mts` (no thresholds) |
| Assertion | Vitest built-in | `expect()` |
| Mocking | `vi.fn()`, `vi.mock()` | — |
| HTTP (E2E) | Supertest | via TestApp |

## 2. Test Inventory

### Unit Tests (3 files)

| File | Module | Coverage Focus |
|------|--------|----------------|
| `src/http-app/interceptors/body-prompt-injection-sanitizer.interceptor.spec.ts` | Body prompt sanitizer | Sanitization, disable decorator |
| `src/building-blocks/application/transformers/to-boolean.transformer.spec.ts` | ToBoolean transformer | Boolean parsing |
| `src/ai/base/services/ai-helper.spec.ts` | AI helper | Helper utilities |

### E2E Tests (~30 files)

| Domain | Specs | Scope |
|--------|-------|-------|
| account | 3 | delete-account, sync-account, sync-account-entitlements |
| calendar | 2 | calendar, send-calendar-event-notifications-task |
| compass | 11 | close, config, get, list, send-message, start, quota, playground |
| note | 1 | note CRUD |
| notification | 1 | notification-push-token |
| path | 5 | complete, mark-overdue, path, restore, trigger-notifications |
| purchase | 2 | refresh-entitlements, revenue-cat-webhook |
| quote | 4 | get-by-id, get-daily-quotes, quota, list-quote-pool |
| user-profile | 1 | user-profile |
| vision-board | 1 | vision-board |
| wisdom-story | 1 | wisdom-story |
| health | 1 | health-check |

### Smoke Tests

- `smoke-tests/` — health check, OAS validation (requires `URL_BASE`)

## 3. Coverage Gaps

### Untested (High Risk)

| Layer | Modules | Rationale |
|-------|---------|------------|
| Services | TokenUsageService | Budget logic, cost calculation |
| Services | CompassConversationWindowingService | Window logic, token efficiency |
| Services | CompassOutputSafetyFilterService | Output filtering, safety |
| Services | CompassAbuseMonitorService | Abuse escalation |
| Services | CompassWelcomeCacheService | Cache behavior |
| Handlers | Most command/query handlers (incl. `GetDailyQuotesQueryHandler` — quote pool selection, mood mapping, race condition handling) | Domain logic |
| Mappers | Most mappers | Data transformation |
| Validators | DTO validation | Input validation |

### Partially Tested

| Module | What's tested | What's not |
|--------|---------------|------------|
| HTTP layer | Sanitizer interceptor | Other interceptors, guards |
| AI | ai-helper | AI facade, providers |

### Well Tested

- E2E: Full API flows, auth, DB interactions
- Body prompt sanitizer
- ToBoolean transformer

## 4. Anti-Patterns

- **Pre-commit:** Runs `lint` only, no tests — slow feedback for test failures
- **Coverage thresholds:** None — no enforcement, coverage can regress
- **Unit test count:** Only 3 unit specs for a large codebase — heavy reliance on E2E

## 5. Prioritization by Risk

| Priority | Area | Impact of Failure | Change Frequency |
|----------|------|-------------------|------------------|
| P1 | TokenUsageService | Budget bypass, cost miscalculation | Medium |
| P1 | CompassConversationWindowingService | Token overflow, context loss | Low |
| P1 | CompassOutputSafetyFilterService | Unsafe output, PII leak | High |
| P2 | DTO validation | Invalid input accepted | Medium |
| P3 | Guards (rate limit, repetition) | Abuse vectors | Low |

## 6. CI Integration

- **tests.yaml:** Unit, E2E, smoke run in Docker
- **main.yaml:** Invokes tests workflow; deploy blocked until tests pass
- **JUnit output:** `junit-unit.xml`, `junit-e2e.xml` published to GitHub Actions
