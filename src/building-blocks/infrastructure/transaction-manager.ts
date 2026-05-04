import { Transaction } from './transaction';

export type IsolationLevel =
  | 'READ UNCOMMITTED'
  | 'READ COMMITTED'
  | 'REPEATABLE READ'
  | 'SERIALIZABLE';

export type Operation<T> = (tx: Transaction) => Promise<T>;

export abstract class TransactionManager {
  abstract execute<T>(
    fn: Operation<T>,
    activeTransaction?: Transaction,
    isolationLevel?: IsolationLevel,
  ): Promise<T>;
}
