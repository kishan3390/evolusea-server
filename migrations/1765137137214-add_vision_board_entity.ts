import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVisionBoardEntity1765137137214 implements MigrationInterface {
    name = 'AddVisionBoardEntity1765137137214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vision_boards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_profile_id" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "paths_ids" jsonb NOT NULL DEFAULT '[]'::jsonb, "notes_ids" jsonb NOT NULL DEFAULT '[]'::jsonb, "wisdom_stories_ids" jsonb NOT NULL DEFAULT '[]'::jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_fa29985422c766c4b0789656c4b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_779babf6c5c374cec0f901077f" ON "vision_boards" ("user_profile_id") `);
        await queryRunner.query(`ALTER TABLE "vision_boards" ADD CONSTRAINT "FK_779babf6c5c374cec0f901077f9" FOREIGN KEY ("user_profile_id") REFERENCES "users_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vision_boards" DROP CONSTRAINT "FK_779babf6c5c374cec0f901077f9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_779babf6c5c374cec0f901077f"`);
        await queryRunner.query(`DROP TABLE "vision_boards"`);
    }

}
