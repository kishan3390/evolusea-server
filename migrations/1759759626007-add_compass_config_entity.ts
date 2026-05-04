import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompassConfigEntity1759759626007 implements MigrationInterface {
    name = 'AddCompassConfigEntity1759759626007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "compass_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "goal" character varying NOT NULL, "personality" character varying NOT NULL, "user_profile_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_f5acbb99df608ee2afbddb0f829" UNIQUE ("user_profile_id"), CONSTRAINT "REL_f5acbb99df608ee2afbddb0f82" UNIQUE ("user_profile_id"), CONSTRAINT "PK_06930507b83b85977ada25d8fce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "compass_configs" ADD CONSTRAINT "FK_f5acbb99df608ee2afbddb0f829" FOREIGN KEY ("user_profile_id") REFERENCES "users_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compass_configs" DROP CONSTRAINT "FK_f5acbb99df608ee2afbddb0f829"`);
        await queryRunner.query(`DROP TABLE "compass_configs"`);
    }

}
