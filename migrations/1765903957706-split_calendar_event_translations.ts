import { MigrationInterface, QueryRunner } from "typeorm";

export class SplitCalendarEventTranslations1765903957706 implements MigrationInterface {
    name = 'SplitCalendarEventTranslations1765903957706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ca4cbae4fcae041b654e413f74"`);
        await queryRunner.query(`ALTER TABLE "calendar_events" DROP CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c"`);
        await queryRunner.query(`ALTER TABLE "calendar_events" RENAME TO "calendar_events_old"`);
        await queryRunner.query(`CREATE TABLE "calendar_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "belief" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f7b03f15744093731c7b1ac0b3" ON "calendar_events" ("date", "belief") `);
        await queryRunner.query(`CREATE TABLE "calendar_events_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "calendar_event_id" uuid NOT NULL, "language" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_9e8ecef1c30e50671e2a2b37f7a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_74a65396a29cefdc7a99bea2cc" ON "calendar_events_translations" ("calendar_event_id", "language") `);
        await queryRunner.query(`ALTER TABLE "calendar_events_translations" ADD CONSTRAINT "FK_8f2f4e5edac2ffb5f062e30aea7" FOREIGN KEY ("calendar_event_id") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`INSERT INTO "calendar_events" ("id", "date", "belief", "created_at", "updated_at") SELECT uuid_generate_v4(), date, belief, MIN(created_at) as created_at, MAX(updated_at) as updated_at FROM "calendar_events_old" GROUP BY date, belief`);
        await queryRunner.query(`INSERT INTO "calendar_events_translations" ("id", "calendar_event_id", "language", "name", "description", "created_at", "updated_at") SELECT old.id, events.id, old.language, old.name, old.description, old.created_at, old.updated_at FROM "calendar_events_old" old JOIN "calendar_events" events ON events.date = old.date AND events.belief = old.belief`);
        await queryRunner.query(`DROP TABLE "calendar_events_old"`);


        await queryRunner.query(`ALTER TABLE "calendar_events_translations" DROP CONSTRAINT "FK_8f2f4e5edac2ffb5f062e30aea7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7b03f15744093731c7b1ac0b3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74a65396a29cefdc7a99bea2cc"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bd3bdbde55090f267a9ee74deb" ON "calendar_events" ("date", "belief") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_94522d90fa9be4e3f67d431ab6" ON "calendar_events_translations" ("calendar_event_id", "language") `);
        await queryRunner.query(`ALTER TABLE "calendar_events_translations" ADD CONSTRAINT "FK_8ea2b9b82e8c2ed0361dd66bdbf" FOREIGN KEY ("calendar_event_id") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "calendar_events_translations" DROP CONSTRAINT IF EXISTS "FK_8ea2b9b82e8c2ed0361dd66bdbf"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_94522d90fa9be4e3f67d431ab6"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bd3bdbde55090f267a9ee74deb"`);
        await queryRunner.query(`ALTER TABLE "calendar_events_translations" DROP CONSTRAINT IF EXISTS "FK_8f2f4e5edac2ffb5f062e30aea7"`);
        await queryRunner.query(`ALTER TABLE "calendar_events" DROP CONSTRAINT IF EXISTS "PK_faf5391d232322a87cdd1c6f30c"`);
        await queryRunner.query(`CREATE TABLE "calendar_events_old" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "language" character varying NOT NULL, "belief" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`INSERT INTO "calendar_events_old" ("id", "date", "name", "description", "language", "belief", "created_at", "updated_at") SELECT translations.id, events.date, translations.name, translations.description, translations.language, events.belief, translations.created_at, translations.updated_at FROM "calendar_events_translations" translations JOIN "calendar_events" events ON events.id = translations.calendar_event_id`);
        await queryRunner.query(`ALTER TABLE "calendar_events_translations" DROP CONSTRAINT IF EXISTS "FK_8f2f4e5edac2ffb5f062e30aea7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74a65396a29cefdc7a99bea2cc"`);
        await queryRunner.query(`DROP TABLE "calendar_events_translations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7b03f15744093731c7b1ac0b3"`);
        await queryRunner.query(`DROP TABLE "calendar_events"`);
        await queryRunner.query(`ALTER TABLE "calendar_events_old" RENAME TO "calendar_events"`);
        await queryRunner.query(`CREATE INDEX "IDX_ca4cbae4fcae041b654e413f74" ON "calendar_events" ("date", "belief", "language") `);
    }

}
