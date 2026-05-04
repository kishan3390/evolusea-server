import {
  Operation,
  Transaction,
  TransactionManager,
} from '@building-blocks/infrastructure';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

import {
  assertTypeOrmTransaction,
  TypeOrmTransaction,
} from './typeorm-transaction';

@Injectable()
export class TypeOrmTransactionManager implements TransactionManager {
  constructor(private readonly dataSource: DataSource) {}

  execute<T>(
    fn: Operation<T>,
    activeTransaction?: Transaction,
    isolationLevel: IsolationLevel = 'READ COMMITTED',
  ): Promise<T> {
    if (activeTransaction) {
      assertTypeOrmTransaction(activeTransaction);
      return fn(activeTransaction);
    }

    return this.dataSource.transaction(isolationLevel, (manager) =>
      fn(new TypeOrmTransaction(manager)),
    );
  }
}
