import { Transaction } from '@building-blocks/infrastructure';
import { Account } from '../account';
import { PaginatedList, Pagination } from '@building-blocks/application';

export abstract class AccountRepository {
  abstract create(entity: Account, tx?: Transaction): Promise<void>;
  abstract getByAuthProviderId(
    authProviderId: string,
  ): Promise<Account | undefined>;
  abstract getById(accountId: string): Promise<Account | null>;
  abstract list(pagination: Pagination): Promise<PaginatedList<Account>>;
  abstract delete(accountId: string): Promise<void>;
}
