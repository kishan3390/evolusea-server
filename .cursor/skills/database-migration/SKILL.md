---
name: database-migration
description: Create and manage TypeORM database migrations for the Evolusea backend. Use when modifying database schema, adding columns, creating tables, changing entity relationships, or when the agent needs to generate, register, or run migrations.
---

# Database Migrations

This skill handles all database schema changes in the Evolusea backend. Every schema change requires a migration — **never** use `synchronize: true`.

## Workflow

### Step 1: Modify the TypeORM Entity

Edit the entity file in `src/domain/<module>/infrastructure/entities/<entity>.entity.ts`.

**Column rules:**
- UUID for all primary keys: `@PrimaryGeneratedColumn('uuid')`
- `TIMESTAMPTZ` for all date/time columns: `@Column({ type: 'timestamptz' })`
- Column names auto-convert to `snake_case` via `SnakeNamingStrategy` — use `camelCase` in TypeScript
- Add `@Index()` on foreign key columns and frequently queried fields
- Set `onDelete: 'CASCADE'` explicitly on FK relationships

### Step 2: Update the Domain Entity + Mapper

Any column change in the TypeORM entity must also be reflected in:
1. **Domain entity** (`domain/<entity>.ts`) — add/remove fields, getters, setters, `getProps()`
2. **Mapper** (`infrastructure/mappers/<entity>.mapper.ts`) — update `toDomain()` and `toPersistence()`

### Step 3: Choose Migration Strategy

**Auto-generate** (preferred for schema changes detected by TypeORM):

```bash
# Local
yarn run migration:autogenerate src/migrations/<DescriptiveName>

# Docker
docker compose exec workspace yarn run migration:autogenerate src/migrations/<DescriptiveName>
```

**Manual create** (for data migrations, seed data, or complex multi-step changes):

```bash
# Local
yarn run migration:create src/migrations/<DescriptiveName>

# Docker
docker compose exec workspace yarn run migration:create src/migrations/<DescriptiveName>
```

### Step 4: Verify the Generated SQL

Always review the generated migration file in `migrations/`. Check that:
- The SQL matches your intent (auto-generate can produce unexpected diffs)
- `up()` applies the change correctly
- `down()` fully reverts the change (including data restoration if needed)
- No unrelated changes were picked up (stale entity diffs)

### Step 5: Register the Migration

Add the import and entry in `migrations/migrations.ts`:

```typescript
import { MyMigrationName } from './1768XXXXXXXXX-my_migration_name';

export const migrations = [
  // ... existing migrations (keep order)
  MyMigrationName,
];
```

Migrations execute in array order. Always append new migrations at the end.

### Step 6: Run the Migration

```bash
# Local
yarn run migration:up

# Docker
docker compose exec workspace yarn run migration:up

# Revert if something went wrong
yarn run migration:down
```

## Migration File Conventions

### Naming

Files follow the pattern: `<timestamp>-<descriptive_snake_case_name>.ts`

| Change Type | Name Example |
|-------------|-------------|
| New table | `1768000000000-add_mood_checkin_entity.ts` |
| New column | `1768000100000-add_mood_to_note_entity.ts` |
| Make nullable | `1768000200000-make_note_mood_nullable.ts` |
| Add index | `1768000300000-add_index_for_note_user.ts` |
| Seed data | `1768000400000-seed_quote_pool.ts` |
| Drop column | `1768000500000-remove_legacy_field_from_note.ts` |

The class name uses `PascalCase` matching the file: `AddMoodCheckinEntity1768000000000`.

### Structure

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMoodCheckinEntity1768000000000 implements MigrationInterface {
  name = 'AddMoodCheckinEntity1768000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "mood_checkins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "mood" character varying NOT NULL,
        "user_profile_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_mood_checkins" PRIMARY KEY ("id"),
        CONSTRAINT "FK_mood_checkins_user_profile" FOREIGN KEY ("user_profile_id")
          REFERENCES "user_profiles"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "mood_checkins"`);
  }
}
```

### Writing `down()` Correctly

The `down()` method must fully reverse the `up()`:

| `up()` action | `down()` must |
|--------------|---------------|
| `CREATE TABLE` | `DROP TABLE` |
| `ALTER TABLE ADD COLUMN` | `ALTER TABLE DROP COLUMN` |
| `ALTER COLUMN SET NOT NULL` | Backfill NULLs, then `SET NOT NULL` |
| `ALTER COLUMN DROP NOT NULL` | `ALTER COLUMN SET NOT NULL` (backfill first if needed) |
| `CREATE INDEX` | `DROP INDEX` |
| `INSERT` (seed data) | `DELETE` the seeded rows |

**Backfill example** (making a column NOT NULL again):

```typescript
public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`UPDATE "notes" SET "mood" = 'calm' WHERE "mood" IS NULL`);
  await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "mood" SET NOT NULL`);
}
```

## Common Scenarios

### Adding a Column to an Existing Table

1. Add column to TypeORM entity with `@Column()`
2. Update domain entity (field, getter, setter, `getProps()`, `create()` args if needed)
3. Update mapper (`toDomain`, `toPersistence`)
4. Auto-generate migration
5. Update DTOs (request + response) if the column is API-exposed
6. Register migration in `migrations/migrations.ts`

### Making a Column Nullable

1. Change TypeORM entity: `@Column({ type: 'varchar', nullable: true })`
2. Update domain entity to accept `null` in the type
3. Update mapper to handle `null`
4. Auto-generate or write manual migration
5. Register migration

### Adding a Foreign Key Relationship

1. Add the FK column + relationship decorators to TypeORM entity
2. Add `@Index()` on the FK column
3. Set `onDelete` behavior explicitly (`CASCADE`, `SET NULL`, etc.)
4. Auto-generate migration
5. Register migration

### Creating a New Table

Follow the [create-domain-module](../create-domain-module/SKILL.md) skill for the full module scaffold, then generate the migration.

## Rules

- **NEVER** use `synchronize: true` — always create explicit migrations
- **NEVER** modify an already-deployed migration — create a new one instead
- All column names auto-convert to `snake_case` via `SnakeNamingStrategy`
- Use `uuid` for all primary keys
- Use `TIMESTAMPTZ` (or `TIMESTAMP WITH TIME ZONE`) for all date/time columns
- Add cascade delete rules explicitly in entity relationships
- Always verify the generated SQL before running
- Always implement both `up()` and `down()` methods
- Append new migrations at the end of the `migrations` array — never reorder
- After migration, verify the impact chain: TypeORM entity -> mapper -> domain entity -> DTOs

## Checklist

Before completing a migration task, verify:

- [ ] TypeORM entity updated in `infrastructure/entities/`
- [ ] Domain entity updated with matching field changes
- [ ] Mapper updated in both directions (`toDomain`, `toPersistence`)
- [ ] Migration generated (auto or manual)
- [ ] Generated SQL reviewed and correct
- [ ] `down()` fully reverts the `up()`
- [ ] Migration registered in `migrations/migrations.ts`
- [ ] DTOs updated if the change is API-exposed
- [ ] No unrelated schema diffs in the generated migration

## Key File References

| What | Where |
|------|-------|
| Migration registry | `migrations/migrations.ts` |
| Migration files | `migrations/` directory |
| ORM config | `ormconfig.ts` |
| Naming strategy | `SnakeNamingStrategy` (auto snake_case) |
| Migration commands | `package.json` scripts section |
