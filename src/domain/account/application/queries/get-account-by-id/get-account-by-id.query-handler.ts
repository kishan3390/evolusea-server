import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import { GetAccountByIdQuery } from '@domain/account/application/queries';
import { Account, AccountRepository } from '@domain/account/domain';

@Injectable()
export class GetAccountByIdQueryHandler
  implements QueryHandler<GetAccountByIdQuery, Account>
{
  constructor(private readonly accountRepository: AccountRepository) {}

  async handle(query: GetAccountByIdQuery): Promise<Account | null> {
    return this.accountRepository.getById(query.accountId);
  }
}
