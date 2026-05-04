import { HttpStatus } from '@nestjs/common';
import { TestApp } from '../../test-app';
import { FakeRevenueCatService } from '../../../src/lib/purchase/revenue-cat/fake-revenue-cat.service';
import { RevenueCatService } from '../../../src/lib/purchase';
import { EntitlementsTypes } from '@domain/account/domain/enums';

describe('Sync account entitlements (e2e)', () => {
  let app: TestApp;
  let fakeRevenueCatService: FakeRevenueCatService;

  beforeEach((context) => {
    app = context.app;
    fakeRevenueCatService =
      app.getProvider<FakeRevenueCatService>(RevenueCatService);
  });

  afterEach(() => {
    fakeRevenueCatService.reset();
  });

  it('given account without subscription info, syncing entitlements should return non-premium status', async () => {
    const user = await app.signedInVerifiedAccount({
      premiumEntitlement: false,
    });

    const response = await user.accountAPI.syncMyEntitlements();

    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual({
      id: user.id,
      isPremium: false,
    });
  });

  it('given active subscription in RevenueCat, syncing entitlements should mark account as premium', async () => {
    const user = await app.signedInVerifiedAccount({
      premiumEntitlement: false,
    });
    const purchasedAt = new Date();
    const expiresAt = new Date(purchasedAt.getTime() + 24 * 60 * 60 * 1000);
    fakeRevenueCatService.setCustomerEntitlements(user.id, {
      [EntitlementsTypes.Premium]: { purchasedAt, expiresAt },
    });

    const response = await user.accountAPI.syncMyEntitlements();

    expect(fakeRevenueCatService.getLastRequestedAppUserId()).toEqual(user.id);
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual({
      id: user.id,
      isPremium: true,
    });
  });

  it('given existing entitlement that already expired, syncing entitlements should return non-premium status', async () => {
    const user = await app.signedInVerifiedAccount({
      premiumEntitlement: false,
    });

    const purchasedAt = new Date('2023-01-01T00:00:00.000Z');
    const expiresAt = new Date('2023-02-01T00:00:00.000Z');
    fakeRevenueCatService.setCustomerEntitlements(user.id, {
      [EntitlementsTypes.Premium]: { purchasedAt, expiresAt },
    });

    const response = await user.accountAPI.syncMyEntitlements();

    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual({
      id: user.id,
      isPremium: false,
    });
  });

  it('given entitlement without expiration date, syncing entitlements should keep premium status', async () => {
    const user = await app.signedInVerifiedAccount({
      premiumEntitlement: false,
    });

    const requestDate = new Date();
    const customer = {
      request_date: requestDate.toISOString(),
      request_date_ms: requestDate.getTime(),
      subscriber: {
        entitlements: {
          [EntitlementsTypes.Premium]: {
            product_identifier: `${EntitlementsTypes.Premium}-lifetime`,
            purchase_date: '2024-01-01T00:00:00.000Z',
            expires_date: null,
            grace_period_expires_date: null,
          },
        },
        first_seen: requestDate.toISOString(),
        management_url: 'https://example.com',
        non_subscriptions: {},
        original_app_user_id: user.id,
        original_application_version: '1.0.0',
        original_purchase_date: '2024-01-01T00:00:00.000Z',
        subscriptions: {},
      },
    };
    fakeRevenueCatService.setCustomer(user.id, customer);

    const response = await user.accountAPI.syncMyEntitlements();

    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toEqual({
      id: user.id,
      isPremium: true,
    });
  });
});
