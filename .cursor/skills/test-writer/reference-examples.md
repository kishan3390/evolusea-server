# Test Writer — Reference Examples

Real examples from the Evolusea codebase. Read these when you need style guidance for a specific test type.

## Unit Test: Service with mocked repository

From `src/domain/ai-usage/services/token-usage.service.spec.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenUsageService, type LogTokenUsageArgs } from './token-usage.service';

describe('TokenUsageService', () => {
  let repository: { create: ReturnType<typeof vi.fn>; getDailyTotalTokens: ReturnType<typeof vi.fn> };
  let service: TokenUsageService;

  beforeEach(() => {
    repository = {
      create: vi.fn().mockResolvedValue(undefined),
      getDailyTotalTokens: vi.fn().mockResolvedValue(0),
    };
    service = new TokenUsageService(repository);
  });

  describe('hasTokenBudget', () => {
    it('returns true when usage is below free tier budget', async () => {
      repository.getDailyTotalTokens.mockResolvedValue(1_000);
      const result = await service.hasTokenBudget('user-1', 'free');
      expect(result).toBe(true);
      expect(repository.getDailyTotalTokens).toHaveBeenCalledWith('user-1', expect.any(Date));
    });

    it('returns false when usage equals or exceeds free tier budget', async () => {
      repository.getDailyTotalTokens.mockResolvedValue(5_000);
      const result = await service.hasTokenBudget('user-1', 'free');
      expect(result).toBe(false);
    });

    it('uses free tier budget for unknown tier', async () => {
      repository.getDailyTotalTokens.mockResolvedValue(5_000);
      const result = await service.hasTokenBudget('user-1', 'unknown');
      expect(result).toBe(false);
    });
  });

  describe('log', () => {
    it('calls repository.create with correct args including estimated cost', async () => {
      const args: LogTokenUsageArgs = {
        userId: 'user-1', chatId: 'chat-1', provider: 'anthropic',
        model: 'claude-sonnet-4-20250514', feature: 'compass',
        inputTokens: 100, outputTokens: 50, totalTokens: 150,
      };

      await service.log(args);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1', provider: 'anthropic',
          estimatedCostUsd: expect.any(Number),
        }),
      );
    });
  });
});
```

**Patterns**: nested `describe` blocks per method, mock only used methods, `expect.any(Date)` for non-deterministic values.

---

## Unit Test: Static helper with immutability checks

From `src/ai/base/services/ai-helper.spec.ts`:

```typescript
import { AiRoleEnum } from '../enums';
import type { AiGenerateParamsMessage } from '../models';
import { AiHelper } from './ai-helper';

describe('AiHelper.mergeSequentialMessagesWithSameRole', () => {
  test('given empty array, returns empty array', () => {
    expect(AiHelper.mergeSequentialMessagesWithSameRole([])).toEqual([]);
  });

  test('given single message, returns unchanged message as new object', () => {
    const input: AiGenerateParamsMessage[] = [
      { role: AiRoleEnum.User, content: 'Hello' },
    ];
    const output = AiHelper.mergeSequentialMessagesWithSameRole(input);
    expect(output).toHaveLength(1);
    expect(output[0]).toEqual(input[0]);     // value equal
    expect(output[0]).not.toBe(input[0]);    // not same reference
  });

  test('does not mutate the input array or its message objects', () => {
    const input = [
      { role: AiRoleEnum.User, content: 'A' },
      { role: AiRoleEnum.User, content: 'B' },
    ];
    const snapshot = JSON.parse(JSON.stringify(input));
    AiHelper.mergeSequentialMessagesWithSameRole(input);
    expect(input).toEqual(snapshot);
  });
});
```

**Patterns**: tests `it`/`test` are both acceptable, immutability verified with snapshot + reference checks.

---

## Unit Test: Service with console.warn spy

From `src/domain/compass/application/services/compass-output-safety-filter.service.spec.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompassOutputSafetyFilterService } from './compass-output-safety-filter.service';

describe('CompassOutputSafetyFilterService', () => {
  let service: CompassOutputSafetyFilterService;

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    service = new CompassOutputSafetyFilterService();
  });

  it('returns content unchanged when no issues detected', () => {
    const content = 'A thoughtful reflection on mindfulness.';
    const result = service.filter(content);
    expect(result.content).toBe(content);
    expect(result.wasFlagged).toBe(false);
    expect(result.flags).toEqual([]);
  });

  it('flags and replaces content when code blocks detected', () => {
    const content = 'Here is some text.\n```js\nconsole.log("hi");\n```\nMore text.';
    const result = service.filter(content);
    expect(result.wasFlagged).toBe(true);
    expect(result.flags).toContain('code_blocks_detected');
    expect(result.content).not.toContain('```');
  });
});
```

**Patterns**: spy on `console.warn` to suppress noise, test both positive and negative assertions.

---

## Unit Test: Interceptor with NestJS test module

From `src/http-app/interceptors/body-prompt-injection-sanitizer.interceptor.spec.ts`:

```typescript
import { Body, Controller, INestApplication, Post } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Inline test controller
@Controller('test')
class TestController {
  @Post('enabled')
  enabled(@Body() body: any) { return body; }

  @Post('disabled')
  @DisableBodyPromptInjectionSanitizer()
  disabled(@Body() body: any) { return body; }
}

describe('BodyPromptMarkupSanitizerInterceptor', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestController],
      providers: [Reflector, BodyPromptMarkupSanitizerInterceptor],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(new BodyPromptMarkupSanitizerInterceptor(app.get(Reflector)));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  it('sanitizes prompt markup in request body', async () => {
    const response = await request(app.getHttpServer())
      .post('/test/enabled')
      .send({ prompt: '<system>secret</system>' })
      .expect(201);
    expect(response.body.prompt).not.toContain('<system>');
  });
});
```

**Patterns**: inline test controller, real HTTP assertions via supertest, proper cleanup.

---

## Unit Test: Test data factory with overrides

From `src/domain/compass/application/services/compass-conversation-windowing.service.spec.ts`:

```typescript
const createMessage = (
  overrides: Partial<{
    id: string;
    compassChatId: string;
    role: AiRoleEnum;
    speaker: CompassChatSpeaker;
    content: string;
    visibility: CompassChatMessageVisibility;
    turnIndex: number;
  }> = {},
) =>
  CompassChatMessage.createFromProps({
    id: overrides.id ?? 'msg-1',
    compassChatId: overrides.compassChatId ?? 'chat-1',
    role: overrides.role ?? AiRoleEnum.User,
    speaker: overrides.speaker ?? CompassChatSpeaker.User,
    content: overrides.content ?? 'Hi',
    visibility: overrides.visibility ?? CompassChatMessageVisibility.Public,
    turnIndex: overrides.turnIndex ?? 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
```

**Pattern**: sensible defaults with `??`, spread `overrides` at the end, typed `Partial<>` parameter.

---

## E2E Test: CRUD with parameterized tier testing

From `test/specs/note/note.e2e-spec.ts` (key excerpt):

```typescript
describe('Note CRUD (e2e)', () => {
  let app: TestApp;
  let aiFacade: AiFacade;

  beforeEach((context) => {
    app = context.app;
    aiFacade = app.getProvider(AiFacade);
    app.overrideConfig({
      freeTierQuota: { dailyNotesLimit: Number.MAX_SAFE_INTEGER },
    });
  });

  it.for([['premium'], ['free']])(
    'given %s user, creating a note returns CREATED',
    async ([planType]) => {
      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: planType === 'premium',
      });

      const res = await user.noteAPI.createNote({
        title: 'My note',
        description: 'Content here',
        mood: Moods.Motivated,
        anonymousSharingEnabled: false,
      });

      expect(res.status).toEqual(HttpStatus.CREATED);
      expect(res.body).toEqual(expect.objectContaining({ title: 'My note' }));
    },
  );

  it('given note with AI summary, fetching returns summary', async () => {
    const user = await app.signedInVerifiedAccount();
    vi.spyOn(aiFacade, 'generate').mockResolvedValue({
      message: { role: AiRoleEnum.Assistant, content: 'Summary text' },
      actions: [],
    });

    const created = await user.noteAPI.createNote({ ... });
    await app.eventEmitter.waitForAll();

    const fetched = await user.noteAPI.getNote(created.body.id);
    expect(fetched.body.summary).toBe('Summary text');
  });
});
```

**Patterns**: `it.for()` for tier testing, `app.overrideConfig()` for quotas, `app.eventEmitter.waitForAll()` for domain events, `vi.spyOn(aiFacade, 'generate')` for AI mocking.

---

## E2E API Helper

From `test/helpers/apis/path-api.ts`:

```typescript
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { ApiResponse } from '../api-response';

export function pathApi(user: SignedInAccount) {
  return {
    async createPath(dto: CreatePathPayloadDto): Promise<ApiResponse<PathDto>> {
      return await user.authenticatedRequest.post('/users/me/paths').send(dto);
    },
    async getPath<T = any>(pathId: string): Promise<ApiResponse<T>> {
      return await user.authenticatedRequest.get(`/users/me/paths/${pathId}`);
    },
    async deletePath<T = any>(pathId: string): Promise<ApiResponse<T>> {
      return await user.authenticatedRequest.delete(`/users/me/paths/${pathId}`);
    },
    async listPaths(query?: ListPathsQueryDto): Promise<ApiResponse<ListPathsResponseDto>> {
      return await user.authenticatedRequest.get('/users/me/paths').query({
        ...(query ?? { page: 1, perPage: 10 }),
      });
    },
  };
}

export type PathAPI = ReturnType<typeof pathApi>;
```

**Patterns**: function returning object of methods, typed responses with `ApiResponse<T>`, default pagination, exported type alias.
