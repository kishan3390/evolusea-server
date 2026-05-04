import { MigrationInterface, QueryRunner } from "typeorm";

export class RevertAiGenerationFromWisdomStory1767890700000 implements MigrationInterface {
    name = 'RevertAiGenerationFromWisdomStory1767890700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wisdom_story_translations" DROP COLUMN IF EXISTS "reflection_prompt"`);
        await queryRunner.query(`ALTER TABLE "wisdom_stories" DROP COLUMN IF EXISTS "themes"`);
        await queryRunner.query(`ALTER TABLE "wisdom_stories" DROP COLUMN IF EXISTS "generated_by"`);
        await queryRunner.query(`UPDATE "wisdom_stories" SET "cms_id" = 'unknown' WHERE "cms_id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "wisdom_stories" ALTER COLUMN "cms_id" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wisdom_stories" ALTER COLUMN "cms_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wisdom_stories" ADD "generated_by" character varying NOT NULL DEFAULT 'cms'`);
        await queryRunner.query(`ALTER TABLE "wisdom_stories" ADD "themes" text`);
        await queryRunner.query(`ALTER TABLE "wisdom_story_translations" ADD "reflection_prompt" text`);
    }

}
