import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNoteEntity1759330397184 implements MigrationInterface {
    name = 'AddNoteEntity1759330397184'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "mood" character varying NOT NULL, "user_profile_id" uuid NOT NULL, "anonymous_sharing_enabled" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_612e4fdef6ae31eff5beaf666c" ON "notes" ("user_profile_id") `);
        await queryRunner.query(`ALTER TABLE "notes" ADD CONSTRAINT "FK_612e4fdef6ae31eff5beaf666c2" FOREIGN KEY ("user_profile_id") REFERENCES "users_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" DROP CONSTRAINT "FK_612e4fdef6ae31eff5beaf666c2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_612e4fdef6ae31eff5beaf666c"`);
        await queryRunner.query(`DROP TABLE "notes"`);
    }

}
