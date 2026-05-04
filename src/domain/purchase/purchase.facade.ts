import { Injectable } from '@nestjs/common';
import { RefreshAccountEntitlementsFromRevenueCatCommandHandler } from '@domain/purchase/application';
import { AccountFacade } from '@domain/account/account.facade';
import { GetIsPremiumAccountQueryResult } from '@domain/account/application';

@Injectable()
export class PurchaseFacade {
  constructor(
    private readonly refreshAccountEntitlementsFromRevenueCatCommandHandler: RefreshAccountEntitlementsFromRevenueCatCommandHandler,
    private readonly accountFacade: AccountFacade,
  ) {}

  async refreshAccountEntitlements(
    accountId: string,
  ): Promise<GetIsPremiumAccountQueryResult> {
    await this.refreshAccountEntitlementsFromRevenueCatCommandHandler.handle({
      accountId,
    });
    return this.accountFacade.getIsPremiumAccount({ accountId });
  }
}
