import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPathEntity1760015953734 implements MigrationInterface {
    name = 'AddPathEntity1760015953734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "paths" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "date" date NOT NULL, "user_profile_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_3023c8d7a50ae9c50117a94e502" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8e70c9d3c364dd5e6ec501ee88" ON "paths" ("user_profile_id") `);
        await queryRunner.query(`ALTER TABLE "paths" ADD CONSTRAINT "FK_8e70c9d3c364dd5e6ec501ee880" FOREIGN KEY ("user_profile_id") REFERENCES "users_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paths" DROP CONSTRAINT "FK_8e70c9d3c364dd5e6ec501ee880"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8e70c9d3c364dd5e6ec501ee88"`);
        await queryRunner.query(`DROP TABLE "paths"`);
    }

}
