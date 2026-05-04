import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRelationForAccountAndUserProfile1759105930701 implements MigrationInterface {
    name = 'AddRelationForAccountAndUserProfile1759105930701'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_profiles" DROP CONSTRAINT "UQ_af37a08768f5538b5b77e7bba48"`);
        await queryRunner.query(`ALTER TABLE "users_profiles" DROP COLUMN "account_id"`);
        await queryRunner.query(`ALTER TABLE "users_profiles" ADD "account_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users_profiles" ADD CONSTRAINT "UQ_af37a08768f5538b5b77e7bba48" UNIQUE ("account_id")`);
        await queryRunner.query(`ALTER TABLE "users_profiles" ADD CONSTRAINT "FK_af37a08768f5538b5b77e7bba48" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_profiles" DROP CONSTRAINT "FK_af37a08768f5538b5b77e7bba48"`);
        await queryRunner.query(`ALTER TABLE "users_profiles" DROP CONSTRAINT "UQ_af37a08768f5538b5b77e7bba48"`);
        await queryRunner.query(`ALTER TABLE "users_profiles" DROP COLUMN "account_id"`);
        await queryRunner.query(`ALTER TABLE "users_profiles" ADD "account_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users_profiles" ADD CONSTRAINT "UQ_af37a08768f5538b5b77e7bba48" UNIQUE ("account_id")`);
    }

}
