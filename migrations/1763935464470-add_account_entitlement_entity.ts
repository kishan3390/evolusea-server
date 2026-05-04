import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccountEntitlementEntity1763935464470 implements MigrationInterface {
    name = 'AddAccountEntitlementEntity1763935464470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "accounts_entitlements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "account_id" uuid NOT NULL, "type" character varying NOT NULL, "purchased_at" TIMESTAMP WITH TIME ZONE NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_e5400a8beba01c3d50867c5124e" UNIQUE ("account_id", "type"), CONSTRAINT "PK_161a7a45e1ccbe86a39759ecba3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "accounts_entitlements" ADD CONSTRAINT "FK_4534b22ff55a70e6a6ca98f1a7a" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts_entitlements" DROP CONSTRAINT "FK_4534b22ff55a70e6a6ca98f1a7a"`);
        await queryRunner.query(`DROP TABLE "accounts_entitlements"`);
    }

}
