import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationPushTokenEntity1761158281348 implements MigrationInterface {
    name = 'CreateNotificationPushTokenEntity1761158281348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notification_push_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_profile_id" uuid NOT NULL, "token" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_fbb6f0604031079403fbb9522b9" UNIQUE ("token"), CONSTRAINT "PK_a607febe6a3e71dfa17d46b3fb8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e14c2e55ae6f1a20c3baf86873" ON "notification_push_tokens" ("user_profile_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e14c2e55ae6f1a20c3baf86873"`);
        await queryRunner.query(`DROP TABLE "notification_push_tokens"`);
    }

}
