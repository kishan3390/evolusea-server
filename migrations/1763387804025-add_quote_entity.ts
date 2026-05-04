import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuoteEntity1763387804025 implements MigrationInterface {
    name = 'AddQuoteEntity1763387804025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "quotes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "belief" character varying NOT NULL, "language" character varying NOT NULL, "content" text NOT NULL, "user_profile_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_99a0e8bcbcd8719d3a41f23c263" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0dd8c5a5898ddeaaa7750ac61e" ON "quotes" ("user_profile_id", "belief", "language", "date") `);
        await queryRunner.query(`ALTER TABLE "quotes" ADD CONSTRAINT "FK_77c1ae715a4636906f5712004da" FOREIGN KEY ("user_profile_id") REFERENCES "users_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotes" DROP CONSTRAINT "FK_77c1ae715a4636906f5712004da"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0dd8c5a5898ddeaaa7750ac61e"`);
        await queryRunner.query(`DROP TABLE "quotes"`);
    }

}
