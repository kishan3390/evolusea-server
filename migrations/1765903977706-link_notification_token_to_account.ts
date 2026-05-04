import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkNotificationTokenToAccount1765903977706 implements MigrationInterface {
    name = 'LinkNotificationTokenToAccount1765903977706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e14c2e55ae6f1a20c3baf86873"`);
        await queryRunner.query(`ALTER TABLE "notification_push_tokens" RENAME COLUMN "user_profile_id" TO "account_id"`);
        await queryRunner.query(`
          UPDATE "notification_push_tokens" n
          SET "account_id" = u."account_id"
            FROM "users_profiles" u
          WHERE n."account_id" = u."id"
        `);
        await queryRunner.query(`CREATE INDEX "IDX_f8c2bc321f554054ac3a5d3ea9" ON "notification_push_tokens" ("account_id") `);
        await queryRunner.query(`ALTER TABLE "notification_push_tokens" ADD CONSTRAINT "FK_f8c2bc321f554054ac3a5d3ea9a" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "notification_push_tokens" DROP CONSTRAINT "FK_f8c2bc321f554054ac3a5d3ea9a"`);
      await queryRunner.query(`DROP INDEX "public"."IDX_f8c2bc321f554054ac3a5d3ea9"`);
      await queryRunner.query(`ALTER TABLE "notification_push_tokens" RENAME COLUMN "account_id" TO "user_profile_id"`);
      await queryRunner.query(`
        UPDATE "notification_push_tokens" n
        SET "user_profile_id" = u."id"
          FROM "users_profiles" u
        WHERE u."account_id" = n."user_profile_id"
      `);
      await queryRunner.query(
        `CREATE INDEX "IDX_e14c2e55ae6f1a20c3baf86873" ON "notification_push_tokens" ("user_profile_id") `,
      );
      await queryRunner.query(`CREATE INDEX "IDX_e14c2e55ae6f1a20c3baf86873" ON "notification_push_tokens" ("user_profile_id") `);
    }

}
