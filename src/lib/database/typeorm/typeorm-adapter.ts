import { ClassProvider, Module, Type } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntitySchema } from 'typeorm';

import { ConfigProvider, DatabaseConfig } from '../../../config';
import { TransactionManager } from '../transaction-manager';
import { TypeOrmTransactionManager } from './transaction-manager/typeorm-transaction-manager';

export interface TypeOrmAdapterModuleProps {
  exportRepositories?: boolean;
  useFactory: (
    databaseConfig: DatabaseConfig,
  ) => Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions;
  entities: (EntitySchema | Type)[];
  repositories: ClassProvider[];
}

export const TypeOrmAdapterModule = ({
  exportRepositories = true,
  useFactory,
  entities,
  repositories,
}: TypeOrmAdapterModuleProps) => {
  const providedRepositories: ClassProvider[] = exportRepositories
    ? repositories
    : [];

  const exportedRepositories = providedRepositories.map(
    ({ provide }) => provide,
  );

  return Module({
    imports: [
      TypeOrmModule.forRootAsync({
        useFactory: () => useFactory(ConfigProvider.database),
      }),
      TypeOrmModule.forFeature(entities),
    ],
    providers: [
      ...providedRepositories,
      {
        provide: TransactionManager,
        useClass: TypeOrmTransactionManager,
      },
    ],
    exports: [...exportedRepositories, TransactionManager],
  });
};
