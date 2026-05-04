import { RevenueCatWebhookDto } from '../../../src/http-app/purchase/dto';
import { ApiResponse } from '../api-response';
import { TestApp } from '../../test-app';
import { EntitlementsTypes } from '@domain/account/domain/enums';
import {
  RevenueCatService,
  RevenueCatWebhookEventTypes,
} from '../../../src/lib/purchase';
import { v4 as uuid } from 'uuid';
import { ConfigProvider } from '@config';
import { FakeRevenueCatService } from '../../../src/lib/purchase/revenue-cat/fake-revenue-cat.service';

interface RevenueCatWebhookOptions {
  apiKey?: string;
}

export function purchaseApi(app: TestApp) {
  return {
    async sendRevenueCatWebhook(
      dto: RevenueCatWebhookDto,
      options: RevenueCatWebhookOptions = {},
    ): Promise<ApiResponse<void>> {
      const request = app
        .supertestRequest()
        .post('/purchases/webhooks/revenue-cat');
      if (options.apiKey !== undefined) {
        request.set('authorization', options.apiKey);
      }

      return await request.send(dto);
    },

    async setPremiumEntitlement(accountId: string) {
      const fakeRevenueCatService =
        app.getProvider<FakeRevenueCatService>(RevenueCatService);

      fakeRevenueCatService.setCustomerEntitlements(accountId, {
        [EntitlementsTypes.Premium]: {
          purchasedAt: new Date(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        },
      });

      const response = await this.sendRevenueCatWebhook(
        {
          api_version: '1',
          event: {
            type: RevenueCatWebhookEventTypes.InitialPurchase,
            id: uuid(),
            app_id: 'app-id',
            event_timestamp_ms: Date.now(),
            app_user_id: accountId,
            original_app_user_id: accountId,
            aliases: ['alias'],
            environment: 'SANDBOX',
            store: 'APP_STORE',
            subscriber_attributes: {},
          },
        } satisfies RevenueCatWebhookDto,
        { apiKey: ConfigProvider.revenueCat.webhookKey },
      );

      await app.eventEmitter.waitForAll();
      fakeRevenueCatService.reset();

      return response;
    },
  };
}

export type PurchaseAPI = ReturnType<typeof purchaseApi>;
