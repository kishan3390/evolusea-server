import { Injectable } from '@nestjs/common';
import { PaginatedList, QueryHandler } from '@building-blocks/application';
import { ListAccountsQuery } from '@domain/account/application/queries';
import { Account, AccountRepository } from '@domain/account/domain';

@Injectable()
export class ListAccountsQueryHandler
  implements QueryHandler<ListAccountsQuery, PaginatedList<Account>>
{
  constructor(private readonly accountRepository: AccountRepository) {}

  async handle(query: ListAccountsQuery): Promise<PaginatedList<Account>> {
    return this.accountRepository.list(query.pagination);
  }
}
