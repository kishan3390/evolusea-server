import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompassChatMessageEntity1760369526941 implements MigrationInterface {
    name = 'AddCompassChatMessageEntity1760369526941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "compass_chats_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "compass_chat_id" uuid NOT NULL, "role" character varying NOT NULL, "content" text NOT NULL, "visibility" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_bce6ecbc91d0765aa5d4840c317" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ef8412905cf679435c50b273ac" ON "compass_chats_messages" ("compass_chat_id") `);
        await queryRunner.query(`ALTER TABLE "compass_chats_messages" ADD CONSTRAINT "FK_ef8412905cf679435c50b273acc" FOREIGN KEY ("compass_chat_id") REFERENCES "compass_chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compass_chats_messages" DROP CONSTRAINT "FK_ef8412905cf679435c50b273acc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef8412905cf679435c50b273ac"`);
        await queryRunner.query(`DROP TABLE "compass_chats_messages"`);
    }

}
