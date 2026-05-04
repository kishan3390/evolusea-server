---
name: pattern-enforcer
description: Verify that new or modified code follows Evolusea's DDD/CQRS architectural patterns and conventions. Use when reviewing code changes, after scaffolding a new module, before committing, or when the user asks to check architectural compliance.
---

# Pattern Enforcer

Verify new or modified code follows Evolusea's architectural patterns. Flag every violation with file path and line number.

## When to Run

- After scaffolding a new domain module
- After modifying existing domain/infrastructure/HTTP code
- When the user asks to "check patterns", "verify architecture", or "review code"
- Before committing changes that touch domain modules

## Workflow

### Step 1: Identify changed files

Determine which files to check:
- If reviewing recent changes: run `git diff --name-only` and `git diff --cached --name-only`
- If reviewing a module: list all files under `src/domain/<module>/` and `src/http-app/<module>/`
- If reviewing specific files: use the provided file list

### Step 2: Classify files by layer

Group each file into its layer based on path:

| Path pattern | Layer |
|---|---|
| `src/http-app/**/*.controller.ts` | Controller |
| `src/http-app/**/dto/*.dto.ts` | DTO |
| `src/http-app/**/*-api.module.ts` | API Module |
| `src/domain/**/domain/*.ts` (not enums/) | Domain Entity |
| `src/domain/**/domain/repositories/*.ts` | Abstract Repository |
| `src/domain/**/infrastructure/entities/*.entity.ts` | TypeORM Entity |
| `src/domain/**/infrastructure/mappers/*.mapper.ts` | Mapper |
| `src/domain/**/infrastructure/repositories/*.ts` | Repository Impl |
| `src/domain/**/application/commands/**/*.command-handler.ts` | Command Handler |
| `src/domain/**/application/queries/**/*.query-handler.ts` | Query Handler |
| `src/domain/**/*.facade.ts` | Facade (abstract) |
| `src/domain/**/*-real.facade.ts` | Facade (real) |
| `src/domain/**/*.module.ts` | Domain Module |

### Step 3: Run the checklist

For each file, apply the checks relevant to its layer. Read the file contents before checking.

---

## Enforcement Rules

### Rule 1: Controllers only call facades

**Applies to:** `src/http-app/**/*.controller.ts`

**Check:** Constructor dependencies must only include facades and NestJS utilities (guards, pipes, interceptors). No direct imports of command handlers, query handlers, repositories, or domain services.

**How to verify:**
1. Read the controller file
2. Check all `import` statements — reject any import from `application/commands/`, `application/queries/`, `infrastructure/repositories/`, or `domain/repositories/`
3. Check constructor parameters — every domain dependency must be a facade (class name ending in `Facade`)

```
// VALID
import { NoteFacade } from '@domain/note/note.facade';
constructor(private readonly noteFacade: NoteFacade) {}

// VIOLATION
import { CreateNoteCommandHandler } from '@domain/note/application/commands/create-note';
constructor(private readonly handler: CreateNoteCommandHandler) {}
```

---

### Rule 2: Domain entities extend Entity from building-blocks

**Applies to:** `src/domain/**/domain/<entity>.ts` (main entity files, not enums or repositories)

**Check:**
1. Class extends `Entity<SomeProps>` where `SomeProps extends EntityProps`
2. Has a `constructor(props: SomeProps)` that calls `super()`
3. Implements `getId(): string` method
4. Implements `getProps(): SomeProps` method
5. Has a static factory `create(args)` method
6. Setters call `this.entityUpdated()` to update the `updatedAt` timestamp

**How to verify:**
1. Search for `extends Entity<` — must be present
2. Search for `EntityProps` in the Props interface
3. Search for `getId()` and `getProps()` method definitions
4. Search for `super()` call in constructor
5. For any setter method, verify it contains `this.entityUpdated()`

---

### Rule 3: TypeORM entities in infrastructure/entities/ only

**Applies to:** All files with `@Entity()` decorator from TypeORM

**Check:** Files containing `@Entity(` (TypeORM decorator) must reside in `src/domain/<module>/infrastructure/entities/`. No TypeORM entity decorators in domain layer, application layer, or HTTP layer.

**How to verify:**
1. Search changed files for `@Entity(` import from `typeorm`
2. Verify the file path matches `**/infrastructure/entities/*.entity.ts`
3. Flag any TypeORM entity file outside `infrastructure/entities/`

---

### Rule 4: Mappers exist between domain and TypeORM entities

**Applies to:** Every domain module that has both a domain entity and a TypeORM entity

**Check:**
1. A mapper file exists at `src/domain/<module>/infrastructure/mappers/<entity>.mapper.ts`
2. Mapper class implements `Mapper<DomainEntity, TypeORMEntity>` from `@building-blocks/infrastructure`
3. Mapper has both `toDomain(entity)` and `toPersistence(domain)` methods
4. `toPersistence` calls `domain.getProps()` to extract data
5. `toDomain` constructs domain entity via `new DomainEntity({...})`
6. Every field on the TypeORM entity is mapped in both directions

**How to verify:**
1. For each TypeORM entity file found, check for a corresponding mapper
2. Read the mapper and verify `toDomain` and `toPersistence` exist
3. Compare field lists between TypeORM entity columns and mapper field mappings

---

### Rule 5: Business rules use checkRule/checkAsyncRule

**Applies to:** `src/domain/**/domain/*.ts` (domain entities and related domain files)

**Check:** Business validations in domain entities must use `this.checkRule(new SomeRule(...))` or `await this.checkAsyncRule(new SomeRule(...))` (or static versions). Direct `throw` of `DomainRuleViolationError` without a business rule class is a violation.

**How to verify:**
1. Search for `DomainRuleViolationError` — it should only appear in business rule classes, never thrown directly in entities or handlers
2. Search for `checkRule(` or `checkAsyncRule(` — verify each call passes a rule class instance
3. Any `if (...) throw new DomainRuleViolationError(...)` outside a business rule class is a violation

---

### Rule 6: Facade has matching implementation

**Applies to:** `src/domain/**/*.facade.ts`

**Check:** Two valid patterns exist:

**Pattern A — Abstract + Real:**
- Abstract facade: `<module>.facade.ts` with `abstract class <Module>Facade`
- Real facade: `<module>-real.facade.ts` with class extending or implementing the abstract
- Module registers: `{ provide: <Module>Facade, useClass: <Module>RealFacade }`

**Pattern B — Concrete facade:**
- Single `<module>.facade.ts` with `@Injectable()` class (no abstract)
- Module registers the facade class directly as a provider

**How to verify:**
1. If facade file contains `abstract class` → search for a corresponding `*-real.facade.ts` in the same module
2. Read the real facade — every abstract method must have an implementation
3. Check the module file — verify facade is registered in `providers` and `exports`
4. Real facade constructor should inject command/query handlers

---

### Rule 7: Module registered in http-app.module.ts

**Applies to:** Any new `*-api.module.ts` in `src/http-app/`

**Check:**
1. The API module is imported in `src/http-app/http-app.module.ts`
2. The domain module is imported in `src/domain/domain.module.ts` (if it exists there)
3. The API module's `imports` array includes the domain module (directly or via `DomainModule`)

**How to verify:**
1. Read `src/http-app/http-app.module.ts` — search for the API module class name in `imports`
2. Read `src/domain/domain.module.ts` — search for the domain module class name
3. If either is missing, flag as **CRITICAL** — the module will silently not load

---

### Rule 8: DTOs use class-validator decorators

**Applies to:** `src/http-app/**/dto/*-payload.dto.ts` (request DTOs)

**Check:**
1. Every property on a request DTO has at least one `class-validator` decorator
2. String fields have `@IsString()` and typically `@MaxLength()`
3. Optional fields have `@IsOptional()`
4. Enum fields have `@IsEnum(EnumType)`
5. UUID fields have `@IsUUID()`
6. Boolean fields have `@IsBoolean()`
7. Nested objects have `@ValidateNested()` and `@Type(() => NestedDto)` from `class-transformer`

**How to verify:**
1. Read the DTO file
2. For each declared property, check for decorator presence
3. A property with zero decorators is a **CRITICAL** violation — unvalidated input reaches handlers

**Response DTOs** (`**/dto/<entity>.dto.ts`) must have a `static fromEntity(entity)` method.

---

### Rule 9: AI calls go through AiFacade

**Applies to:** All files in `src/domain/`

**Check:** No direct imports of `OpenAiService`, `GeminiService`, or `AnthropicService` in domain or application layers. AI calls must go through the abstract `AiFacade`.

**How to verify:**
1. Search changed files for imports of `OpenAiService`, `GeminiService`, `AnthropicService`
2. Only `src/ai/ai-real.facade.ts` may import provider services
3. Domain/application files should only import `AiFacade` from `@ai` or `src/ai`

---

### Rule 10: File naming follows kebab-case

**Applies to:** All `.ts` files in `src/`

**Check:**
1. File names use `kebab-case` (lowercase letters, numbers, hyphens only)
2. No `camelCase` or `PascalCase` in file names
3. Suffixes follow conventions:

| File type | Required suffix |
|---|---|
| Command | `.command.ts` |
| Command handler | `.command-handler.ts` |
| Query | `.query.ts` |
| Query handler | `.query-handler.ts` |
| TypeORM entity | `.entity.ts` |
| Mapper | `.mapper.ts` |
| Facade (abstract) | `.facade.ts` |
| Facade (real) | `-real.facade.ts` |
| Domain module | `.module.ts` |
| API module | `-api.module.ts` |
| Controller | `.controller.ts` |
| Request DTO | `-payload.dto.ts` |
| Response DTO | `.dto.ts` |
| Unit test | `.spec.ts` |
| Event handler | `.event-handler.ts` |
| Business rule | `.rule.ts` |
| Cron task | `.task.ts` |

**How to verify:**
1. List all changed/new file names
2. Check each against the regex: `/^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9-]+)*\.ts$/`
3. Verify the suffix matches the file's content type

---

## Step 4: Report findings

Present results grouped by severity:

```
## Pattern Enforcement Report

### CRITICAL (must fix before merge)
- **Rule 1 violation** — `src/http-app/note/note.controller.ts:5`
  Controller imports `CreateNoteCommandHandler` directly. Must use `NoteFacade` instead.

### WARNING (should fix)
- **Rule 10 violation** — `src/domain/note/domain/MyNewRule.ts`
  File name uses PascalCase. Rename to `my-new-rule.ts`.

### PASSED
- Rule 2: Domain entities extend Entity ✓
- Rule 3: TypeORM entities in infrastructure/entities/ ✓
- Rule 4: Mappers exist and cover all fields ✓
- Rule 5: Business rules use checkRule() ✓
- Rule 7: Module registered in http-app.module.ts ✓
- Rule 8: DTOs use class-validator decorators ✓
- Rule 9: AI calls through AiFacade ✓
```

### Severity Definitions

| Level | Meaning |
|---|---|
| **CRITICAL** | Breaks architecture. Runtime errors, security gaps, or silent failures. Must fix. |
| **WARNING** | Violates conventions. Won't break immediately but creates tech debt. |
| **INFO** | Suggestion for improvement. Not blocking. |

---

## Quick-Check Commands

Use these search patterns to spot violations quickly:

```bash
# Rule 1: Controllers importing handlers directly
rg "from.*application/(commands|queries)" src/http-app/

# Rule 3: TypeORM @Entity outside infrastructure/entities
rg "@Entity\(" src/domain/ --glob "!**/infrastructure/entities/*"

# Rule 5: Direct DomainRuleViolationError throw in entities
rg "throw new DomainRuleViolationError" src/domain/**/domain/ --glob "!**/*.rule.ts"

# Rule 9: Direct AI provider imports in domain layer
rg "from.*(openai|gemini|anthropic)\.service" src/domain/

# Rule 10: Non-kebab-case files
# List all .ts files and look for uppercase letters in filenames
```

## Cross-Module Checks

When a domain module is being reviewed, also verify:

1. **Barrel exports** — every directory has an `index.ts` re-exporting public symbols
2. **No circular imports** — domain layer never imports from infrastructure or application
3. **Repository pattern** — abstract in `domain/repositories/`, implementation in `infrastructure/repositories/`
4. **Transaction usage** — command handlers that write data use `TransactionManager`
5. **Prompt templates** — if the entity is used in AI prompts, verify Handlebars variables match the data context
