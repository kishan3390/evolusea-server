import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Transaction {}

export type Operation<T> = (tx: Transaction) => Promise<T>;

export abstract class TransactionManager {
  abstract withTransaction<T>(
    fn: Operation<T>,
    activeTransaction?: Transaction,
    isolationLevel?: IsolationLevel,
  ): Promise<T>;
}
