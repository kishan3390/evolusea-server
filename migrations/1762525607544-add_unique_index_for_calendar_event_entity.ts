import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueIndexForCalendarEventEntity1762525607544 implements MigrationInterface {
    name = 'AddUniqueIndexForCalendarEventEntity1762525607544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ca4cbae4fcae041b654e413f74"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ca4cbae4fcae041b654e413f74" ON "calendar_events" ("date", "belief", "language") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ca4cbae4fcae041b654e413f74"`);
        await queryRunner.query(`CREATE INDEX "IDX_ca4cbae4fcae041b654e413f74" ON "calendar_events" ("date", "language", "belief") `);
    }

}
