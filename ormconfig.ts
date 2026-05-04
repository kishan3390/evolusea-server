import 'tsconfig-paths/register';

import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ConfigProvider } from './src/config';
import { migrations } from './migrations/migrations';

export default new DataSource({
  type: ConfigProvider.database.type,
  host: ConfigProvider.database.host,
  port: ConfigProvider.database.port,
  username: ConfigProvider.database.username,
  password: ConfigProvider.database.password,
  database: ConfigProvider.database.database,
  entities: ['src/**/*.entity.ts'],
  migrations: migrations,
  namingStrategy: new SnakeNamingStrategy(),
});
