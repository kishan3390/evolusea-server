import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNoteSummaryEntity1762099898527 implements MigrationInterface {
    name = 'AddNoteSummaryEntity1762099898527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notes_summaries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "note_id" uuid NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_8464ed4c7abef4885cd67ba0a0d" UNIQUE ("note_id"), CONSTRAINT "REL_8464ed4c7abef4885cd67ba0a0" UNIQUE ("note_id"), CONSTRAINT "PK_17390f84b96389a491132e3affb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8464ed4c7abef4885cd67ba0a0" ON "notes_summaries" ("note_id") `);
        await queryRunner.query(`ALTER TABLE "notes_summaries" ADD CONSTRAINT "FK_8464ed4c7abef4885cd67ba0a0d" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes_summaries" DROP CONSTRAINT "FK_8464ed4c7abef4885cd67ba0a0d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8464ed4c7abef4885cd67ba0a0"`);
        await queryRunner.query(`DROP TABLE "notes_summaries"`);
    }

}
