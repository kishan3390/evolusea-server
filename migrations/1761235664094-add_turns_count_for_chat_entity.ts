import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTurnsCountForChatEntity1761235664094 implements MigrationInterface {
    name = 'AddTurnsCountForChatEntity1761235664094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compass_chats" ADD "turns_count" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compass_chats" DROP COLUMN "turns_count"`);
    }

}
