import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePathDescNullable1762441569483 implements MigrationInterface {
    name = 'MakePathDescNullable1762441569483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paths" ALTER COLUMN "description" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paths" ALTER COLUMN "description" SET NOT NULL`);
    }

}
