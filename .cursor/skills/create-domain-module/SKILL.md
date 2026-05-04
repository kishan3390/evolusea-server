---
name: create-domain-module
description: Scaffold a new DDD/CQRS domain module with all required layers (domain, infrastructure, application, facade, HTTP). Use when the agent needs to create a new domain module, add a new feature, scaffold a new bounded context, or when the user asks to add a new entity/resource to the backend.
---

# Create a New Domain Module

This skill scaffolds a complete DDD/CQRS domain module in the Evolusea backend. Every module follows a strict layered architecture. Read `src/domain/note/` as the canonical reference implementation.

## Pre-Flight

Before starting, confirm:
1. **Module name** (singular, kebab-case): e.g., `mood-checkin`
2. **Entity name** (PascalCase): e.g., `MoodCheckin`
3. **Key fields** on the domain entity (besides `id`, `createdAt`, `updatedAt`)
4. **Which operations** are needed: create, update, delete, get-by-id, list
5. **Relationships** to existing entities (e.g., belongs to `UserProfile`)
6. **Events** to emit (if side effects are needed)

## Step-by-Step Process

Follow these steps **in order**. Each step references the exact pattern from the Note module.

---

### Step 1: Create Folder Structure

```
src/domain/<module-name>/
├── application/
│   ├── commands/
│   │   └── create-<entity>/
│   │       ├── create-<entity>.command.ts
│   │       ├── create-<entity>.command-handler.ts
│   │       └── index.ts
│   ├── queries/
│   │   ├── get-<entity>/
│   │   │   ├── get-<entity>.query.ts
│   │   │   ├── get-<entity>.query-handler.ts
│   │   │   └── index.ts
│   │   └── list-<entities>/
│   │       ├── list-<entities>.query.ts
│   │       ├── list-<entities>.query-handler.ts
│   │       └── index.ts
│   ├── events/              # only if needed
│   └── index.ts
├── domain/
│   ├── enums/
│   │   └── index.ts
│   ├── repositories/
│   │   ├── <entity>.repository.ts
│   │   └── index.ts
│   ├── <entity>.ts
│   └── index.ts
├── infrastructure/
│   ├── entities/
│   │   ├── <entity>.entity.ts
│   │   └── index.ts
│   ├── mappers/
│   │   └── <entity>.mapper.ts
│   └── repositories/
│       └── postgres-<entity>.repository.ts
├── <module-name>.facade.ts
└── <module-name>.module.ts

src/http-app/<module-name>/
├── <module-name>.controller.ts
├── <module-name>-api.module.ts
└── dto/
    ├── <entity>.dto.ts
    ├── create-<entity>-payload.dto.ts
    └── index.ts
```

Create barrel `index.ts` files at each directory level to re-export symbols.

---

### Step 2: Domain Layer

**Domain entity** — extends `Entity<Props>` from `@building-blocks/domain`:

```typescript
import { Entity, EntityIdGenerator, EntityProps } from '@building-blocks/domain';

// 1. Define Props interface extending EntityProps
export interface <Entity>Props extends EntityProps {
  id: string;
  // ... entity fields
  userProfileId: string;
}

// 2. Define CreateArgs (factory input)
export interface <Entity>CreateArgs {
  // ... required fields for creation
  userProfileId: string;
  entityIdGenerator: EntityIdGenerator;
}

// 3. Entity class with private fields, constructor, static create(), getters, setters
export class <Entity> extends Entity<<Entity>Props> {
  private readonly id: string;
  // ... private fields

  constructor(props: <Entity>Props) {
    super();
    this.id = props.id;
    // ... assign all fields
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(args: <Entity>CreateArgs): <Entity> {
    const now = new Date();
    return new <Entity>({
      id: args.entityIdGenerator.generate(),
      // ... map args to props
      createdAt: now,
      updatedAt: now,
    });
  }

  // Setters call this.entityUpdated() to update the updatedAt timestamp
  // Getters expose private fields
  // getProps() returns all props for the mapper

  getId(): string { return this.id; }
  getProps(): <Entity>Props { return { /* all fields */ }; }
}
```

**Abstract repository** — defines the interface in the domain layer:

```typescript
export abstract class <Entity>Repository {
  abstract create(entity: <Entity>, tx?: Transaction): Promise<void>;
  abstract findOneBy(params: Find<Entity>ByParams): Promise<<Entity> | null>;
  abstract update(entity: <Entity>, tx?: Transaction): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract list(filters: <Entity>Filters, pagination: Pagination): Promise<PaginatedList<<Entity>>>;
}
```

Use `Transaction` from `@building-blocks/infrastructure`, `Pagination`/`PaginatedList` from `@building-blocks/application`.

---

### Step 3: Infrastructure Layer

**TypeORM entity:**

```typescript
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: '<table_name_plural_snake_case>' })
export class <Entity>Entity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Columns with appropriate types
  @Column({ type: 'varchar' })
  someField: string;

  // FK relationship to UserProfile
  @Index()
  @Column({ type: 'uuid' })
  userProfileId: string;

  @ManyToOne('UserProfileEntity', () => UserProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_profile_id', referencedColumnName: 'id' })
  user?: UserProfileEntity;

  // Always use timestamptz
  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  updatedAt: Date;
}
```

Column naming is auto-converted to `snake_case` by `SnakeNamingStrategy`.

**Mapper** — implements `Mapper<Domain, Persistence>` from `@building-blocks/infrastructure`:

```typescript
export class <Entity>Mapper implements Mapper<<Entity>, <Entity>Entity> {
  toDomain(entity: <Entity>Entity): <Entity> {
    return new <Entity>({ /* map all fields */ });
  }
  toPersistence(domain: <Entity>): <Entity>Entity {
    const props = domain.getProps();
    return { /* map all fields from props */ };
  }
}
```

**Repository implementation:**

```typescript
@Injectable()
export class Postgres<Entity>Repository implements <Entity>Repository {
  private readonly mapper = new <Entity>Mapper();

  constructor(
    @InjectRepository(<Entity>Entity)
    private readonly repository: Repository<<Entity>Entity>,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(entity: <Entity>, tx?: Transaction): Promise<void> {
    const mapped = this.mapper.toPersistence(entity);
    await this.transactionManager.execute(async (internalTx) => {
      await internalTx.getRepository(<Entity>Entity).save(mapped);
    }, tx);
  }
  // ... implement all abstract methods
}
```

---

### Step 4: Application Layer

**Command** — plain interface:

```typescript
export interface Create<Entity>Command {
  userProfileId: string;
  // ... fields needed for creation
}
```

**Command handler** — implements `CommandHandler<Command, Result>`:

```typescript
@Injectable()
export class Create<Entity>CommandHandler
  implements CommandHandler<Create<Entity>Command, <Entity>> {
  constructor(
    private readonly repository: <Entity>Repository,
    private readonly entityIdGenerator: EntityIdGenerator,
    private readonly transactionManager: TransactionManager,
  ) {}

  async handle(command: Create<Entity>Command): Promise<<Entity>> {
    const entity = <Entity>.create({ ...command, entityIdGenerator: this.entityIdGenerator });
    await this.transactionManager.execute(async (tx) => {
      await this.repository.create(entity, tx);
    });
    return entity;
  }
}
```

**Query** — plain interface:

```typescript
export interface Get<Entity>Query {
  id: string;
  userProfileId: string;
}
```

**Query handler** — implements `QueryHandler<Query, Result>`:

```typescript
@Injectable()
export class Get<Entity>QueryHandler
  implements QueryHandler<Get<Entity>Query, <Entity>> {
  constructor(private readonly repository: <Entity>Repository) {}

  async handle(query: Get<Entity>Query): Promise<<Entity> | null> {
    return this.repository.findOneBy({ id: query.id, userProfileId: query.userProfileId });
  }
}
```

**Domain events** (if needed) — extend `EventBase`:

```typescript
// event file
export class <Entity>CreatedEvent extends EventBase<<Entity>CreatedEventPayload> {}

// event handler file
@Injectable()
export class <Entity>CreatedEventHandler extends EventHandler<<Entity>CreatedEvent> {
  event = <Entity>CreatedEvent;
  constructor(eventEmitter: EventEmitter, /* handler deps */) { super(eventEmitter); }
  async handle(payload: <Entity>CreatedEventPayload): Promise<void> { /* side effect */ }
}
```

---

### Step 5: Facade

The facade is a concrete `@Injectable()` class that delegates to command/query handlers. Controllers ONLY call the facade.

```typescript
@Injectable()
export class <ModuleName>Facade {
  constructor(
    private readonly create<Entity>CommandHandler: Create<Entity>CommandHandler,
    private readonly get<Entity>QueryHandler: Get<Entity>QueryHandler,
    // ... other handlers
  ) {}

  async create<Entity>(command: Create<Entity>Command): Promise<<Entity>> {
    return this.create<Entity>CommandHandler.handle(command);
  }
  // ... delegate every operation to its handler
}
```

---

### Step 6: NestJS Module

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([<Entity>Entity]),
    // Add AiModule, PromptModule, EventEmitterModule if needed
  ],
  providers: [
    { provide: <Entity>Repository, useClass: Postgres<Entity>Repository },
    Create<Entity>CommandHandler,
    Get<Entity>QueryHandler,
    // ... all handlers
    <ModuleName>Facade,
    // ... event handlers if any
  ],
  exports: [<ModuleName>Facade],
})
export class <ModuleName>Module {}
```

---

### Step 7: HTTP Layer

**Controller** in `src/http-app/<module-name>/`:

```typescript
@Controller('users/me/<entities>')
@RequiredAuth()
export class <ModuleName>Controller {
  constructor(private readonly facade: <ModuleName>Facade) {}

  @Post()
  async create(@Body() payload: Create<Entity>PayloadDto, @CurrentUser() user: AuthUser) {
    const entity = await this.facade.create<Entity>({ ...payload, userProfileId: user.userProfileId });
    return <Entity>Dto.fromEntity(entity);
  }
  // ... other endpoints
}
```

**DTOs** — use `class-validator` decorators for request payloads, static `fromEntity()` for response mapping:

```typescript
// Request DTO
export class Create<Entity>PayloadDto {
  @IsString() @IsNotEmpty() @MaxLength(150)
  someField: string;
}

// Response DTO
export class <Entity>Dto {
  id: string;
  someField: string;
  createdAt: Date;

  static fromEntity(entity: <Entity>): <Entity>Dto {
    return { id: entity.getId(), someField: entity.getSomeField(), createdAt: entity.getCreatedAt() };
  }
}
```

**API module:**

```typescript
@Module({
  imports: [DomainModule],
  controllers: [<ModuleName>Controller],
})
export class <ModuleName>ApiModule {}
```

---

### Step 8: Registration (Two Places!)

1. **Domain module** — add to `src/domain/domain.module.ts`:
   ```typescript
   import { <ModuleName>Module } from './<module-name>/<module-name>.module';
   const modules = [ /* existing */, <ModuleName>Module ];
   ```

2. **HTTP API module** — add to `src/http-app/http-app.module.ts`:
   ```typescript
   import { <ModuleName>ApiModule } from './<module-name>/<module-name>-api.module';
   // Add to imports array
   ```

---

### Step 9: Database Migration

Generate migration after creating the TypeORM entity:

```bash
yarn run migration:autogenerate src/migrations/<TimestampOrName>
```

Then register it in `migrations/migrations.ts`:

```typescript
import { <MigrationName> } from './<migration-file>';
export const migrations = [ /* existing */, <MigrationName> ];
```

---

## Checklist Before Done

- [ ] Domain entity extends `Entity<Props>` with constructor, `create()`, getters, `getProps()`
- [ ] Abstract repository in `domain/repositories/`
- [ ] TypeORM entity with UUID PK, `timestamptz` columns, proper FK relationships
- [ ] Mapper implements `Mapper<Domain, Entity>` with `toDomain()` and `toPersistence()`
- [ ] Repository implementation uses `TransactionManager` and mapper
- [ ] Command/query handlers implement `CommandHandler`/`QueryHandler` interfaces
- [ ] Facade delegates to handlers (no business logic in facade)
- [ ] Controller only calls facade, uses DTOs with class-validator
- [ ] API module imports `DomainModule`
- [ ] Domain module registered in `src/domain/domain.module.ts`
- [ ] API module registered in `src/http-app/http-app.module.ts`
- [ ] Migration generated and registered in `migrations/migrations.ts`
- [ ] Barrel `index.ts` files export all public symbols

## Common Mistakes

- **Forgetting `domain.module.ts`** — the domain module must be added there, not just in `http-app.module.ts`
- **Using TypeORM entity in domain logic** — always use the domain entity; map via the mapper
- **Skipping the facade** — controllers must never import handlers directly
- **Missing `index.ts` barrels** — every directory needs re-exports for clean imports
- **Wrong timestamp type** — always use `timestamptz`, never `timestamp`
- **Forgetting `entityUpdated()`** — every setter on the domain entity must call `this.entityUpdated()`
- **Not registering migration** — add import + entry in `migrations/migrations.ts`
