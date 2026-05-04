import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeNoteDescNullable1762441459736 implements MigrationInterface {
    name = 'MakeNoteDescNullable1762441459736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "description" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notes" ALTER COLUMN "description" SET NOT NULL`);
    }

}
