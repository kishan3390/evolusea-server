import { EntitlementsTypes } from '@domain/account/domain/enums';

export interface UpsertAccountEntitlementCommand {
  accountId: string;
  type: EntitlementsTypes;
  purchasedAt: Date;
  expiresAt: Date | null;
}
