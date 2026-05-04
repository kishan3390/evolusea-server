import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMoodCheckinEntity1768000000000 implements MigrationInterface {
  name = 'AddMoodCheckinEntity1768000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "mood_checkins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "mood" character varying NOT NULL,
        "user_profile_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_mood_checkins" PRIMARY KEY ("id"),
        CONSTRAINT "FK_mood_checkins_user_profile" FOREIGN KEY ("user_profile_id")
          REFERENCES "users_profiles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_mood_checkins_user_profile_id" ON "mood_checkins" ("user_profile_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_mood_checkins_user_created" ON "mood_checkins" ("user_profile_id", "created_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_mood_checkins_user_created"`);
    await queryRunner.query(`DROP INDEX "IDX_mood_checkins_user_profile_id"`);
    await queryRunner.query(`DROP TABLE "mood_checkins"`);
  }
}
