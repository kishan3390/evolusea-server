import { GetIsPremiumAccountQueryResult } from '@domain/account/application';

export class AccountEntitlementsRefreshDto {
  id: string;
  isPremium: boolean;

  static fromEntity(
    account: GetIsPremiumAccountQueryResult,
  ): AccountEntitlementsRefreshDto {
    return {
      id: account.accountId,
      isPremium: account.isPremium,
    };
  }
}
