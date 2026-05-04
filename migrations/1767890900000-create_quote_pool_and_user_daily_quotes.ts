import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuotePoolAndUserDailyQuotes1767890900000
  implements MigrationInterface
{
  name = 'CreateQuotePoolAndUserDailyQuotes1767890900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old quotes table
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP CONSTRAINT "FK_77c1ae715a4636906f5712004da"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0dd8c5a5898ddeaaa7750ac61e"`,
    );
    await queryRunner.query(`DROP TABLE "quotes"`);

    // Create quote_pool table
    await queryRunner.query(
      `CREATE TABLE "quote_pool" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "attribution" character varying NOT NULL,
        "source" character varying,
        "mood" character varying NOT NULL,
        "belief_system" character varying NOT NULL,
        "language" character varying NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quote_pool" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quote_pool_belief_mood_lang" ON "quote_pool" ("belief_system", "mood", "language")`,
    );

    // Create user_daily_quotes table
    await queryRunner.query(
      `CREATE TABLE "user_daily_quotes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_profile_id" uuid NOT NULL,
        "quote_pool_id" uuid NOT NULL,
        "date" date NOT NULL,
        "order_index" smallint NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_daily_quotes" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_user_daily_quotes_user_date_order" ON "user_daily_quotes" ("user_profile_id", "date", "order_index")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_daily_quotes_user_date" ON "user_daily_quotes" ("user_profile_id", "date")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_daily_quotes" ADD CONSTRAINT "FK_user_daily_quotes_user_profile" FOREIGN KEY ("user_profile_id") REFERENCES "users_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_daily_quotes" ADD CONSTRAINT "FK_user_daily_quotes_quote_pool" FOREIGN KEY ("quote_pool_id") REFERENCES "quote_pool"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new tables
    await queryRunner.query(
      `ALTER TABLE "user_daily_quotes" DROP CONSTRAINT "FK_user_daily_quotes_quote_pool"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_daily_quotes" DROP CONSTRAINT "FK_user_daily_quotes_user_profile"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_daily_quotes_user_date"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_daily_quotes_user_date_order"`,
    );
    await queryRunner.query(`DROP TABLE "user_daily_quotes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_quote_pool_belief_mood_lang"`,
    );
    await queryRunner.query(`DROP TABLE "quote_pool"`);

    // Recreate old quotes table
    await queryRunner.query(
      `CREATE TABLE "quotes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "date" date NOT NULL,
        "belief" character varying NOT NULL,
        "language" character varying NOT NULL,
        "content" text NOT NULL,
        "attribution" character varying NOT NULL DEFAULT 'AI Compass',
        "source" character varying,
        "category" character varying NOT NULL DEFAULT 'general',
        "user_profile_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_99a0e8bcbcd8719d3a41f23c263" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0dd8c5a5898ddeaaa7750ac61e" ON "quotes" ("user_profile_id", "belief", "language", "date")`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD CONSTRAINT "FK_77c1ae715a4636906f5712004da" FOREIGN KEY ("user_profile_id") REFERENCES "users_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
