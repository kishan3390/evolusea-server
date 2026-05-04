import { Injectable } from '@nestjs/common';
import { RevenueCatCustomerV1 } from './models';
import { EntitlementsTypes } from '@domain/account/domain/enums';

@Injectable()
export class FakeRevenueCatService {
  private customers = new Map<string, RevenueCatCustomerV1 | null>();
  private requestedIds: string[] = [];

  setCustomer(appUserId: string, customer: RevenueCatCustomerV1 | null) {
    this.customers.set(appUserId, customer);
  }

  setCustomerEntitlements(
    accountId: string,
    entitlements:
      | Record<EntitlementsTypes, { purchasedAt: Date; expiresAt: Date }>
      | Record<never, never>,
  ) {
    this.buildCustomerInfo(accountId, entitlements);
    this.setCustomer(
      accountId,
      this.buildCustomerInfo(accountId, entitlements),
    );
  }

  reset() {
    this.customers.clear();
    this.requestedIds = [];
  }

  getLastRequestedAppUserId(): string | undefined {
    return this.requestedIds[this.requestedIds.length - 1];
  }

  async getCustomerByAppUserIdV1(
    appUserId: string,
  ): Promise<RevenueCatCustomerV1 | null> {
    this.requestedIds.push(appUserId);
    if (!this.customers.has(appUserId)) {
      return null;
    }

    return this.customers.get(appUserId) ?? null;
  }

  private buildCustomerInfo(
    accountId: string,
    entitlements:
      | Record<EntitlementsTypes, { purchasedAt: Date; expiresAt: Date }>
      | Record<never, never>,
  ): RevenueCatCustomerV1 {
    const now = new Date();
    const mappedEntitlements = Object.entries(entitlements).reduce(
      (acc, [type, dates]) => {
        acc[type] = {
          expires_date: dates.expiresAt.toISOString(),
          grace_period_expires_date: null,
          product_identifier: `${type}-product`,
          purchase_date: dates.purchasedAt.toISOString(),
        };
        return acc;
      },
      {} as RevenueCatCustomerV1['subscriber']['entitlements'],
    );

    return {
      request_date: now.toISOString(),
      request_date_ms: now.getTime(),
      subscriber: {
        entitlements: mappedEntitlements,
        first_seen: now.toISOString(),
        management_url: 'https://example.com',
        non_subscriptions: {},
        original_app_user_id: accountId,
        original_application_version: '1.0.0',
        original_purchase_date: now.toISOString(),
        subscriptions: {},
      },
    };
  }
}
