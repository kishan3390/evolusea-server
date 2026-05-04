import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWisdomStoryWithTranslations1762432246867 implements MigrationInterface {
    name = 'AddWisdomStoryWithTranslations1762432246867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wisdom_stories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cms_id" character varying NOT NULL, "image_url" character varying NOT NULL, "time_to_read" character varying NOT NULL, "is_free" boolean NOT NULL DEFAULT true, "created_at_cms" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_ed63c7b55f3e76e3e9a758fd1d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wisdom_story_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "wisdom_story_id" uuid NOT NULL, "language" character varying NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_75a72e191c36da26c54117a2522" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_34d68c5f94b421b9b9199f37a8" ON "wisdom_story_translations" ("wisdom_story_id") `);
        await queryRunner.query(`ALTER TABLE "wisdom_story_translations" ADD CONSTRAINT "FK_34d68c5f94b421b9b9199f37a80" FOREIGN KEY ("wisdom_story_id") REFERENCES "wisdom_stories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wisdom_story_translations" DROP CONSTRAINT "FK_34d68c5f94b421b9b9199f37a80"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_34d68c5f94b421b9b9199f37a8"`);
        await queryRunner.query(`DROP TABLE "wisdom_story_translations"`);
        await queryRunner.query(`DROP TABLE "wisdom_stories"`);
    }

}
