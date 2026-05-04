import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAiTokenUsage1767890600000 implements MigrationInterface {
    name = 'AddAiTokenUsage1767890600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "ai_token_usage" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "user_id" uuid NOT NULL,
                "chat_id" uuid,
                "provider" character varying(20) NOT NULL,
                "model" character varying(50) NOT NULL,
                "feature" character varying(30) NOT NULL,
                "input_tokens" integer NOT NULL DEFAULT 0,
                "output_tokens" integer NOT NULL DEFAULT 0,
                "total_tokens" integer NOT NULL DEFAULT 0,
                "estimated_cost_usd" numeric(10, 6) NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT "PK_ai_token_usage" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_ai_token_usage_user_date" ON "ai_token_usage" ("user_id", "created_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_ai_token_usage_feature_date" ON "ai_token_usage" ("feature", "created_at")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_ai_token_usage_feature_date"`);
        await queryRunner.query(`DROP INDEX "IDX_ai_token_usage_user_date"`);
        await queryRunner.query(`DROP TABLE "ai_token_usage"`);
    }
}
