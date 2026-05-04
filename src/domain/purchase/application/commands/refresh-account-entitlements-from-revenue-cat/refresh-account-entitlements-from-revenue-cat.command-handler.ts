import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler } from '@building-blocks/application';
import { RefreshAccountEntitlementsFromRevenueCatCommand } from './refresh-account-entitlements-from-revenue-cat.command';
import { EntitlementsTypes } from '@domain/account/domain/enums';
import { ReplaceEntitlementsCommandEntry } from '@domain/account/application';
import { RevenueCatService } from '../../../../../lib/purchase';
import { AccountFacade } from '@domain/account/account.facade';

@Injectable()
export class RefreshAccountEntitlementsFromRevenueCatCommandHandler
  implements
    CommandHandler<RefreshAccountEntitlementsFromRevenueCatCommand, void>
{
  private logger: Logger;

  constructor(
    private readonly revenueCatService: RevenueCatService,
    private readonly accountFacade: AccountFacade,
  ) {
    this.logger = new Logger(
      RefreshAccountEntitlementsFromRevenueCatCommandHandler.name,
    );
  }

  async handle({
    accountId,
  }: RefreshAccountEntitlementsFromRevenueCatCommand): Promise<void> {
    this.logger.log(
      `Starting customer data refresh for account id '${accountId}'`,
    );

    const account = await this.accountFacade.getAccountById({ accountId });
    if (!account) {
      this.logger.error(`Account with id '${accountId}' not found`);
      return;
    }

    const customer =
      await this.revenueCatService.getCustomerByAppUserIdV1(accountId);
    if (!customer) {
      this.logger.error(`Customer with id '${accountId}' not found`);
      return;
    }

    const entitlements = Object.keys(customer.subscriber.entitlements).reduce(
      (acc, type: EntitlementsTypes) => {
        const purchasedAt =
          customer.subscriber.entitlements[type].purchase_date;
        const expiresAt = customer.subscriber.entitlements[type].expires_date;
        acc[type] = {
          purchasedAt: new Date(purchasedAt),
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        };
        return acc;
      },
      {} as Record<EntitlementsTypes, ReplaceEntitlementsCommandEntry>,
    );

    await this.accountFacade.replaceEntitlements({ accountId, entitlements });

    this.logger.log(
      `Completed customer data refresh for account id '${accountId}'`,
    );
  }
}
