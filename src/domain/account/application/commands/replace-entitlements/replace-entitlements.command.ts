import { EntitlementsTypes } from '@domain/account/domain/enums';

export interface ReplaceEntitlementsCommand {
  accountId: string;
  entitlements: Record<EntitlementsTypes, ReplaceEntitlementsCommandEntry>;
}

export interface ReplaceEntitlementsCommandEntry {
  expiresAt: Date | null;
  purchasedAt: Date;
}
