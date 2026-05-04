import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSpeakerColumnForChatMessage1761116329787 implements MigrationInterface {
    name = 'AddSpeakerColumnForChatMessage1761116329787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ef8412905cf679435c50b273ac"`);
        await queryRunner.query(`ALTER TABLE "compass_chats_messages" ADD "speaker" character varying`);
        await queryRunner.query(`UPDATE "compass_chats_messages" SET "speaker" = 'system' WHERE "speaker" IS NULL`);
        await queryRunner.query(`ALTER TABLE "compass_chats_messages" ALTER COLUMN "speaker" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "compass_chats" ALTER COLUMN "active_speaker" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_943fdb1994a3be5e80048a83f6" ON "compass_chats_messages" ("compass_chat_id", "visibility") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_943fdb1994a3be5e80048a83f6"`);
        await queryRunner.query(`ALTER TABLE "compass_chats" ALTER COLUMN "active_speaker" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "compass_chats_messages" DROP COLUMN "speaker"`);
        await queryRunner.query(`CREATE INDEX "IDX_ef8412905cf679435c50b273ac" ON "compass_chats_messages" ("compass_chat_id") `);
    }

}
