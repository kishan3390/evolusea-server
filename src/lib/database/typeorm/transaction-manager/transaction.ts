import { InternalServerErrorException } from '@nestjs/common';
import {
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from 'typeorm';

import { Transaction } from '../../transaction-manager';

const isTypeOrmTransaction = (tx: Transaction): tx is TypeOrmTransaction => {
  return tx instanceof TypeOrmTransaction;
};

export function assertTypeOrmTransaction(
  tx: Transaction,
): asserts tx is TypeOrmTransaction {
  if (!isTypeOrmTransaction(tx)) {
    throw new NotATypeORMTransactionException();
  }
}

class NotATypeORMTransactionException extends InternalServerErrorException {
  constructor() {
    super('Provided transaction of different type than TypeOrmTransaction!');
  }
}

export class TypeOrmTransaction implements Transaction {
  constructor(private readonly manager: EntityManager) {}

  getRepository<Obj extends ObjectLiteral>(
    entity: EntityTarget<Obj>,
  ): Repository<Obj> {
    return this.manager.getRepository(entity);
  }
}
