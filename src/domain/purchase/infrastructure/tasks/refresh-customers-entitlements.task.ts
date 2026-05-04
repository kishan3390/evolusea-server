import { DistributedLockService } from '../../../../distributed-lock';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { RevenueCatService } from '../../../../lib/purchase';
import { AccountFacade } from '@domain/account/account.facade';
import { EntitlementsTypes } from '@domain/account/domain/enums';

const LOCK_KEY = 'customers-entitlements-refresh';
const LOCK_EXPIRATION_TIME_IN_MS = 60_000 * 2; // 2 min

@Injectable()
export class RefreshCustomersEntitlementsTask {
  private readonly logger = new Logger(RefreshCustomersEntitlementsTask.name);

  constructor(
    private readonly distributedLock: DistributedLockService,
    private readonly accountFacade: AccountFacade,
    private readonly revenueCatService: RevenueCatService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { timeZone: 'UTC' })
  async execute(): Promise<void> {
    this.logger.log('Trying to acquire lock');
    await this.distributedLock.executeWithLock(
      LOCK_KEY,
      LOCK_EXPIRATION_TIME_IN_MS,
      () => this.refreshCustomersEntitlements(),
    );
  }

  private async refreshCustomersEntitlements(): Promise<void> {
    const perPage = 100;
    let iteration = 0;
    const accountsBatches = this.accountFacade.listAllAccounts(perPage);
    for await (const accountsBatch of accountsBatches) {
      iteration++;

      const customersEntitlements = await Promise.all(
        accountsBatch.map(async (account) => {
          const entitlements =
            await this.revenueCatService.getCustomerByAppUserIdV1(
              account.getId(),
            );

          return {
            accountId: account.getId(),
            entitlements: entitlements?.subscriber.entitlements,
          };
        }),
      );

      const accountsWithEntitlements = customersEntitlements.filter(
        ({ entitlements }) => entitlements && Object.keys(entitlements).length,
      );

      if (!accountsWithEntitlements.length) {
        this.logger.log(
          `Batch '${iteration}' has no customers with entitlements`,
        );
        continue;
      }

      await Promise.all(
        accountsWithEntitlements.flatMap((account) =>
          Object.entries(account.entitlements!).map(([type, data]) =>
            this.accountFacade.upsertAccountEntitlement({
              type: type as EntitlementsTypes,
              accountId: account.accountId,
              purchasedAt: new Date(data.purchase_date),
              expiresAt: data.expires_date ? new Date(data.expires_date) : null,
            }),
          ),
        ),
      );
    }
  }
}
