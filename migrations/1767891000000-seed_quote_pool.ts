import { MigrationInterface, QueryRunner } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';

interface SeedQuote {
  content: string;
  attribution: string;
  source: string | null;
  mood: string;
  beliefSystem: string;
}

export class SeedQuotePool1767891000000 implements MigrationInterface {
  name = 'SeedQuotePool1767891000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const seedsDir = path.resolve(__dirname, '..', 'seeds');

    const files: { file: string; language: string }[] = [
      { file: 'quotes-en.json', language: 'en' },
      { file: 'quotes-th.json', language: 'th' },
      { file: 'quotes-id.json', language: 'id' },
    ];

    for (const { file, language } of files) {
      const filePath = path.join(seedsDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const quotes: SeedQuote[] = JSON.parse(raw);

      for (const quote of quotes) {
        const escapedContent = quote.content.replace(/'/g, "''");
        const escapedAttribution = (quote.attribution ?? '').replace(/'/g, "''");
        const escapedSource = quote.source
          ? `'${quote.source.replace(/'/g, "''")}'`
          : 'NULL';

        await queryRunner.query(
          `INSERT INTO "quote_pool" ("content", "attribution", "source", "mood", "belief_system", "language")
           VALUES ('${escapedContent}', '${escapedAttribution}', ${escapedSource}, '${quote.mood}', '${quote.beliefSystem}', '${language}')`,
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "quote_pool"`);
  }
}
