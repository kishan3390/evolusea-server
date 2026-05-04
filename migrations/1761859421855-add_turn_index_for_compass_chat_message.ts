import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTurnIndexForCompassChatMessage1761859421855
  implements MigrationInterface
{
  name = 'AddTurnIndexForCompassChatMessage1761859421855';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "compass_chats_messages"
          ADD "turn_index" integer
      `);
    await queryRunner.query(`
          UPDATE "compass_chats_messages"
          SET "turn_index" = 1
        `);
    await queryRunner.query(`
          ALTER TABLE "compass_chats_messages"
          ALTER COLUMN "turn_index" SET NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "compass_chats_messages" DROP COLUMN "turn_index"`,
    );
  }
}
