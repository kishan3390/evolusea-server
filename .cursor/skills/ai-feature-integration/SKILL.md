---
name: ai-feature-integration
description: Add AI-powered features to the Evolusea backend by creating Handlebars prompt templates, prompt query handlers, and integrating with the AI facade. Use when the agent needs to add AI functionality, create prompts, wire up AI calls in command handlers, or integrate with OpenAI/Gemini.
---

# Add AI-Powered Feature

## Overview

All AI in this codebase flows through an abstract `AiFacade` that routes to OpenAI, Gemini, or Anthropic. Prompts are Handlebars templates compiled at runtime. Follow this workflow exactly.

## Step 1: Create the Handlebars Template

Create a `.hbs` file in `prompts/` directory.

**Conventions:**
- Use `{{variable}}` for dynamic content
- Use `{{#if var}}...{{/if}}` for conditional blocks
- Keep prompts focused — one task per template
- Write in imperative style ("Summarize this note", not "You should summarize")

**Example** (`prompts/note-summarize.hbs`):
```handlebars
# Task
Please summarize this note to at most a few sentences in the user's language.
Focus on the core idea of the description and the mood expressed.

# Note
Title: {{note.title}}
Description: {{note.description}}
{{#if note.mood}}Mood: {{note.mood}}
{{/if}}Created at: {{note.createdAt}}
Updated at: {{note.updatedAt}}
```

**Register the template** — add a new entry in the `PromptType` enum and register the template path in `FileSystemPromptRepository`.

## Step 2: Create the Prompt Query Handler

Location: `src/domain/prompt/application/queries/get-<name>-prompt/`

Create two files:
1. `get-<name>-prompt.query.ts` — the query DTO
2. `get-<name>-prompt.query-handler.ts` — the handler

**Pattern:**
```typescript
@Injectable()
export class GetMyFeaturePromptQueryHandler
  implements QueryHandler<GetMyFeaturePromptQuery, string>
{
  constructor(private readonly promptRepository: PromptRepository) {}

  handle(query: GetMyFeaturePromptQuery): string {
    const promptArgs = {
      // Map domain entities to plain objects for the template
      note: {
        title: query.data.note.getTitle(),
        description: query.data.note.getDescription(),
      },
    };

    return this.promptRepository.getPrompt(
      PromptType.MyFeature,
      promptArgs,
      query.promptOverride,
    );
  }
}
```

**Key rules:**
- Always map domain entities to plain objects — never pass domain objects directly to templates
- Support `promptOverride` for dev/testing flexibility
- Register the handler in the prompt module and expose it through `PromptFacade`

## Step 3: Call AI from Your Command Handler

Inject `AiFacade` and `PromptFacade` into your command handler. Never import provider-specific services directly.

### Simple AI Call (text generation)

```typescript
@Injectable()
export class MyCommandHandler implements CommandHandler<MyCommand> {
  constructor(
    private readonly aiFacade: AiFacade,
    private readonly promptFacade: PromptFacade,
  ) {}

  async handle(command: MyCommand): Promise<void> {
    // 1. Get compiled prompt
    const prompt = this.promptFacade.getMyFeaturePrompt({
      data: { /* template context */ },
    });

    // 2. Call AI
    const response = await this.aiFacade.generate({
      maxTokens: 150,
      messages: [
        { role: AiRoleEnum.User, content: prompt },
      ],
    });

    // 3. Use the response
    if (!response.message) {
      this.logger.error('No message returned from AI');
      return;
    }
    const content = response.message.content;
  }
}
```

### AI Call with Function Calling (tools)

```typescript
// 1. Define tools
const tools: AiGenerateParamsToolFunction[] = [
  {
    type: AiToolTypes.Function,
    function: {
      name: 'my_action',
      description: functionDescription, // from a prompt template
      parameters: {
        type: 'object',
        properties: {
          field: { type: 'string', description: '...' },
        },
        required: ['field'],
      },
    },
  },
];

// 2. Call with tools
const response = await this.aiFacade.generate({
  maxTokens: 500,
  messages: conversationMessages,
  tools,
  toolSelectionMode: AiToolSelectionModes.Auto,
});

// 3. Handle text response
if (response.message) {
  // Save or return the text
}

// 4. Handle tool calls
await Promise.all(
  response.actions.map(async (action) => {
    if (action.type === 'my_action') {
      const args = action.arguments; // parsed JSON
      // Execute the action
    }
  }),
);
```

### AI Call with Conversation History

For multi-turn conversations, pass the full message history:

```typescript
const response = await this.aiFacade.generate({
  maxTokens: 500,
  messages: [
    ...previousMessages.map((m) => ({
      role: m.getRole(),
      content: m.getContent(),
    })),
    { role: AiRoleEnum.User, content: newUserMessage },
  ],
});
```

## Step 4: Configure Provider & Model

**`AiFacade.generate()` parameters:**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `provider` | `AiProviders.Gemini` | AI provider |
| `model` | `gemini-2.5-flash` | Model name |
| `reasoning` | `AiReasoning.Low` | Reasoning depth |
| `maxTokens` | (required) | Max output tokens |
| `messages` | (required) | Conversation messages |
| `tools` | `undefined` | Function calling definitions |
| `toolSelectionMode` | `undefined` | Tool selection behavior |
| `tracking` | `undefined` | Token usage tracking |

**Provider selection guidelines:**
- **Default (Gemini `gemini-2.5-flash`)** — most tasks: summarization, utilities, simple generation
- **OpenAI `gpt-4.1-mini`** — conversational depth, nuanced multi-turn chats
- **Always specify tracking** for production features:
  ```typescript
  tracking: { userId, feature: 'my-feature-name' }
  ```

## Step 5: Testing

Use `AiFakeFacade` — automatically injected in test environment.

```typescript
// Mock a specific response
aiFakeFacade.mockGenerateResolvedValue({
  message: { role: AiRoleEnum.Assistant, content: 'Mocked summary' },
  actions: [],
});

// Mock with tool calls
aiFakeFacade.mockGenerateResolvedValue({
  message: undefined,
  actions: [{ type: 'my_action', arguments: { field: 'value' } }],
});

// Assert calls were made
expect(aiFakeFacade.generateCallCount).toBe(1);
expect(aiFakeFacade.lastGenerateCall?.messages).toHaveLength(3);

// Reset between tests
aiFakeFacade.reset();
```

## Security

- `BodyPromptMarkupSanitizerInterceptor` is applied globally — sanitizes prompt injection patterns from request bodies
- If an endpoint needs raw input (e.g., playground), decorate with `@DisableBodyPromptInjectionSanitizer()`
- Never pass unsanitized user input directly as system messages

## Key File References

| What | Where |
|------|-------|
| AI facade (abstract) | `src/ai/ai.facade.ts` |
| AI facade (implementation) | `src/ai/ai-real.facade.ts` |
| AI facade (test) | `src/ai/ai-fake.facade.ts` |
| Response types | `src/ai/base/models/ai-generate-data.ts` |
| Prompt repository | `src/domain/prompt/infrastructure/repositories/file-system-prompt.repository.ts` |
| Template service | Handlebars via `TemplateService` |
| Prompt templates | `prompts/` directory |
| Sanitizer interceptor | `src/http-app/interceptors/body-prompt-injection-sanitizer.interceptor.ts` |
| Disable sanitizer decorator | `src/http-app/decorators/disable-prompt-injection-sanitizer.decorator.ts` |

## Checklist

Before completing an AI feature, verify:

- [ ] Handlebars template created in `prompts/` with `.hbs` extension
- [ ] `PromptType` enum updated and template registered in `FileSystemPromptRepository`
- [ ] Prompt query handler created and exposed through `PromptFacade`
- [ ] Command handler injects `AiFacade` and `PromptFacade` (not provider services)
- [ ] Response handles both `message` (text) and `actions` (tool calls) as needed
- [ ] `tracking` parameter set for production features
- [ ] `maxTokens` set to an appropriate value
- [ ] Tests use `AiFakeFacade` with mocked responses
- [ ] All `{{variables}}` in the template are supplied by the query handler context
