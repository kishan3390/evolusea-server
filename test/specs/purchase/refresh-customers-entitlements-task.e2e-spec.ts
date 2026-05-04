import { TestApp } from '../../test-app';
import { SignedInAccount } from '../../test-app/account/signed-in-account';
import { RefreshCustomersEntitlementsTask } from '@domain/purchase/infrastructure/tasks/refresh-customers-entitlements.task';
import { AccountEntitlementRepository } from '@domain/account/domain/repositories';
import { Pagination } from '@building-blocks/application';
import { EntitlementsTypes } from '@domain/account/domain/enums';
import { RevenueCatService } from '../../../src/lib/purchase';
import { FakeRevenueCatService } from '../../../src/lib/purchase/revenue-cat/fake-revenue-cat.service';
import { AccountFacade } from '@domain/account/account.facade';
import { afterEach } from 'vitest';

describe('Refresh customers entitlements (e2e)', () => {
  let app: TestApp;
  let user: SignedInAccount;
  let task: RefreshCustomersEntitlementsTask;
  let entitlementRepository: AccountEntitlementRepository;
  let fakeRevenueCatService: FakeRevenueCatService;

  beforeEach(async (context) => {
    app = context.app;
    task = app.getProvider(RefreshCustomersEntitlementsTask);
    entitlementRepository = app.getProvider(AccountEntitlementRepository);
    fakeRevenueCatService =
      app.getProvider<FakeRevenueCatService>(RevenueCatService);

    user = await app.signedInVerifiedAccount({ premiumEntitlement: false });
  });

  afterEach(() => {
    fakeRevenueCatService.reset();
  });

  it('given account with no entitlements and no subscription, should not create entitlement', async () => {
    await task.execute();

    const entitlements = await entitlementRepository.list(
      { accountId: user.id },
      Pagination.unlimited(),
    );
    expect(entitlements.items).toHaveLength(0);
  });

  it('given account with no entitlements and started subscription, should create new entitlement', async () => {
    const purchasedAt = new Date('2024-01-01T00:00:00.000Z');
    const expiresAt = new Date('2024-03-01T00:00:00.000Z');
    fakeRevenueCatService.setCustomerEntitlements(user.id, {
      [EntitlementsTypes.Premium]: { purchasedAt, expiresAt },
    });

    await task.execute();

    const entitlements = await entitlementRepository.list(
      { accountId: user.id },
      Pagination.unlimited(),
    );
    expect(entitlements.items).toHaveLength(1);
    const entitlement = entitlements.items[0];
    expect(entitlement.getType()).toEqual(EntitlementsTypes.Premium);
    expect(entitlement.getPurchasedAt().toISOString()).toEqual(
      purchasedAt.toISOString(),
    );
    expect(entitlement.getExpiresAt()?.toISOString()).toEqual(
      expiresAt.toISOString(),
    );
  });

  it('given account with entitlements and started subscription, should update existing entitlement', async () => {
    const accountFacade = app.getProvider(AccountFacade);

    const initialPurchasedAt = new Date('2024-01-01T00:00:00.000Z');
    const initialExpiresAt = new Date('2024-03-01T00:00:00.000Z');
    await accountFacade.replaceEntitlements({
      accountId: user.id,
      entitlements: {
        [EntitlementsTypes.Premium]: {
          purchasedAt: initialPurchasedAt,
          expiresAt: initialExpiresAt,
        },
      },
    });

    const refreshedExpiresAt = new Date('2024-04-01T00:00:00.000Z');
    fakeRevenueCatService.setCustomerEntitlements(user.id, {
      [EntitlementsTypes.Premium]: {
        purchasedAt: initialPurchasedAt,
        expiresAt: refreshedExpiresAt,
      },
    });

    await task.execute();

    const entitlements = await entitlementRepository.list(
      { accountId: user.id },
      Pagination.unlimited(),
    );
    expect(entitlements.items).toHaveLength(1);
    const entitlement = entitlements.items[0];
    expect(entitlement.getExpiresAt()?.toISOString()).toEqual(
      refreshedExpiresAt.toISOString(),
    );
    expect(entitlement.getPurchasedAt().toISOString()).toEqual(
      initialPurchasedAt.toISOString(),
    );
  });

  it('given account with no entitlement and subscription for another account, should not create entitlement', async () => {
    const anotherUser = await app.signedInVerifiedAccount({
      premiumEntitlement: false,
    });
    const purchasedAt = new Date('2024-05-01T00:00:00.000Z');
    const expiresAt = new Date('2024-06-01T00:00:00.000Z');
    fakeRevenueCatService.setCustomerEntitlements(anotherUser.id, {
      [EntitlementsTypes.Premium]: { purchasedAt, expiresAt },
    });

    await task.execute();

    const currentUserEntitlements = await entitlementRepository.list(
      { accountId: user.id },
      Pagination.unlimited(),
    );
    expect(currentUserEntitlements.items).toHaveLength(0);

    const anotherUserEntitlements = await entitlementRepository.list(
      { accountId: anotherUser.id },
      Pagination.unlimited(),
    );
    expect(anotherUserEntitlements.items).toHaveLength(1);
    const entitlement = anotherUserEntitlements.items[0];
    expect(entitlement.getType()).toEqual(EntitlementsTypes.Premium);
    expect(entitlement.getPurchasedAt().toISOString()).toEqual(
      purchasedAt.toISOString(),
    );
    expect(entitlement.getExpiresAt()?.toISOString()).toEqual(
      expiresAt.toISOString(),
    );
  });
});
