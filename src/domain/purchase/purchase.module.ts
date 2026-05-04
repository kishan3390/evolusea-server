import { Module } from '@nestjs/common';
import { PurchaseFacade } from '@domain/purchase/purchase.facade';
import { EventEmitterModule } from '../../event-emitter';
import {
  RefreshAccountEntitlementsFromRevenueCatCommandHandler,
  RevenueCatWebhookTriggeredEventHandler,
} from '@domain/purchase/application';
import { RevenueCatModule } from '../../lib/purchase';
import { AccountModule } from '@domain/account/account.module';
import { RefreshCustomersEntitlementsTask } from '@domain/purchase/infrastructure/tasks/refresh-customers-entitlements.task';
import { DistributedLockModule } from '../../distributed-lock';

@Module({
  imports: [
    EventEmitterModule,
    RevenueCatModule,
    AccountModule,
    DistributedLockModule,
  ],
  providers: [
    PurchaseFacade,
    RevenueCatWebhookTriggeredEventHandler,
    RefreshCustomersEntitlementsTask,
    RefreshAccountEntitlementsFromRevenueCatCommandHandler,
  ],
  exports: [PurchaseFacade],
})
export class PurchaseModule {}
