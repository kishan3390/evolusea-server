export interface GetQuotesQuotaQuery {
  accountIsPremium: boolean;
  userProfileId: string;
}

export interface GetQuotesQuotaQueryResult {
  dailyLimit: number;
  browseAllowed: boolean;
}
