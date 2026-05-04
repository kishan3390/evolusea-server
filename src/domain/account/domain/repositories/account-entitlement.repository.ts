import { PaginatedList, Pagination } from '@building-blocks/application';
import { Transaction } from '@building-blocks/infrastructure';
import { AccountEntitlement } from '@domain/account/domain/account-entitlement';
import { EntitlementsTypes } from '@domain/account/domain/enums';

export interface FindAccountEntitlementByAccountIdAndType {
  accountId: string;
  type: EntitlementsTypes;
}

export interface AccountEntitlementFilters {
  accountId: string;
}

export abstract class AccountEntitlementRepository {
  abstract create(entity: AccountEntitlement, tx?: Transaction): Promise<void>;
  abstract findOneByAccountIdAndType(
    params: FindAccountEntitlementByAccountIdAndType,
  ): Promise<AccountEntitlement | null>;
  abstract delete(id: string): Promise<void>;
  abstract update(entity: AccountEntitlement, tx?: Transaction): Promise<void>;
  abstract upsert(entity: AccountEntitlement, tx?: Transaction): Promise<void>;
  abstract list(
    filters: AccountEntitlementFilters,
    pagination: Pagination,
  ): Promise<PaginatedList<AccountEntitlement>>;
}
