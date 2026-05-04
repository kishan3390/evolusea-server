# Coverage Report — evolusea-backend

Generated as part of the Testing & QA implementation. Run `yarn test:cov` to regenerate.

## Summary

| Metric | Coverage | Threshold |
|--------|----------|-----------|
| Statements | 5.41% | 5% |
| Branches | 36.41% | 30% |
| Functions | 30.02% | 30% |
| Lines | 5.41% | 5% |

## Test Counts

- **Unit tests:** 46 (6 spec files)
- **E2E tests:** ~30 spec files (run via `yarn test:e2e`)
- **Smoke tests:** Health + OAS validation (run via `yarn test:smoke-tests`)

## Coverage Gaps

Per [TEST_AUDIT.md](./TEST_AUDIT.md):

- **Untested:** Most domain services (compass, note, wisdom-story, ai-usage beyond TokenUsageService), command/query handlers, mappers, validators. The new `GetDailyQuotesQueryHandler` (quote pool selection and caching) has no unit tests.
- **Partially tested:** HTTP layer (sanitizer only), AI (helper only)
- **Well tested:** E2E covers full API flows; TokenUsageService, CompassConversationWindowingService, CompassOutputSafetyFilterService now have unit tests

## Recommendations

1. Increase coverage thresholds toward 50% over time.
2. Add unit tests for high-risk handlers and mappers.
3. Exclude migrations, config, and third-party code from coverage if desired.
