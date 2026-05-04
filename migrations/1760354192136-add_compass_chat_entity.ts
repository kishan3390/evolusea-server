import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompassChatEntity1760354192136 implements MigrationInterface {
    name = 'AddCompassChatEntity1760354192136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "compass_chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_profile_id" uuid NOT NULL, "intention" character varying NOT NULL, "topic" character varying NOT NULL, "status" character varying NOT NULL, "active_speaker" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_683aed0b0298ccc9ffc81a858bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_491f8c25cfc4c34cdb4717fac1" ON "compass_chats" ("user_profile_id") `);
        await queryRunner.query(`ALTER TABLE "compass_chats" ADD CONSTRAINT "FK_491f8c25cfc4c34cdb4717fac1b" FOREIGN KEY ("user_profile_id") REFERENCES "users_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compass_chats" DROP CONSTRAINT "FK_491f8c25cfc4c34cdb4717fac1b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_491f8c25cfc4c34cdb4717fac1"`);
        await queryRunner.query(`DROP TABLE "compass_chats"`);
    }

}
