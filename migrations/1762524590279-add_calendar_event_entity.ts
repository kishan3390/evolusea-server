import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCalendarEventEntity1762524590279 implements MigrationInterface {
    name = 'AddCalendarEventEntity1762524590279'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "calendar_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "language" character varying NOT NULL, "belief" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ca4cbae4fcae041b654e413f74" ON "calendar_events" ("date", "belief", "language") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ca4cbae4fcae041b654e413f74"`);
        await queryRunner.query(`DROP TABLE "calendar_events"`);
    }

}
