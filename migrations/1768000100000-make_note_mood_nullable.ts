import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeNoteMoodNullable1768000100000 implements MigrationInterface {
  name = 'MakeNoteMoodNullable1768000100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" ALTER COLUMN "mood" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "notes" SET "mood" = 'calm' WHERE "mood" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ALTER COLUMN "mood" SET NOT NULL`,
    );
  }
}
