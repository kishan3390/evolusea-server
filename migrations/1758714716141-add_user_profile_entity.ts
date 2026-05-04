import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileEntity1758714716141 implements MigrationInterface {
    name = 'AddUserProfileEntity1758714716141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "account_id" character varying NOT NULL, "username" character varying NOT NULL, "country_code" character varying NOT NULL, "belief" character varying NOT NULL, "biography" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_af37a08768f5538b5b77e7bba48" UNIQUE ("account_id"), CONSTRAINT "PK_e7a7f7db3fc96700d9239e43cda" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users_profiles"`);
    }

}
