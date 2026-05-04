import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMetadataToCompassChatMessage1767890800000 implements MigrationInterface {
    name = 'AddMetadataToCompassChatMessage1767890800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compass_chats_messages" ADD "metadata" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compass_chats_messages" DROP COLUMN "metadata"`);
    }
}
