import { DataSource, QueryRunner } from 'typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

import { ConfigProvider, DatabaseConfig } from '../../../src/config';
import { migrations } from '../../../migrations/migrations';

export class DatabaseContainer {
  private isInUse = true;

  private constructor(private readonly container: StartedPostgreSqlContainer) {}

  static async create() {
    const IMAGE = 'postgres:15.1-alpine';

    const container = await new PostgreSqlContainer(IMAGE)
      .withCommand(['postgres', '-c', 'fsync=off'])
      .withDatabase(ConfigProvider.database.database as string)
      .withUsername(ConfigProvider.database.username as string)
      .withPassword(ConfigProvider.database.password as string)
      .start();

    ConfigProvider.database.host = container.getHost();
    ConfigProvider.database.port = container.getPort();

    return new DatabaseContainer(container);
  }

  useContainer() {
    this.isInUse = true;
  }

  releaseContainer() {
    this.isInUse = false;
  }

  getIsInUse() {
    return this.isInUse;
  }

  async stop() {
    return this.container.stop({ removeVolumes: true });
  }

  async runMigrations() {
    const config = this.getDatabaseConfig();
    const dataSource = await this.getInitializedDataSource(config);

    dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await dataSource.runMigrations();
    await dataSource.destroy();
  }

  async dropData(): Promise<void> {
    const config = this.getDatabaseConfig();
    const dataSource = await this.getInitializedDataSource(config);
    const queryRunner = dataSource.createQueryRunner();

    await this.removeTablesData(queryRunner);

    dataSource.destroy();
  }

  private getInitializedDataSource(
    databaseConfig: DatabaseConfig,
  ): Promise<DataSource> {
    const dataSource = new DataSource({
      ...databaseConfig,
      migrations: migrations,
    });

    return dataSource.initialize();
  }

  private getDatabaseConfig(): DatabaseConfig {
    return {
      type: 'postgres',
      database: this.container.getDatabase(),
      host: this.container.getHost(),
      password: this.container.getPassword(),
      port: this.container.getPort(),
      username: this.container.getUsername(),
    };
  }

  private async removeTablesData(queryRunner: QueryRunner) {
    const response = await queryRunner.query(
      `SELECT 'truncate table "' || tablename || '" cascade;' AS query 
      FROM pg_tables 
      WHERE tablename NOT ILIKE 'pg_%' 
      AND tablename NOT ILIKE 'information_schema%' 
      AND tablename <> 'migrations' 
      AND tablename <> 'quote_pool'
      AND schemaname = 'public'`,
    );

    await queryRunner.startTransaction();

    /**
     * In postgres, foreign keys are implemented as triggers.
     * Setting "session_replication_role" to replica also disables all foreign key checks.
     * It should make the cleaning of the database faster.
     * https://postgresqlco.nf/doc/en/param/session_replication_role
     */
    await queryRunner.query(
      `BEGIN;
      SET session_replication_role = replica;
      
      ${response.map((row: any) => row.query).join(';')}
      
      SET session_replication_role = DEFAULT;
      COMMIT;`,
    );

    await queryRunner.commitTransaction();
  }
}
