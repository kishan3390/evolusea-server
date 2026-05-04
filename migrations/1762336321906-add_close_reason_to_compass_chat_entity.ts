import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCloseReasonToCompassChatEntity1762336321906 implements MigrationInterface {
    name = 'AddCloseReasonToCompassChatEntity1762336321906'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compass_chats" ADD "close_reason" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compass_chats" DROP COLUMN "close_reason"`);
    }

}
