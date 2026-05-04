import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAttributionToQuoteEntity1767890400000 implements MigrationInterface {
    name = 'AddAttributionToQuoteEntity1767890400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotes" ADD "attribution" character varying NOT NULL DEFAULT 'AI Compass'`);
        await queryRunner.query(`ALTER TABLE "quotes" ADD "source" character varying`);
        await queryRunner.query(`ALTER TABLE "quotes" ADD "category" character varying NOT NULL DEFAULT 'general'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotes" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "quotes" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "quotes" DROP COLUMN "attribution"`);
    }

}
