import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueIndexForImageWisdomStory1762762027917 implements MigrationInterface {
    name = 'AddUniqueIndexForImageWisdomStory1762762027917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wisdom_stories" ALTER COLUMN "image_url" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wisdom_stories" ALTER COLUMN "image_url" SET NOT NULL`);
    }

}
