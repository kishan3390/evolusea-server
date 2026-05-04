import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLanguageToUserProfile1761048161673 implements MigrationInterface {
    name = 'AddLanguageToUserProfile1761048161673'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_profiles" ADD "language" character varying NOT NULL DEFAULT 'en'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_profiles" DROP COLUMN "language"`);
    }

}
