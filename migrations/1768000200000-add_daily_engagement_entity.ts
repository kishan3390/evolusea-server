import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDailyEngagementEntity1768000200000
  implements MigrationInterface
{
  name = 'AddDailyEngagementEntity1768000200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "daily_engagements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_profile_id" uuid NOT NULL,
        "date" date NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_daily_engagements" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_daily_engagements_user_date" UNIQUE ("user_profile_id", "date"),
        CONSTRAINT "FK_daily_engagements_user_profile" FOREIGN KEY ("user_profile_id")
          REFERENCES "users_profiles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_daily_engagements_user_profile_id"
        ON "daily_engagements" ("user_profile_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_daily_engagements_user_profile_id"`,
    );
    await queryRunner.query(`DROP TABLE "daily_engagements"`);
  }
}
