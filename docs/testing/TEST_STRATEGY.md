# Test Strategy — evolusea-backend

## Test Pyramid

```
        /\
       /  \   E2E (critical user journeys)
      /____\
     /      \  Integration (API + DB)
    /________\
   /          \  Unit (business logic, utilities, mappers)
  /____________\
```

| Tier | Scope | Database | Command |
|------|-------|----------|---------|
| Unit | Business logic, utilities, validators, mappers | Mocked | `yarn test` |
| E2E | Full HTTP request/response, real DB | Testcontainers | `yarn test:e2e` |
| Smoke | Deployed instance health | Production | `yarn test:smoke-tests` |

## Conventions

### File Naming

- Unit: `*.spec.ts` co-located with source
- E2E: `test/specs/**/*.e2e-spec.ts`

### Test Structure

- **Arrange-Act-Assert** — every test follows this structure
- **Given-When-Then** — for behavior specs and E2E

### Mocking Strategy

- **Mock at boundaries:** AI providers, Firebase, CMS, file system, time
- **Use real:** Domain logic, utilities, mappers, validators
- **E2E:** Real DB via Testcontainers; fake Firebase/auth

### Fixtures

- Test factories in `test/` for common entities
- No shared mutable state between tests

## Out of Scope

- Third-party internals (OpenAI, Anthropic, etc.)
- Framework config (NestJS, TypeORM setup)
- Getter/setter boilerplate
- Static content
- Team-tools (revenue-cat-web-app) — separate project
