import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccountCascadeDelete1767369616500 implements MigrationInterface {
    name = 'AddAccountCascadeDelete1767369616500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_profiles" DROP CONSTRAINT "FK_af37a08768f5538b5b77e7bba48"`);
        await queryRunner.query(`ALTER TABLE "users_profiles" ADD CONSTRAINT "FK_af37a08768f5538b5b77e7bba48" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_profiles" DROP CONSTRAINT "FK_af37a08768f5538b5b77e7bba48"`);
        await queryRunner.query(`ALTER TABLE "users_profiles" ADD CONSTRAINT "FK_af37a08768f5538b5b77e7bba48" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
