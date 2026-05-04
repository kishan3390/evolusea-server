import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDistributedLock1760521344847 implements MigrationInterface {
    name = 'AddDistributedLock1760521344847'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "distributed_locks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "owner_token" character varying(64) NOT NULL, "release_lock_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7ba717d107be8cc20be5fa8d2d1" UNIQUE ("name"), CONSTRAINT "PK_d4249d8e8293c7c9bc2fe252fa8" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "distributed_locks"`);
    }

}
