import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWisdomStoryMood1763131925862 implements MigrationInterface {
    name = 'AddWisdomStoryMood1763131925862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wisdom_stories" ADD "mood" character varying DEFAULT 'calm'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wisdom_stories" DROP COLUMN "mood"`);
    }

}
