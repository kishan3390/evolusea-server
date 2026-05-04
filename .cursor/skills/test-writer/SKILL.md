---
name: test-writer
description: Write unit tests and E2E tests for the Evolusea backend following project conventions. Use when asked to write tests, create spec files, add test coverage for command handlers, query handlers, mappers, services, or API endpoints.
---

# Test Writer

Write tests for the Evolusea backend using Vitest, following DDD/CQRS conventions and Arrange-Act-Assert pattern.

## Workflow

### Step 1: Read the source file

Read the file being tested. Identify:
- **Class type**: command handler, query handler, mapper, service, domain entity, interceptor
- **Constructor dependencies**: repositories, facades, services to mock
- **Public methods**: each needs at least one test
- **Code paths**: happy path, error/throw paths, edge cases, boundary conditions

### Step 2: Find a style reference

Look for existing `.spec.ts` files in the same module directory. If none exist, use the closest module's tests as reference. For detailed examples, read [reference-examples.md](reference-examples.md).

### Step 3: Write the test file

Create `<source-filename>.spec.ts` co-located with the source file.

#### File structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Import the class under test and its dependencies

describe('ClassName', () => {
  // 1. Declare handler/service and mocks
  let handler: MyCommandHandler;
  let mockRepo: { save: ReturnType<typeof vi.fn>; findById: ReturnType<typeof vi.fn> };

  // 2. Fresh instances per test
  beforeEach(() => {
    mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(null),
    };
    handler = new MyCommandHandler(mockRepo);
  });

  // 3. Nested describe per method (if multiple public methods)
  describe('execute', () => {
    it('should create entity when valid input', async () => {
      // Arrange
      const command = new MyCommand({ title: 'test' });

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'test' }),
      );
    });

    it('should throw when entity not found', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(new MyCommand({ id: 'missing' })))
        .rejects.toThrow(EntityNotFoundError);
    });
  });
});
```

### Step 4: Cover all code paths

For each class type, test these paths:

**Command handlers:**
- Happy path: entity created/updated, repository called with correct args
- Not found: throws `EntityNotFoundError`
- Business rule violation: throws `DomainRuleViolationError`
- Authorization: wrong user cannot modify another's entity
- Side effects: domain events emitted (if applicable)

**Query handlers:**
- Returns mapped data when found
- Returns null/empty when not found
- Pagination/filtering works correctly
- Transforms data correctly (dates, enums, nested objects)

**Mappers:**
- Domain-to-persistence: all fields mapped correctly
- Persistence-to-domain: all fields mapped correctly
- Nullable fields: handles null values
- Nested entities: relationships mapped (if applicable)
- Round-trip: `toPersistence(toDomain(entity))` preserves data

**Domain entities:**
- Factory methods create valid instances
- Business methods modify state correctly
- Validation rejects invalid input

**Services:**
- Pure logic correctness
- Boundary values (zero, max, empty arrays)
- Immutability (input not mutated)

## Test Conventions

### Mocking

Mock only the methods actually used by the class under test:

```typescript
// Good: only mock what's needed
const mockRepo = {
  save: vi.fn().mockResolvedValue(undefined),
  findByUserId: vi.fn().mockResolvedValue([]),
};

// Bad: importing a full mock class
```

### Test data factories

For domain entities with many fields, create a `createX` helper with sensible defaults:

```typescript
const createNote = (overrides: Partial<{ id: string; title: string; userId: string }> = {}) =>
  Note.createFromProps({
    id: overrides.id ?? 'note-1',
    title: overrides.title ?? 'Test Note',
    userId: overrides.userId ?? 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
```

### Non-deterministic values

Use matchers for values that change between runs:

```typescript
expect(mockRepo.save).toHaveBeenCalledWith(
  expect.objectContaining({
    id: expect.any(String),
    createdAt: expect.any(Date),
  }),
);
```

### Test naming

Use descriptive names that state the scenario and expected outcome:

```typescript
// Good
it('returns true when usage is below free tier budget', ...)
it('throws EntityNotFoundError when note does not exist', ...)
it('maps nullable mood field as null when not provided', ...)

// Bad
it('should work', ...)
it('test case 1', ...)
```

### Console noise

Suppress expected console output in tests that trigger warnings:

```typescript
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(vi.fn());
});
```

## E2E Tests

When asked to write E2E tests, place them in `test/specs/<module>/`.

### E2E structure

```typescript
import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';

describe('Feature E2E', () => {
  let app: TestApp;

  beforeEach((context) => {
    app = context.app;
  });

  it('given authenticated user, when creating resource, then returns CREATED', async () => {
    const user = await app.signedInVerifiedAccount();

    const res = await user.featureAPI.create({ title: 'test' });

    expect(res.status).toEqual(HttpStatus.CREATED);
    expect(res.body).toEqual(expect.objectContaining({ title: 'test' }));
  });
});
```

### E2E checklist

- [ ] Create API helper in `test/helpers/apis/` if it doesn't exist
- [ ] Register API helper in `SignedInAccount`
- [ ] Test CRUD operations (create, read, update, delete)
- [ ] Test authorization (user can only access own resources)
- [ ] Test validation (invalid input returns 400)
- [ ] Test premium vs free tier behavior (use `it.for()`)
- [ ] Mock AI responses with `vi.spyOn(aiFacade, 'generate')` if AI-dependent
- [ ] Wait for domain events with `app.eventEmitter.waitForAll()`

For detailed E2E examples, see [reference-examples.md](reference-examples.md).

## Verification

After writing tests, run them:

```bash
# Unit tests
yarn test <path-to-spec-file>

# E2E tests
yarn test:e2e <path-to-spec-file>
```

Check that all tests pass and no existing tests are broken.
