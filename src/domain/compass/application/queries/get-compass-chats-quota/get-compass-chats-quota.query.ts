export interface GetCompassChatsQuotaQuery {
  accountIsPremium: boolean;
  userProfileId: string;
  now?: Date;
}

export interface GetCompassChatsQuotaQueryResult {
  create: {
    isAllowed: boolean;
    limit: number | null;
    remaining: number | null;
  };
}
