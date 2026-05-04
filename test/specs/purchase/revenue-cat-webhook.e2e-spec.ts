import { HttpStatus } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { TestApp } from '../../test-app';
import { ConfigProvider } from '@config';
import { EntitlementsTypes } from '@domain/account/domain/enums';
import {
  RevenueCatService,
  RevenueCatWebhookEventTypes,
} from '../../../src/lib/purchase';
import { RevenueCatWebhookDto } from '../../../src/http-app/purchase/dto';
import { purchaseApi, PurchaseAPI } from '../../helpers/apis/purchase-api';
import { afterEach, describe } from 'vitest';
import { FakeRevenueCatService } from '../../../src/lib/purchase/revenue-cat/fake-revenue-cat.service';
import { Repository } from 'typeorm';
import { AccountEntitlementEntity } from '@domain/account/infrastructure';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('RevenueCat webhook (e2e)', () => {
  let app: TestApp;
  let entitlementsRepository: Repository<AccountEntitlementEntity>;
  let fakeRevenueCatService: FakeRevenueCatService;
  let purchaseAPI: PurchaseAPI;

  beforeEach((context) => {
    app = context.app as TestApp;
    entitlementsRepository = app.getProvider(
      getRepositoryToken(AccountEntitlementEntity),
    );
    fakeRevenueCatService =
      app.getProvider<FakeRevenueCatService>(RevenueCatService);
    purchaseAPI = purchaseApi(app);
  });

  afterEach(() => {
    fakeRevenueCatService.reset();
  });

  it('given no webhook key in request for any event type, should fail', async () => {
    const user = await app.signedInVerifiedAccount();
    const payload: RevenueCatWebhookDto = {
      api_version: '1',
      event: {
        type: RevenueCatWebhookEventTypes.Cancellation,
        id: uuid(),
        app_id: 'app-id',
        event_timestamp_ms: Date.now(),
        app_user_id: user.id,
        original_app_user_id: user.id,
        aliases: ['alias'],
        environment: 'SANDBOX',
        store: 'APP_STORE',
        subscriber_attributes: {},
      },
    };
    const response = await purchaseAPI.sendRevenueCatWebhook(payload);

    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
  });

  describe.for([
    [RevenueCatWebhookEventTypes.Test],
    [RevenueCatWebhookEventTypes.InitialPurchase],
    [RevenueCatWebhookEventTypes.NonRenewingPurchase],
    [RevenueCatWebhookEventTypes.Renewal],
    [RevenueCatWebhookEventTypes.ProductChange],
    [RevenueCatWebhookEventTypes.Cancellation],
    [RevenueCatWebhookEventTypes.BillingIssue],
    [RevenueCatWebhookEventTypes.SubscriberAlias],
    [RevenueCatWebhookEventTypes.SubscriptionPaused],
    [RevenueCatWebhookEventTypes.Uncancellation],
    [RevenueCatWebhookEventTypes.SubscriptionExtended],
    [RevenueCatWebhookEventTypes.Expiration],
    [RevenueCatWebhookEventTypes.TemporaryEntitlementGrant],
    [RevenueCatWebhookEventTypes.InvoiceIssuance],
    [RevenueCatWebhookEventTypes.VirtualCurrencyTransaction],
    [RevenueCatWebhookEventTypes.ExperimentEnrollment],
  ] as const)('webhook event %s', ([type]) => {
    it('given RevenueCat anonymous user, should not create any entitlements', async () => {
      const response = await purchaseAPI.sendRevenueCatWebhook(
        {
          api_version: '1',
          event: {
            type,
            id: uuid(),
            app_id: 'app-id',
            event_timestamp_ms: Date.now(),
            app_user_id: '$RCAnonymousID:14eb8f236b054d8daf1f29163120aa87',
            original_app_user_id:
              '$RCAnonymousID:14eb8f236b054d8daf1f29163120aa87',
            aliases: ['alias'],
            environment: 'SANDBOX',
            store: 'APP_STORE',
            subscriber_attributes: {},
          },
        },
        { apiKey: ConfigProvider.revenueCat.webhookKey },
      );
      expect(response.status).toEqual(HttpStatus.OK);

      await app.eventEmitter.waitForAll();

      const entitlementsCount = await entitlementsRepository.count();
      expect(entitlementsCount).toEqual(0);
    });

    it('given non existing user, should not create any entitlements', async () => {
      const accountId = uuid();
      const response = await purchaseAPI.sendRevenueCatWebhook(
        {
          api_version: '1',
          event: {
            type,
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
        },
        { apiKey: ConfigProvider.revenueCat.webhookKey },
      );
      expect(response.status).toEqual(HttpStatus.OK);

      await app.eventEmitter.waitForAll();

      const entitlementsCount = await entitlementsRepository.count();
      expect(entitlementsCount).toEqual(0);
    });

    it('given user with no entitlements and webhook with new ones, should create entitlements', async () => {
      const user = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });
      const purchasedAt = new Date('2024-01-01T00:00:00.000Z');
      const expiresAt = new Date('2024-02-01T00:00:00.000Z');

      fakeRevenueCatService.setCustomerEntitlements(user.id, {
        [EntitlementsTypes.Premium]: { purchasedAt, expiresAt },
      });

      const response = await purchaseAPI.sendRevenueCatWebhook(
        {
          api_version: '1',
          event: {
            type,
            id: uuid(),
            app_id: 'app-id',
            event_timestamp_ms: Date.now(),
            app_user_id: user.id,
            original_app_user_id: user.id,
            aliases: ['alias'],
            environment: 'SANDBOX',
            store: 'APP_STORE',
            subscriber_attributes: {},
          },
        },
        { apiKey: ConfigProvider.revenueCat.webhookKey },
      );
      expect(response.status).toEqual(HttpStatus.OK);

      await app.eventEmitter.waitForAll();

      const entitlements = await entitlementsRepository.find({
        where: { accountId: user.id },
      });
      expect(entitlements).toHaveLength(1);

      const entitlement = entitlements[0];
      expect(entitlement.type).toEqual(EntitlementsTypes.Premium);
      expect(entitlement.purchasedAt.toISOString()).toEqual(
        purchasedAt.toISOString(),
      );
      expect(entitlement.expiresAt?.toISOString()).toEqual(
        expiresAt.toISOString(),
      );
    });

    it('given user with entitlements and webhook with none, should remove entitlements', async () => {
      const user = await app.signedInVerifiedAccount();
      const purchasedAt = new Date('2024-01-01T00:00:00.000Z');
      const expiresAt = new Date('2024-02-01T00:00:00.000Z');

      fakeRevenueCatService.setCustomerEntitlements(user.id, {
        [EntitlementsTypes.Premium]: { purchasedAt, expiresAt },
      });

      await purchaseAPI.sendRevenueCatWebhook(
        {
          api_version: '1',
          event: {
            type,
            id: uuid(),
            app_id: 'app-id',
            event_timestamp_ms: Date.now(),
            app_user_id: user.id,
            original_app_user_id: user.id,
            aliases: ['alias'],
            environment: 'SANDBOX',
            store: 'APP_STORE',
            subscriber_attributes: {},
          },
        },
        { apiKey: ConfigProvider.revenueCat.webhookKey },
      );

      await app.eventEmitter.waitForAll();

      fakeRevenueCatService.setCustomerEntitlements(user.id, {});

      const response = await purchaseAPI.sendRevenueCatWebhook(
        {
          api_version: '1',
          event: {
            type: RevenueCatWebhookEventTypes.InitialPurchase,
            id: uuid(),
            app_id: 'app-id',
            event_timestamp_ms: Date.now(),
            app_user_id: user.id,
            original_app_user_id: user.id,
            aliases: ['alias'],
            environment: 'SANDBOX',
            store: 'APP_STORE',
            subscriber_attributes: {},
          },
        },
        { apiKey: ConfigProvider.revenueCat.webhookKey },
      );
      expect(response.status).toEqual(HttpStatus.OK);

      await app.eventEmitter.waitForAll();

      const entitlementsCount = await entitlementsRepository.count();
      expect(entitlementsCount).toEqual(0);
    });
  });

  describe(`webhook event ${RevenueCatWebhookEventTypes.Transfer}`, () => {
    it('given anonymous user transferring subscription, should not create any entitlement', async () => {
      const accountId = uuid();
      const response = await purchaseAPI.sendRevenueCatWebhook(
        {
          api_version: '1',
          event: {
            type: RevenueCatWebhookEventTypes.Transfer,
            id: uuid(),
            app_id: 'app-id',
            event_timestamp_ms: Date.now(),
            environment: 'SANDBOX',
            store: 'APP_STORE',
            subscriber_attributes: {},
            transferred_from: [
              '$RCAnonymousID:5d205b2b110e4f16b709794fd68ac3d8',
            ],
            transferred_to: ['$RCAnonymousID:at685b2b110e4f16b709794fd68ac361'],
          },
        },
        { apiKey: ConfigProvider.revenueCat.webhookKey },
      );
      expect(response.status).toEqual(HttpStatus.OK);

      await app.eventEmitter.waitForAll();

      const entitlementsCount = await entitlementsRepository.count();
      expect(entitlementsCount).toEqual(0);
    });

    it('given user transferring subscription to another account and none of them exist, should not create any entitlement', async () => {
      const accountId = uuid();
      const response = await purchaseAPI.sendRevenueCatWebhook(
        {
          api_version: '1',
          event: {
            type: RevenueCatWebhookEventTypes.Transfer,
            id: uuid(),
            app_id: 'app-id',
            event_timestamp_ms: Date.now(),
            environment: 'SANDBOX',
            store: 'APP_STORE',
            subscriber_attributes: {},
            transferred_from: [uuid()],
            transferred_to: [uuid()],
          },
        },
        { apiKey: ConfigProvider.revenueCat.webhookKey },
      );
      expect(response.status).toEqual(HttpStatus.OK);

      await app.eventEmitter.waitForAll();

      const entitlements = await entitlementsRepository.count();
      expect(entitlements).toEqual(0);
    });

    it('given user transferring subscription to another account, should remove entitlements from old account and create entitlements for new one', async () => {
      const user1 = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });
      const user2 = await app.signedInVerifiedAccount({
        premiumEntitlement: false,
      });
      const purchasedAt = new Date('2024-01-01T00:00:00.000Z');
      const expiresAt = new Date('2024-02-01T00:00:00.000Z');

      fakeRevenueCatService.setCustomerEntitlements(user1.id, {
        [EntitlementsTypes.Premium]: { purchasedAt, expiresAt },
      });

      const createInitialEntitlement = await purchaseAPI.sendRevenueCatWebhook(
        {
          api_version: '1',
          event: {
            type: RevenueCatWebhookEventTypes.Renewal,
            id: uuid(),
            app_id: 'app-id',
            event_timestamp_ms: Date.now(),
            app_user_id: user1.id,
            original_app_user_id: user1.id,
            aliases: ['alias'],
            environment: 'SANDBOX',
            store: 'APP_STORE',
            subscriber_attributes: {},
          },
        },
        { apiKey: ConfigProvider.revenueCat.webhookKey },
      );
      expect(createInitialEntitlement.status).toEqual(HttpStatus.OK);

      await app.eventEmitter.waitForAll();

      const initialEntitlements1 = await entitlementsRepository.find({
        where: { accountId: user1.id },
      });
      expect(initialEntitlements1).toHaveLength(1);
      const initialEntitlements2 = await entitlementsRepository.find({
        where: { accountId: user2.id },
      });
      expect(initialEntitlements2).toHaveLength(0);

      fakeRevenueCatService.setCustomerEntitlements(user1.id, {});
      fakeRevenueCatService.setCustomerEntitlements(user2.id, {
        [EntitlementsTypes.Premium]: { purchasedAt, expiresAt },
      });

      const response = await purchaseAPI.sendRevenueCatWebhook(
        {
          api_version: '1',
          event: {
            type: RevenueCatWebhookEventTypes.Transfer,
            id: uuid(),
            app_id: 'app-id',
            event_timestamp_ms: Date.now(),
            environment: 'SANDBOX',
            store: 'APP_STORE',
            subscriber_attributes: {},
            transferred_from: [user1.id],
            transferred_to: [user2.id],
          },
        },
        { apiKey: ConfigProvider.revenueCat.webhookKey },
      );
      expect(response.status).toEqual(HttpStatus.OK);

      await app.eventEmitter.waitForAll();

      const entitlements1 = await entitlementsRepository.find(
        {where:{ accountId: user1.id }},
      );
      expect(entitlements1).toHaveLength(0);
      const entitlements2 = await entitlementsRepository.find(
        {where: { accountId: user2.id }},
      );
      expect(entitlements2).toHaveLength(1);
      const entitlement2 = entitlements2[0];
      expect(entitlement2.type).toEqual(EntitlementsTypes.Premium);
      expect(entitlement2.purchasedAt.toISOString()).toEqual(
        purchasedAt.toISOString(),
      );
      expect(entitlement2.expiresAt?.toISOString()).toEqual(
        expiresAt.toISOString(),
      );
    });
  });
});
