import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

import {
  Operation,
  Transaction,
  TransactionManager,
} from '../../transaction-manager';
import { assertTypeOrmTransaction, TypeOrmTransaction } from './transaction';

type TypeOrmOperation<T> = (tx: TypeOrmTransaction) => Promise<T>;

@Injectable()
export class TypeOrmTransactionManager implements TransactionManager {
  constructor(private readonly dataSource: DataSource) {}

  withExplicitTypeOrmTransaction<T>(
    fn: TypeOrmOperation<T>,
    tx?: Transaction,
  ): Promise<T> {
    return this.withTransaction(fn, tx);
  }

  withTransaction<T>(
    fn: Operation<T>,
    activeTransaction?: Transaction,
    isolationLevel: IsolationLevel = 'SERIALIZABLE',
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
