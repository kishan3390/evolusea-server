import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBeliefSystemToWisdomStoryEntity1765406787451 implements MigrationInterface {
    name = 'AddBeliefSystemToWisdomStoryEntity1765406787451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wisdom_stories" ADD "belief_system" character varying NOT NULL DEFAULT 'general'`);
        await queryRunner.query(`ALTER TABLE "vision_boards" ALTER COLUMN "paths_ids" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`ALTER TABLE "vision_boards" ALTER COLUMN "notes_ids" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`ALTER TABLE "vision_boards" ALTER COLUMN "wisdom_stories_ids" SET DEFAULT '[]'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vision_boards" ALTER COLUMN "wisdom_stories_ids" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "vision_boards" ALTER COLUMN "notes_ids" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "vision_boards" ALTER COLUMN "paths_ids" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "wisdom_stories" DROP COLUMN "belief_system"`);
    }

}
