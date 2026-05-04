import { Injectable } from '@nestjs/common';
import { QueryHandler } from '@building-blocks/application';
import {
  GetAccountByIdQuery,
  GetIsPremiumAccountQueryResult,
} from '@domain/account/application/queries';
import { AccountEntitlementRepository } from '@domain/account/domain/repositories';
import { EntitlementsTypes } from '@domain/account/domain/enums';

@Injectable()
export class GetIsPremiumAccountQueryHandler
  implements QueryHandler<GetAccountByIdQuery, GetIsPremiumAccountQueryResult>
{
  constructor(
    private readonly accountEntitlementRepository: AccountEntitlementRepository,
  ) {}

  async handle(
    query: GetAccountByIdQuery,
  ): Promise<GetIsPremiumAccountQueryResult> {
    const entitlement =
      await this.accountEntitlementRepository.findOneByAccountIdAndType({
        accountId: query.accountId,
        type: EntitlementsTypes.Premium,
      });

    if (!entitlement) {
      return {
        accountId: query.accountId,
        isPremium: false,
      };
    }

    return {
      accountId: query.accountId,
      isPremium: !entitlement.getIsEntitlementExpired(),
    };
  }
}
