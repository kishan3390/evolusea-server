import { TransactionManager } from '@building-blocks/infrastructure';
import { ConfigProvider } from '@config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DynamicModule } from '@nestjs/common';
import { EntityIdGenerator } from '@building-blocks/domain';

import { TypeOrmTransactionManager } from './typeorm-transaction-manager';
import { PostgresEntityIdGenerator } from './postgres-entity-id-generator';

export class TypeOrmPostgresDatabaseModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: TypeOrmPostgresDatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            ...ConfigProvider.database,
            autoLoadEntities: true,
            dropSchema: false,
            logging: false,
            namingStrategy: new SnakeNamingStrategy(),
            synchronize: false,
          }),
        }),
      ],
      providers: [
        {
          provide: TransactionManager,
          useClass: TypeOrmTransactionManager,
        },
        {
          provide: EntityIdGenerator,
          useClass: PostgresEntityIdGenerator,
        },
      ],
      exports: [TransactionManager, EntityIdGenerator],
    };
  }
}
