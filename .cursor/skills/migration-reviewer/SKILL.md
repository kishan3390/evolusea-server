---
name: migration-reviewer
description: Review and validate database migrations for the Evolusea backend. Use when reviewing migration files, verifying migration correctness, checking for missing indexes or cascade rules, flagging data loss risks, or when the user asks to review schema changes before deploying.
---

# Migration Reviewer

Review database migrations for correctness, safety, and compliance with Evolusea conventions. This skill is for **reviewing** existing or generated migration files — for creating migrations, see the [database-migration](../database-migration/SKILL.md) skill.

## Workflow

### Step 1: Identify what changed

Read the TypeORM entity that triggered the migration. Compare the entity fields against the migration SQL to ensure they match.

```
Files to read:
1. The migration file(s) in `migrations/`
2. The corresponding TypeORM entity in `src/domain/<module>/infrastructure/entities/`
3. The domain entity in `src/domain/<module>/domain/`
4. The mapper in `src/domain/<module>/infrastructure/mappers/`
5. `migrations/migrations.ts` — verify registration
```

### Step 2: Run the review checklist

For each migration file, check every item below. Report findings using severity levels.

#### Schema Conventions

- [ ] Table names are `snake_case` (enforced by `SnakeNamingStrategy`)
- [ ] Primary keys use `uuid NOT NULL DEFAULT uuid_generate_v4()`
- [ ] All date/time columns use `TIMESTAMP WITH TIME ZONE` (never bare `TIMESTAMP`)
- [ ] Column types match the TypeORM entity decorators (`varchar`, `text`, `int`, `boolean`, `jsonb`, etc.)
- [ ] Nullable columns in SQL match `nullable: true` on the entity decorator

#### Foreign Keys & Relationships

- [ ] Every FK column has a named constraint: `"FK_<table>_<referenced_table>"`
- [ ] `ON DELETE` behavior is explicit (`CASCADE`, `SET NULL`, `RESTRICT`) — never omitted
- [ ] Every FK column has an index: `"IDX_<table>_<column>"`
- [ ] FK references the correct target table and column

#### Indexes

- [ ] FK columns are indexed (see above)
- [ ] Composite indexes exist for common query patterns (e.g., `user_profile_id + created_at DESC`)
- [ ] Unique constraints exist where business rules require uniqueness
- [ ] Index names follow convention: `"IDX_<table>_<descriptive_suffix>"`
- [ ] No duplicate indexes (same columns, same order)

#### Reversibility

- [ ] `down()` fully reverses `up()` — every statement in `up()` has a corresponding undo
- [ ] `down()` drops items in reverse order of `up()` (indexes before tables, constraints before indexes)
- [ ] If `up()` drops `NOT NULL`, `down()` backfills before re-adding `NOT NULL`
- [ ] If `up()` drops a table or column, `down()` recreates it with the exact original schema
- [ ] Seed data migrations: `down()` deletes only the seeded rows (use deterministic IDs or a WHERE clause)

#### Data Safety

- [ ] No `DROP TABLE` or `DROP COLUMN` on tables with production data unless explicitly intended
- [ ] Column type changes don't silently truncate data (e.g., `text` → `varchar(50)`)
- [ ] `NOT NULL` additions include a `DEFAULT` or a backfill `UPDATE` before the constraint
- [ ] `ALTER COLUMN SET NOT NULL` is preceded by a check/backfill for existing NULL rows
- [ ] No destructive operations without a data preservation strategy

#### Naming & Structure

- [ ] Class name matches pattern: `PascalCaseDescription<Timestamp>` (e.g., `AddMoodCheckinEntity1768000000000`)
- [ ] `name` property matches the class name exactly
- [ ] File name matches pattern: `<timestamp>-<snake_case_description>.ts`
- [ ] Import and array entry added to `migrations/migrations.ts`
- [ ] Migration is appended at the **end** of the migrations array (never inserted in the middle)

#### Cross-Layer Consistency

- [ ] TypeORM entity columns match the migration SQL columns
- [ ] Domain entity has corresponding fields for all new columns
- [ ] Mapper handles new fields in both `toDomain()` and `toPersistence()`
- [ ] Request/response DTOs updated if the column is API-exposed
- [ ] Prompt templates updated if the field is injected into AI prompts

### Step 3: Report findings

Use this format:

```
## Migration Review: <migration-file-name>

### CRITICAL (must fix)
- [description of issue and how to fix it]

### WARNING (should fix)
- [description of concern]

### INFO
- [observations, suggestions]

### Passed
- [list of checks that passed cleanly]
```

Severity definitions:

| Level | Meaning |
|-------|---------|
| **CRITICAL** | Will cause runtime errors, data loss, or irreversible damage. Must fix. |
| **WARNING** | Won't break immediately but violates conventions or creates future risk. |
| **INFO** | Suggestions for improvement, not blocking. |

## Common Issues to Flag

### Missing FK index

```sql
-- BAD: FK without index (slow JOINs and CASCADE deletes)
CONSTRAINT "FK_mood_checkins_user_profile" FOREIGN KEY ("user_profile_id")
  REFERENCES "user_profiles"("id") ON DELETE CASCADE

-- GOOD: FK + index
CREATE INDEX "IDX_mood_checkins_user_profile_id" ON "mood_checkins" ("user_profile_id")
```

### Implicit ON DELETE (defaults to RESTRICT)

```sql
-- BAD: omitted ON DELETE — defaults to RESTRICT, blocking parent deletes
FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id")

-- GOOD: explicit behavior
FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE
```

### Bare TIMESTAMP

```sql
-- BAD: no timezone — ambiguous across deployments
"created_at" TIMESTAMP NOT NULL DEFAULT now()

-- GOOD: timezone-aware
"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
```

### Incomplete down()

```sql
-- BAD: up() adds column + index, down() only drops column
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE "notes" ADD COLUMN "mood" varchar`);
  await queryRunner.query(`CREATE INDEX "IDX_notes_mood" ON "notes" ("mood")`);
}
public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "mood"`);
  // Missing: DROP INDEX "IDX_notes_mood"
}
```

### NOT NULL without backfill

```sql
-- BAD: existing rows with NULL will cause the migration to fail
ALTER TABLE "notes" ALTER COLUMN "mood" SET NOT NULL

-- GOOD: backfill first
UPDATE "notes" SET "mood" = 'calm' WHERE "mood" IS NULL;
ALTER TABLE "notes" ALTER COLUMN "mood" SET NOT NULL;
```

### Unregistered migration

If the migration file exists but is not imported and added to the array in `migrations/migrations.ts`, flag as **CRITICAL** — it will silently not run.

## Generating Migrations

When asked to generate (not just review) a migration:

1. Read the TypeORM entity changes to determine what SQL is needed
2. Write the migration file manually with raw SQL (preferred for control) or suggest the auto-generate command:
   ```bash
   yarn run migration:autogenerate src/migrations/<DescriptiveName>
   ```
3. **Self-review**: run through the full checklist above on the generated file
4. Register in `migrations/migrations.ts`
5. Report the review findings

## Key File References

| What | Where |
|------|-------|
| Migration registry | `migrations/migrations.ts` |
| Migration files | `migrations/` directory |
| TypeORM entities | `src/domain/<module>/infrastructure/entities/` |
| Domain entities | `src/domain/<module>/domain/` |
| Mappers | `src/domain/<module>/infrastructure/mappers/` |
| ORM config | `ormconfig.ts` |
