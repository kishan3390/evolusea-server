import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompassChatSummaryEntity1761593608963 implements MigrationInterface {
    name = 'AddCompassChatSummaryEntity1761593608963'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "compass_chats_summaries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "compass_chat_id" uuid NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_e57729fc8f2db21534316afbb44" UNIQUE ("compass_chat_id"), CONSTRAINT "REL_e57729fc8f2db21534316afbb4" UNIQUE ("compass_chat_id"), CONSTRAINT "PK_cd75fe44ce80ad01f6ccd68434d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e57729fc8f2db21534316afbb4" ON "compass_chats_summaries" ("compass_chat_id") `);
        await queryRunner.query(`ALTER TABLE "compass_chats_summaries" ADD CONSTRAINT "FK_e57729fc8f2db21534316afbb44" FOREIGN KEY ("compass_chat_id") REFERENCES "compass_chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compass_chats_summaries" DROP CONSTRAINT "FK_e57729fc8f2db21534316afbb44"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e57729fc8f2db21534316afbb4"`);
        await queryRunner.query(`DROP TABLE "compass_chats_summaries"`);
    }

}
