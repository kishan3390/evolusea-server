import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPathStatus1760521985618 implements MigrationInterface {
    name = 'AddPathStatus1760521985618'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paths" ADD "status" character varying NOT NULL DEFAULT 'awaiting'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paths" DROP COLUMN "status"`);
    }

}
