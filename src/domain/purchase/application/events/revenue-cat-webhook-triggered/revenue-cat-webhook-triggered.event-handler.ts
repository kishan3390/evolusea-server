import { RevenueCatWebhookTriggeredEvent } from './revenue-cat-webhook-triggered.event';
import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../../../../event-emitter/event-handler';
import { RevenueCatWebhookEventTypes } from '../../../../../lib/purchase';
import {
  RevenueCatWebhookEvent,
  RevenueCatWebhookTransferEventDto,
} from '../../../../../http-app/purchase/dto';
import { RefreshAccountEntitlementsFromRevenueCatCommandHandler } from '../../commands/refresh-account-entitlements-from-revenue-cat';
import { EventEmitter } from '../../../../../event-emitter';

@Injectable()
export class RevenueCatWebhookTriggeredEventHandler extends EventHandler<RevenueCatWebhookTriggeredEvent> {
  event = RevenueCatWebhookTriggeredEvent;

  constructor(
    eventEmitter: EventEmitter,
    private readonly refreshAccountEntitlementsFromRevenueCatCommandHandler: RefreshAccountEntitlementsFromRevenueCatCommandHandler,
  ) {
    super(eventEmitter);
  }

  async handle(payload: RevenueCatWebhookEvent): Promise<void> {
    this.logger.log(`Handling webhook triggered event '${payload.type}'`);

    switch (payload.type) {
      case RevenueCatWebhookEventTypes.Transfer: {
        return this.handleTransferEvent(payload);
      }
      default: {
        if (this.isRevenueCatAnonymousId(payload.app_user_id)) {
          this.logger.warn(
            `App user id '${payload.app_user_id}' is anonymous. Skipping refreshing entitlements.`,
          );
          return;
        }

        await this.refreshAccountEntitlementsFromRevenueCatCommandHandler.handle(
          {
            accountId: payload.app_user_id,
          },
        );
      }
    }
  }

  private async handleTransferEvent(
    payload: RevenueCatWebhookTransferEventDto,
  ): Promise<void> {
    const idsToRefresh = [
      ...payload.transferred_from,
      ...payload.transferred_to,
    ].filter((id) => !this.isRevenueCatAnonymousId(id));

    await Promise.all(
      idsToRefresh.map((accountId) =>
        this.refreshAccountEntitlementsFromRevenueCatCommandHandler.handle({
          accountId,
        }),
      ),
    );
  }

  private isRevenueCatAnonymousId(id: string): boolean {
    return id.startsWith('$RCAnonymousID:');
  }
}
