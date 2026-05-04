import { Injectable } from '@nestjs/common';

import {
  SynchronizeAccountCommand,
  SynchronizeAccountCommandHandler,
} from './application/commands/synchronize-account';
import { Account } from './domain';
import {
  GetAccountByIdQuery,
  GetAccountByIdQueryHandler,
  GetIsPremiumAccountQueryResult,
  ListAccountsQueryHandler,
} from '@domain/account/application/queries';
import {
  ReplaceEntitlementsCommand,
  ReplaceEntitlementsCommandHandler,
  UpsertAccountEntitlementCommand,
  UpsertAccountEntitlementCommandHandler,
  GetIsPremiumAccountQueryHandler,
  DeleteAccountCommand,
  DeleteAccountCommandHandler,
} from '@domain/account/application';
import { Pagination } from '@building-blocks/application';

@Injectable()
export class AccountFacade {
  constructor(
    private readonly synchronizeAccountCommandHandler: SynchronizeAccountCommandHandler,
    private readonly getAccountByIdQueryHandler: GetAccountByIdQueryHandler,
    private readonly replaceEntitlementsCommandHandler: ReplaceEntitlementsCommandHandler,
    private readonly upsertAccountEntitlementQueryHandler: UpsertAccountEntitlementCommandHandler,
    private readonly listAccountsQueryHandler: ListAccountsQueryHandler,
    private readonly getIsPremiumAccountQueryHandler: GetIsPremiumAccountQueryHandler,
    private readonly deleteAccountCommandHandler: DeleteAccountCommandHandler,
  ) {}

  getAccountById(query: GetAccountByIdQuery): Promise<Account | null> {
    return this.getAccountByIdQueryHandler.handle(query);
  }

  async syncAccount(command: SynchronizeAccountCommand): Promise<Account> {
    return await this.synchronizeAccountCommandHandler.handle(command);
  }

  async replaceEntitlements(
    command: ReplaceEntitlementsCommand,
  ): Promise<void> {
    return this.replaceEntitlementsCommandHandler.handle(command);
  }

  async upsertAccountEntitlement(
    command: UpsertAccountEntitlementCommand,
  ): Promise<void> {
    return this.upsertAccountEntitlementQueryHandler.handle(command);
  }

  async getIsPremiumAccount(
    query: GetAccountByIdQuery,
  ): Promise<GetIsPremiumAccountQueryResult> {
    return this.getIsPremiumAccountQueryHandler.handle(query);
  }

  async deleteAccount(command: DeleteAccountCommand): Promise<void> {
    return this.deleteAccountCommandHandler.handle(command);
  }

  async *listAllAccounts(perPage: number): AsyncGenerator<Account[]> {
    let hasMore = true;
    let currentPage = 1;
    while (hasMore) {
      const accountsPagination = await this.listAccountsQueryHandler.handle({
        pagination: Pagination.from({ page: currentPage, perPage }),
      });

      yield accountsPagination.items;

      hasMore = accountsPagination.hasMore;
      currentPage++;
    }
  }
}
